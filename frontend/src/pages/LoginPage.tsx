import { useState } from 'react'
import { ArrowRight, Check, Dumbbell, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '../components/Logo'
import { api, session } from '../lib/api'
import type { AuthResponse } from '../lib/types'

export function LoginPage({ onLogin }: { onLogin: (auth: AuthResponse) => void }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Fit@2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const complete = (auth: AuthResponse) => { session.save(auth); onLogin(auth) }
  const adminLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      complete(await api<AuthResponse>('/api/auth/admin', {
        method: 'POST', body: JSON.stringify({ username, password }),
      }))
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }

  return (
    <main className="login-shell">
      <section className="login-story">
        <Logo />
        <div className="story-copy">
          <span className="eyebrow"><Sparkles size={15} /> 让每一次训练都有回应</span>
          <h1>你的下一次<br /><em>蜕变</em>，从预约开始。</h1>
          <p>专业教练、灵活时段、清晰课时。把精力留给训练，其他交给燃动。</p>
          <div className="feature-row">
            <span><Check size={15} /> 实时查看课时</span>
            <span><Check size={15} /> 一键预约教练</span>
            <span><Check size={15} /> 会员由门店统一管理</span>
          </div>
        </div>
        <div className="visual-card">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <Dumbbell size={90} strokeWidth={1.3} />
          <span className="visual-number">01</span>
          <p>保持专注<br /><strong>持续进步</strong></p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <form className="login-content admin-form" onSubmit={adminLogin}>
              <span className="login-icon"><ShieldCheck size={25} /></span>
              <h2>管理员登录</h2>
              <p>录入会员与头像，管理教练、课时及全店预约。</p>
              <label>管理员账号<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
              <label>登录密码<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
              <button className="primary-button full" disabled={loading}>{loading ? '正在验证…' : '进入管理后台'} <ArrowRight size={18} /></button>
          </form>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <p className="login-footer">© 2026 燃动健身 · 用心对待每一次训练</p>
      </section>
    </main>
  )
}
