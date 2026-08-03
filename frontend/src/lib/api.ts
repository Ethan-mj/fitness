import type { AuthResponse } from './types'

const API = import.meta.env.VITE_API_BASE ?? ''
const TOKEN_KEY = 'fitness_token'
const ROLE_KEY = 'fitness_role'

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  role: () => localStorage.getItem(ROLE_KEY),
  save: (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(ROLE_KEY, auth.role)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
  },
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const token = session.token()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API}${path}`, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    if (response.status === 401 || response.status === 403) {
      if (response.status === 401) session.clear()
    }
    throw new Error(body.message || '请求失败，请稍后重试')
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T
  return response.json()
}
