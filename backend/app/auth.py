import time
import httpx
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from jose import jwt, JWTError

from app.config import settings

_bearer = HTTPBearer(auto_error=False)
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# JWKS cache: (keys_list, fetched_at)
_jwks_cache: tuple[list, float] | None = None
_JWKS_TTL = 3600

# Userinfo cache: sub -> (email, cached_at)
_userinfo_cache: dict[str, tuple[str, float]] = {}
_USERINFO_TTL = 300  # re-check email every 5 minutes


async def _get_jwks() -> list:
    global _jwks_cache
    now = time.time()
    if _jwks_cache is None or now - _jwks_cache[1] > _JWKS_TTL:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.OIDC_ISSUER}/.well-known/jwks.json", timeout=10)
            resp.raise_for_status()
            _jwks_cache = (resp.json()["keys"], now)
    return _jwks_cache[0]


def _find_key(keys: list, kid: str | None) -> dict:
    for k in keys:
        if kid is None or k.get("kid") == kid:
            return k
    raise JWTError(f"No matching key for kid={kid}")


async def _get_email_for_token(token: str, sub: str) -> str:
    now = time.time()
    if sub in _userinfo_cache:
        email, cached_at = _userinfo_cache[sub]
        if now - cached_at < _USERINFO_TTL:
            return email

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.OIDC_ISSUER}/api/oidc/userinfo",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

    email = data.get("email", "")
    _userinfo_cache[sub] = (email, now)
    return email


async def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    api_key: str | None = Security(_api_key_header),
) -> dict:
    # Static API key (for MCP / CLI)
    if api_key:
        if settings.API_KEY and api_key == settings.API_KEY:
            return {"email": settings.ALLOWED_EMAIL, "auth": "api_key"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

    # OIDC Bearer JWT
    if credentials:
        token = credentials.credentials
        try:
            header = jwt.get_unverified_header(token)
            keys = await _get_jwks()
            key = _find_key(keys, header.get("kid"))
            payload = jwt.decode(
                token, key,
                algorithms=[header.get("alg", "RS256")],
                options={"verify_aud": False},
            )
            sub = payload.get("sub", "")
            email = await _get_email_for_token(token, sub)
            if email != settings.ALLOWED_EMAIL:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not permitted")
            return {"email": email, "auth": "oidc"}
        except JWTError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
