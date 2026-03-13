import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import DashboardPage from '@/routes/dashboard'
import ContactsPage from '@/routes/contacts/index'
import ContactDetailPage from '@/routes/contacts/detail'
import TagsPage from '@/routes/tags'
import PluginsPage from '@/routes/plugins'
import ApiReferencePage from '@/routes/api-reference'
import LoginPage from '@/routes/login'
import CallbackPage from '@/routes/callback'
import { isAuthenticated } from '@/lib/auth'
import '@/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/contacts/:id" element={<ContactDetailPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/api-reference" element={<ApiReferencePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
    </QueryClientProvider>
  </React.StrictMode>
)
