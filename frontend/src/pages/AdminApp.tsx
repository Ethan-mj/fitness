import { useEffect, useState } from 'react'
import { CalendarDays, Camera, ChevronDown, ClipboardList, Dumbbell, LayoutDashboard, LogOut, Menu, Plus, Search, Users, X } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Toast, type ToastState } from '../components/Toast'
import { api } from '../lib/api'
import type { Booking, Coach, Dashboard, Member } from '../lib/types'

type AdminTab = 'dashboard' | 'members' | 'coaches' | 'bookings'
const dateTime = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))

export function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [dashboard, setDashboard] = useState<Dashboard>({ users: 0, coaches: 0, activeBookings: 0, lessonsRemaining: 0 })
  const [members, setMembers] = useState<Member[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<'member' | 'coach' | 'lessons' | 'slot' | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [mobileNav, setMobileNav] = useState(false)

  const load = async () => {
    try {
      const [d, m, c, b] = await Promise.all([
        api<Dashboard>('/api/admin/dashboard'), api<Member[]>('/api/admin/users'),
        api<Coach[]>('/api/admin/coaches'), api<Booking[]>('/api/admin/bookings'),
      ])
      setDashboard(d); setMembers(m); setCoaches(c); setBookings(b)
    } catch (e) { setToast({ type: 'error', message: (e as Error).message }) }
  }
  useEffect(() => { void load() }, [])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(id)
  }, [toast])
  const navigate = (next: AdminTab) => { setTab(next); setMobileNav(false) }
  const success = async (message: string) => { setModal(null); setToast({ type: 'success', message }); await load() }
  const filteredMembers = members.filter(m => m.nickname.toLowerCase().includes(query.toLowerCase()) || String(m.id).includes(query))

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="sidebar-top"><Logo /><button className="icon-button mobile-only" onClick={() => setMobileNav(false)} aria-label="关闭菜单"><X /></button></div>
        <nav>
          <p>工作台</p>
          <AdminNav active={tab === 'dashboard'} icon={<LayoutDashboard />} label="数据概览" onClick={() => navigate('dashboard')} />
          <p>门店管理</p>
          <AdminNav active={tab === 'members'} icon={<Users />} label="会员课时" onClick={() => navigate('members')} />
          <AdminNav active={tab === 'coaches'} icon={<Dumbbell />} label="教练管理" onClick={() => navigate('coaches')} />
          <AdminNav active={tab === 'bookings'} icon={<ClipboardList />} label="预约记录" onClick={() => navigate('bookings')} />
        </nav>
        <div className="sidebar-profile"><span>A</span><div><strong>管理员</strong><small>门店管理账号</small></div><button onClick={onLogout} aria-label="退出登录"><LogOut size={17} /></button></div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="关闭菜单" />}
      <main className="admin-main">
        <header className="admin-header">
          <button className="icon-button mobile-only" onClick={() => setMobileNav(true)} aria-label="打开菜单"><Menu /></button>
          <div><span>燃动健身 /</span> {tab === 'dashboard' ? '数据概览' : tab === 'members' ? '会员课时' : tab === 'coaches' ? '教练管理' : '预约记录'}</div>
          <button className="admin-account">管理员 <ChevronDown size={15} /></button>
        </header>
        <div className="admin-content">
          {tab === 'dashboard' && (
            <>
              <div className="admin-title"><div><span className="eyebrow">OVERVIEW</span><h1>数据概览</h1><p>掌握门店今天的运营情况。</p></div><span className="today">{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())}</span></div>
              <div className="metric-grid">
                <Metric label="会员总数" value={dashboard.users} unit="人" icon={<Users />} tone="orange" />
                <Metric label="在职教练" value={dashboard.coaches} unit="人" icon={<Dumbbell />} tone="navy" />
                <Metric label="待上课程" value={dashboard.activeBookings} unit="节" icon={<CalendarDays />} tone="green" />
                <Metric label="会员剩余课时" value={dashboard.lessonsRemaining} unit="节" icon={<ClipboardList />} tone="yellow" />
              </div>
              <div className="dashboard-grid">
                <section className="admin-card">
                  <div className="card-heading"><div><span>UPCOMING</span><h2>近期预约</h2></div><button onClick={() => setTab('bookings')}>查看全部</button></div>
                  <BookingTable bookings={bookings.filter(b => b.status === 'BOOKED').slice(0, 5)} />
                </section>
                <section className="admin-card quick-card">
                  <div className="card-heading"><div><span>QUICK ACTIONS</span><h2>快捷操作</h2></div></div>
                  <button onClick={() => setModal('member')}><span><Users /></span><div><strong>录入新会员</strong><small>上传头像并配置初始课时</small></div></button>
                  <button onClick={() => setModal('coach')}><span><Plus /></span><div><strong>添加新教练</strong><small>创建教练档案</small></div></button>
                  <button onClick={() => { setTab('members') }}><span><Users /></span><div><strong>配置会员课时</strong><small>增加或扣减课时</small></div></button>
                  <button onClick={() => setModal('slot')}><span><CalendarDays /></span><div><strong>开放预约时段</strong><small>安排教练可约时间</small></div></button>
                </section>
              </div>
            </>
          )}
          {tab === 'members' && (
            <>
              <div className="admin-title"><AdminPageTitle eyebrow="MEMBERS" title="会员管理" text="录入会员、维护头像并调整可用课时。" /><button className="primary-button" onClick={() => setModal('member')}><Plus size={18} /> 添加会员</button></div>
              <section className="admin-card table-card">
                <div className="table-tools"><div className="search-field"><Search size={18} /><input placeholder="搜索会员姓名或 ID" value={query} onChange={e => setQuery(e.target.value)} /></div></div>
                <div className="responsive-table"><table><thead><tr><th>会员</th><th>会员 ID</th><th>加入时间</th><th>剩余课时</th><th>操作</th></tr></thead><tbody>
                  {filteredMembers.map(m => <tr key={m.id}><td><div className="person-cell">{m.avatarUrl ? <img src={m.avatarUrl} alt="" /> : <span>{m.nickname.slice(0, 1)}</span>}<div><strong>{m.nickname}</strong>{m.phone && <small>{m.phone}</small>}</div></div></td><td>#{String(m.id).padStart(5, '0')}</td><td>{new Date(m.createdAt).toLocaleDateString('zh-CN')}</td><td><strong className="lesson-count">{m.remainingLessons}</strong> 节</td><td><button className="table-action" onClick={() => { setSelectedMember(m); setModal('lessons') }}>调整课时</button></td></tr>)}
                </tbody></table></div>
              </section>
            </>
          )}
          {tab === 'coaches' && (
            <>
              <div className="admin-title"><AdminPageTitle eyebrow="COACHES" title="教练管理" text="维护教练档案与可预约状态。" /><button className="primary-button" onClick={() => setModal('coach')}><Plus size={18} /> 添加教练</button></div>
              <div className="admin-coach-grid">{coaches.map((c, i) => <article className="admin-coach-card" key={c.id}><div className={`coach-portrait tone-${i % 3}`}>{c.avatarUrl || c.name.slice(0, 1)}</div><div className="coach-card-body"><span className={`availability ${c.active ? '' : 'off'}`}>{c.active ? '可预约' : '已停用'}</span><h2>{c.name}</h2><strong>{c.specialty}</strong><p>{c.introduction}</p><button className="outline-button" onClick={async () => { await api(`/api/admin/coaches/${c.id}/active?value=${!c.active}`, { method: 'PATCH' }); await success(c.active ? '教练已停用' : '教练已启用') }}>{c.active ? '停用教练' : '重新启用'}</button></div></article>)}</div>
            </>
          )}
          {tab === 'bookings' && (
            <>
              <AdminPageTitle eyebrow="BOOKINGS" title="预约记录" text="查看全店会员的预约及课程状态。" />
              <section className="admin-card table-card"><BookingTable bookings={bookings} full /></section>
            </>
          )}
        </div>
      </main>
      {modal === 'member' && <MemberModal onClose={() => setModal(null)} onSuccess={() => success('会员录入成功')} onError={m => setToast({ type: 'error', message: m })} />}
      {modal === 'coach' && <CoachModal onClose={() => setModal(null)} onSuccess={() => success('教练添加成功')} onError={m => setToast({ type: 'error', message: m })} />}
      {modal === 'lessons' && selectedMember && <LessonModal member={selectedMember} onClose={() => setModal(null)} onSuccess={() => success('会员课时已更新')} onError={m => setToast({ type: 'error', message: m })} />}
      {modal === 'slot' && <SlotModal coaches={coaches.filter(c => c.active)} onClose={() => setModal(null)} onSuccess={() => success('预约时段已开放')} onError={m => setToast({ type: 'error', message: m })} />}
      <Toast value={toast} onClose={() => setToast(null)} />
    </div>
  )
}

