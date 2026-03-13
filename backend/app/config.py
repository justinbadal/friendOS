from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="config/.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "local"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "friendos"
    DB_USER: str = "friendos"
    DB_PASSWORD: str = "friendos"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    OIDC_ISSUER: str = "https://id.fmmd.me"
    ALLOWED_EMAIL: str = "justin@badal.me"
    API_KEY: str = ""

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()
