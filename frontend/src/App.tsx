import { useState } from 'react'
import { session } from './lib/api'
import type { AuthResponse } from './lib/types'
import { LoginPage } from './pages/LoginPage'
import { UserApp } from './pages/UserApp'
import { AdminApp } from './pages/AdminApp'

export default function App() {
  const [role, setRole] = useState(session.role())
  const loggedIn = (auth: AuthResponse) => setRole(auth.role)
  const logout = () => { session.clear(); setRole(null) }
  const adminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  if (!adminRoute) return <UserApp />
  if (role === 'ADMIN') return <AdminApp onLogout={logout} />
  return <LoginPage onLogin={loggedIn} />
}