function AdminNav({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) { return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{label}</span></button> }
function Metric({ label, value, unit, icon, tone }: { label: string; value: number; unit: string; icon: React.ReactElement; tone: string }) { return <article className={`metric-card ${tone}`}><span className="metric-icon">{icon}</span><p>{label}</p><strong>{value.toLocaleString()} <small>{unit}</small></strong><span className="metric-line" /></article> }
function AdminPageTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="admin-page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div> }
function BookingTable({ bookings, full = false }: { bookings: Booking[]; full?: boolean }) {
  return <div className="responsive-table"><table><thead><tr><th>会员</th><th>教练 / 课程</th><th>日期时间</th>{full && <th>状态</th>}</tr></thead><tbody>{bookings.length ? bookings.map(b => <tr key={b.id}><td><div className="person-cell"><span>{b.userName?.slice(0, 1) || '会'}</span><strong>{b.userName}</strong></div></td><td><strong>{b.coachName}</strong><small>{b.specialty}</small></td><td>{dateTime(b.startTime)}</td>{full && <td><span className={`table-status ${b.status.toLowerCase()}`}>{b.status === 'BOOKED' ? '已预约' : b.status === 'COMPLETED' ? '已完成' : '已取消'}</span></td>}</tr>) : <tr><td colSpan={full ? 4 : 3} className="table-empty">暂无预约记录</td></tr>}</tbody></table></div>
}
function ModalFrame({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="关闭"><X /></button><span className="eyebrow">MANAGEMENT</span><h2>{title}</h2><p>{subtitle}</p>{children}</div></div> }
function MemberModal({ onClose, onSuccess, onError }: ModalProps) {
  const [nickname, setNickname] = useState(''); const [phone, setPhone] = useState(''); const [lessons, setLessons] = useState(0); const [avatar, setAvatar] = useState<File | null>(null)
  const preview = avatar ? URL.createObjectURL(avatar) : ''
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { const body = new FormData(); body.set('nickname', nickname); body.set('phone', phone); body.set('initialLessons', String(lessons)); if (avatar) body.set('avatar', avatar); await api('/api/admin/users', { method: 'POST', body }); onSuccess() } catch (err) { onError((err as Error).message) } }
  return <ModalFrame title="录入新会员" subtitle="会员无需注册，由门店统一建立档案。" onClose={onClose}><form className="modal-form" onSubmit={submit}><label className="avatar-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setAvatar(e.target.files?.[0] ?? null)} /><span className="avatar-preview">{preview ? <img src={preview} alt="头像预览" /> : <Camera size={26} />}</span><span><strong>{avatar ? '更换头像' : '上传会员头像'}</strong><small>JPG、PNG 或 WebP，最大 5MB</small></span></label><label>会员姓名<input required maxLength={50} value={nickname} onChange={e => setNickname(e.target.value)} placeholder="请输入会员姓名" /></label><label>联系电话（选填）<input maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="仅管理员可见" /></label><label>初始课时<input type="number" min="0" max="999" required value={lessons} onChange={e => setLessons(Number(e.target.value))} /></label><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>取消</button><button className="primary-button">确认录入</button></div></form></ModalFrame>
}
function CoachModal({ onClose, onSuccess, onError }: ModalProps) {
  const [form, setForm] = useState({ name: '', specialty: '', introduction: '', avatarUrl: '' })
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { await api('/api/admin/coaches', { method: 'POST', body: JSON.stringify(form) }); onSuccess() } catch (err) { onError((err as Error).message) } }
  return <ModalFrame title="添加新教练" subtitle="创建教练资料，稍后可单独开放预约时段。" onClose={onClose}><form className="modal-form" onSubmit={submit}><label>教练姓名<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>擅长方向<input required value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} placeholder="例如：力量塑形" /></label><label>个人介绍<textarea value={form.introduction} onChange={e => setForm({ ...form, introduction: e.target.value })} /></label><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>取消</button><button className="primary-button">确认添加</button></div></form></ModalFrame>
}
function LessonModal({ member, onClose, onSuccess, onError }: ModalProps & { member: Member }) {
  const [amount, setAmount] = useState(1); const [note, setNote] = useState('')
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { await api(`/api/admin/users/${member.id}/lessons`, { method: 'POST', body: JSON.stringify({ amount, note }) }); onSuccess() } catch (err) { onError((err as Error).message) } }
  return <ModalFrame title={`调整 ${member.nickname} 的课时`} subtitle={`当前剩余 ${member.remainingLessons} 节，输入正数增加、负数扣减。`} onClose={onClose}><form className="modal-form" onSubmit={submit}><label>调整数量<input type="number" min="-999" max="999" required value={amount} onChange={e => setAmount(Number(e.target.value))} /></label><label>调整原因<input value={note} onChange={e => setNote(e.target.value)} placeholder="例如：购买 10 节私教课" /></label><div className="result-preview">调整后：<strong>{member.remainingLessons + amount}</strong> 节</div><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>取消</button><button className="primary-button">确认调整</button></div></form></ModalFrame>
}
function SlotModal({ coaches, onClose, onSuccess, onError }: ModalProps & { coaches: Coach[] }) {
  const tomorrow = new Date(Date.now() + 86400000); tomorrow.setHours(10, 0, 0, 0)
  const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const [coachId, setCoachId] = useState(coaches[0]?.id || 0); const [startTime, setStartTime] = useState(local(tomorrow)); const [endTime, setEndTime] = useState(local(new Date(tomorrow.getTime() + 3600000)))
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { await api('/api/admin/slots', { method: 'POST', body: JSON.stringify({ coachId, startTime, endTime }) }); onSuccess() } catch (err) { onError((err as Error).message) } }
  return <ModalFrame title="开放预约时段" subtitle="为教练添加一个会员可预约的训练时间。" onClose={onClose}><form className="modal-form" onSubmit={submit}><label>选择教练<select value={coachId} onChange={e => setCoachId(Number(e.target.value))}>{coaches.map(c => <option value={c.id} key={c.id}>{c.name} · {c.specialty}</option>)}</select></label><label>开始时间<input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} /></label><label>结束时间<input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} /></label><div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>取消</button><button className="primary-button">确认开放</button></div></form></ModalFrame>
}
type ModalProps = { onClose: () => void; onSuccess: () => void; onError: (message: string) => void }
