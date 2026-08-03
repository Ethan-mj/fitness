import { Dumbbell } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="燃动健身">
      <span className="logo-mark"><Dumbbell size={20} strokeWidth={2.4} /></span>
      {!compact && <span>燃动<span className="logo-light">FIT</span></span>}
    </div>
  )
}
