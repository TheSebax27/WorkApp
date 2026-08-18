import { Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApplications } from '../hooks/useApplications'
import type { ApplicationStatus } from '../types'

const STATUSES: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: 'preparando', label: 'Preparando', color: 'bg-slate-100 text-slate-600' },
  { key: 'enviada', label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  { key: 'en_proceso', label: 'En proceso', color: 'bg-amber-100 text-amber-700' },
  { key: 'oferta', label: 'Oferta', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'rechazada', label: 'Rechazada', color: 'bg-rose-100 text-rose-600' },
]

export function Applications() {
  const { user } = useAuth()
  const { applications, loading, updateStatus, deleteApplication } = useApplications(user?.id ?? null)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mis aplicaciones</h1>
        <p className="text-slate-400 text-sm mt-1">{applications.length} registradas en total</p>
      </div>

      {loading && <p className="text-slate-400 text-sm">Cargando...</p>}

      {!loading && applications.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">Sin aplicaciones todavía</p>
          <p className="text-sm">Usa "Preparar aplicación" en la sección de Ofertas</p>
        </div>
      )}

      <div className="space-y-3">
        {applications.map(app => (
          <div key={app.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-700 text-sm font-mono truncate">{app.job_id}</p>
              <p className="text-xs text-slate-400 mt-0.5">{app.fecha_aplicacion}</p>
              {app.notas && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{app.notas}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={app.estado}
                onChange={e => updateStatus(app.id, e.target.value as ApplicationStatus)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {STATUSES.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>

              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUSES.find(s => s.key === app.estado)?.color}`}>
                {STATUSES.find(s => s.key === app.estado)?.label}
              </span>

              <button
                onClick={() => deleteApplication(app.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
