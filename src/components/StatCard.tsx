import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  color?: 'indigo' | 'emerald' | 'amber' | 'rose'
}

const colors = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}

export function StatCard({ label, value, icon: Icon, color = 'indigo' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`rounded-lg p-3 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}
