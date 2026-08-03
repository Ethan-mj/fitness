import { CheckCircle2, CircleAlert, X } from 'lucide-react'

export type ToastState = { type: 'success' | 'error'; message: string } | null

export function Toast({ value, onClose }: { value: ToastState; onClose: () => void }) {
  if (!value) return null
  return (
    <div className={`toast ${value.type}`} role="status" aria-live="polite">
      {value.type === 'success' ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
      <span>{value.message}</span>
      <button className="icon-button small" onClick={onClose} aria-label="关闭提示"><X size={16} /></button>
    </div>
  )
}
