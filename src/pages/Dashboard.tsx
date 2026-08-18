import { Briefcase, Send, TrendingUp, Star } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { useApplications } from '../hooks/useApplications'

export function Dashboard() {
  const { user } = useAuth()
  const { applications } = useApplications(user?.id ?? null)

  const byStatus = (s: string) => applications.filter(a => a.estado === s).length
  const activas = applications.filter(a => a.estado !== 'rechazada').length

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Tu progreso hacia el trabajo ideal</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Aplicaciones totales" value={applications.length} icon={Send} color="indigo" />
        <StatCard label="En proceso activo" value={activas} icon={TrendingUp} color="emerald" />
        <StatCard label="Ofertas recibidas" value={byStatus('oferta')} icon={Star} color="amber" />
        <StatCard label="Enviadas" value={byStatus('enviada')} icon={Briefcase} color="rose" />
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-4">Pipeline de aplicaciones</h2>
        {applications.length === 0 ? (
          <p className="text-slate-400 text-sm">Aún no has aplicado a ninguna oferta. Ve a <strong>Ofertas</strong> para comenzar.</p>
        ) : (
          <div className="space-y-3">
            {[
              { key: 'preparando', label: 'Preparando', color: 'bg-slate-300' },
              { key: 'enviada', label: 'Enviada', color: 'bg-blue-400' },
              { key: 'en_proceso', label: 'En proceso', color: 'bg-amber-400' },
              { key: 'oferta', label: 'Oferta recibida', color: 'bg-emerald-500' },
              { key: 'rechazada', label: 'Rechazada', color: 'bg-rose-400' },
            ].map(({ key, label, color }) => {
              const count = byStatus(key)
              const pct = applications.length ? Math.round((count / applications.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-800 mb-2">Próximos pasos</h3>
        <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
          <li>Completa tu perfil con tu stack y países objetivo</li>
          <li>Ve a <strong>Ofertas</strong> y busca empleos con alto % de match</li>
          <li>Usa "Preparar aplicación" para registrar cada oferta antes de enviar</li>
          <li>Actualiza el estado en <strong>Aplicaciones</strong> a medida que avances</li>
        </ul>
      </div>
    </div>
  )
}
