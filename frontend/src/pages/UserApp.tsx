import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronRight, Clock3, Dumbbell, History, Home, Search, Settings, UserRound, Users } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Toast, type ToastState } from '../components/Toast'
import { api } from '../lib/api'
import type { Booking, Coach, MemberOption, Slot } from '../lib/types'

type Tab = 'home' | 'book' | 'history' | 'profile'
const formatDay = (date: string) => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(date))
const formatTime = (date: string) => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date))

export function UserApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [members, setMembers] = useState<MemberOption[]>([])
  const [memberId, setMemberId] = useState<number | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<ToastState>(null)
  const [loading, setLoading] = useState(true)

  const member = members.find(item => item.id === memberId) ?? null
  const loadCatalog = async () => {
    setLoading(true)
    try {
      const [memberData, coachData, slotData] = await Promise.all([
        api<MemberOption[]>('/api/public/members'), api<Coach[]>('/api/public/coaches'), api<Slot[]>('/api/public/slots'),
      ])
      setMembers(memberData); setCoaches(coachData); setSlots(slotData)
      if (memberId && !memberData.some(item => item.id === memberId)) setMemberId(null)
    } catch (e) { setToast({ type: 'error', message: (e as Error).message }) } finally { setLoading(false) }
  }
  const loadBookings = async (id: number) => {
    try { setBookings(await api<Booking[]>(`/api/public/bookings?memberId=${id}`)) }
    catch (e) { setToast({ type: 'error', message: (e as Error).message }) }
  }
  useEffect(() => { void loadCatalog() }, [])
  useEffect(() => { if (memberId) void loadBookings(memberId); else setBookings([]) }, [memberId])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(id)
  }, [toast])
  const visibleSlots = useMemo(() => selectedCoach ? slots.filter(s => s.coachId === selectedCoach) : slots, [slots, selectedCoach])
  const filteredMembers = members.filter(item => item.nickname.toLowerCase().includes(query.trim().toLowerCase()))
  const upcoming = bookings.find(b => b.status === 'BOOKED' && new Date(b.startTime) > new Date())

  const refreshMember = async () => {
    await loadCatalog()
    if (memberId) await loadBookings(memberId)
  }
  const book = async (slot: Slot) => {
    if (!member) return
    if (!confirm(`确认由「${member.nickname}」预约 ${slot.coachName} 教练 ${formatDay(slot.startTime)} ${formatTime(slot.startTime)} 的课程吗？`)) return
    try {
      await api('/api/public/bookings', { method: 'POST', body: JSON.stringify({ memberId: member.id, slotId: slot.id }) })
      setToast({ type: 'success', message: `${member.nickname} 预约成功，已扣除 1 节课` }); await refreshMember()
    } catch (e) { setToast({ type: 'error', message: (e as Error).message }) }
  }
  const cancel = async (id: number) => {
    if (!member || !confirm(`确认取消 ${member.nickname} 的本次预约吗？课时将退回。`)) return
    try {
      await api(`/api/public/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ memberId: member.id }) })
      setToast({ type: 'success', message: '预约已取消，课时已退回' }); await refreshMember()
    } catch (e) { setToast({ type: 'error', message: (e as Error).message }) }
  }

  if (loading && !members.length) return <div className="member-app"><div className="page-loader"><span /><p>正在准备可约课程…</p></div><Toast value={toast} onClose={() => setToast(null)} /></div>
  if (!member) return (
    <div className="member-app member-picker-shell">
      <header className="member-header"><Logo /><a className="admin-entry" href="/admin"><Settings size={17} /> 管理后台</a></header>
      <main className="member-picker">
        <div className="picker-heading"><span className="eyebrow">CHOOSE A MEMBER</span><h1>这次为谁预约？</h1><p>请选择本次上课的会员，预约会从该会员课时中扣除。</p></div>
        {members.length > 6 && <label className="member-search"><Search size={19} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索会员姓名" /></label>}
        {filteredMembers.length ? <div className="member-grid">{filteredMembers.map(item => <button className="member-select-card" key={item.id} onClick={() => { setMemberId(item.id); setTab('home') }}><Avatar member={item} /><span><strong>{item.nickname}</strong><small>剩余 {item.remainingLessons} 节课</small></span><ChevronRight size={20} /></button>)}</div> : <Empty title={members.length ? '没有找到会员' : '还没有会员'} text={members.length ? '换个名字试试。' : '请管理员先在后台录入会员。'} />}
        <p className="picker-tip"><Users size={16} /> 会员信息由门店管理员统一录入和维护</p>
      </main>
      <Toast value={toast} onClose={() => setToast(null)} />
    </div>
  )

  return (
    <div className="member-app">
      <header className="member-header"><Logo /><button className="current-member-chip" onClick={() => setMemberId(null)} aria-label="切换会员"><Avatar member={member} small /><span><strong>{member.nickname}</strong><small>切换会员</small></span><ChevronRight size={17} /></button></header>
      <main className="member-main">
        {tab === 'home' && <div className="member-page">
          <div className="welcome"><div><span className="eyebrow">GOOD DAY</span><h1>你好，{member.nickname}</h1><p>今天也要比昨天更强一点。</p></div><span className="date-stamp">{new Date().getDate()}<small>{new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(new Date())}</small></span></div>
          <section className="lesson-hero"><div><span>剩余私教课时</span><strong>{member.remainingLessons}</strong><small>节</small></div><button onClick={() => setTab('book')}>立即预约 <ChevronRight size={18} /></button><Dumbbell className="lesson-watermark" size={150} /></section>
          <section><div className="section-heading"><div><span>UP NEXT</span><h2>下一次训练</h2></div><button onClick={() => setTab('history')}>全部记录</button></div>{upcoming ? <article className="next-card"><div className="date-block"><strong>{new Date(upcoming.startTime).getDate()}</strong><span>{new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(new Date(upcoming.startTime))}</span></div><div><h3>{upcoming.specialty}</h3><p>{upcoming.coachName} 教练</p><span><Clock3 size={15} /> {formatTime(upcoming.startTime)} - {formatTime(upcoming.endTime)}</span></div><span className="status-badge">已预约</span></article> : <Empty title="还没有预约" text="选择喜欢的教练，开始下一次训练。" action={() => setTab('book')} />}</section>
          <section><div className="section-heading"><div><span>COACH TEAM</span><h2>认识你的教练</h2></div></div><div className="coach-strip">{coaches.map((coach, i) => <CoachCard key={coach.id} coach={coach} index={i} onClick={() => { setSelectedCoach(coach.id); setTab('book') }} />)}</div></section>
        </div>}
        {tab === 'book' && <div className="member-page"><div className="page-title"><span className="eyebrow">BOOK A SESSION</span><h1>为 {member.nickname} 预约训练</h1><p>本次预约将从 {member.nickname} 的 {member.remainingLessons} 节剩余课时中扣除。</p></div><div className="coach-filter" role="list"><button className={!selectedCoach ? 'active' : ''} onClick={() => setSelectedCoach(null)}>全部教练</button>{coaches.map(c => <button key={c.id} className={selectedCoach === c.id ? 'active' : ''} onClick={() => setSelectedCoach(c.id)}>{c.name}</button>)}</div><div className="slot-list">{visibleSlots.length ? visibleSlots.map(slot => <article className="slot-card" key={slot.id}><div className="slot-date"><strong>{new Date(slot.startTime).getDate()}</strong><span>{new Intl.DateTimeFormat('zh-CN', { month: 'short', weekday: 'short' }).format(new Date(slot.startTime))}</span></div><div className="slot-info"><h3>{slot.coachName} 教练</h3><p><Clock3 size={15} /> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p></div><button className="outline-button" onClick={() => book(slot)} disabled={!member.remainingLessons}>预约</button></article>) : <Empty title="暂无可约时段" text="换一位教练看看，或稍后再来。" />}</div>{!member.remainingLessons && <div className="notice">当前剩余课时不足，请联系门店管理员添加课时。</div>}</div>}
        {tab === 'history' && <div className="member-page"><div className="page-title"><span className="eyebrow">MEMBER SESSIONS</span><h1>{member.nickname} 的预约记录</h1><p>查看该会员的全部课程安排。</p></div><div className="booking-list">{bookings.length ? bookings.map(item => <article className="booking-card" key={item.id}><div className="booking-line"><span className={`status-dot ${item.status.toLowerCase()}`} /><span>{item.status === 'BOOKED' ? '已预约' : item.status === 'COMPLETED' ? '已完成' : '已取消'}</span></div><h3>{item.specialty}</h3><p>{item.coachName} 教练</p><div className="booking-meta"><span><CalendarDays size={16} /> {formatDay(item.startTime)}</span><span><Clock3 size={16} /> {formatTime(item.startTime)}</span></div>{item.status === 'BOOKED' && <button className="text-button danger" onClick={() => cancel(item.id)}>取消预约</button>}</article>) : <Empty title="还没有训练记录" text="预约第一节课，迈出改变的第一步。" action={() => setTab('book')} />}</div></div>}
        {tab === 'profile' && <div className="member-page profile-page"><Avatar member={member} profile /><h1>{member.nickname}</h1><p>燃动会员 · ID {String(member.id).padStart(5, '0')}</p><div className="profile-stats"><div><strong>{member.remainingLessons}</strong><span>剩余课时</span></div><div><strong>{bookings.filter(b => b.status === 'COMPLETED').length}</strong><span>完成训练</span></div><div><strong>{bookings.filter(b => b.status === 'BOOKED').length}</strong><span>待训练</span></div></div><button className="logout-button" onClick={() => setMemberId(null)}><Users size={18} /> 切换会员</button></div>}
      </main>
      <nav className="bottom-nav" aria-label="会员端主导航"><NavButton active={tab === 'home'} label="首页" icon={<Home />} onClick={() => setTab('home')} /><NavButton active={tab === 'book'} label="约课" icon={<CalendarDays />} onClick={() => setTab('book')} /><NavButton active={tab === 'history'} label="记录" icon={<History />} onClick={() => setTab('history')} /><NavButton active={tab === 'profile'} label="会员" icon={<UserRound />} onClick={() => setTab('profile')} /></nav>
      <Toast value={toast} onClose={() => setToast(null)} />
    </div>
  )
}

function Avatar({ member, small = false, profile = false }: { member: MemberOption; small?: boolean; profile?: boolean }) { return <span className={`member-avatar ${small ? 'small' : ''} ${profile ? 'profile-avatar' : ''}`}>{member.avatarUrl ? <img src={member.avatarUrl} alt={`${member.nickname}的头像`} /> : member.nickname.slice(0, 1)}</span> }
function NavButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactElement; onClick: () => void }) { return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{label}</span></button> }
function CoachCard({ coach, index, onClick }: { coach: Coach; index: number; onClick: () => void }) { const colors = ['orange', 'navy', 'lime']; return <button className={`coach-card ${colors[index % colors.length]}`} onClick={onClick}><span className="coach-initial">{coach.avatarUrl ? <img src={coach.avatarUrl} alt="" /> : coach.name.slice(0, 1)}</span><span><strong>{coach.name}</strong><small>{coach.specialty}</small></span><ChevronRight size={18} /></button> }
function Empty({ title, text, action }: { title: string; text: string; action?: () => void }) { return <div className="empty-state"><Dumbbell size={28} /><h3>{title}</h3><p>{text}</p>{action && <button className="text-button" onClick={action}>去预约</button>}</div> }
