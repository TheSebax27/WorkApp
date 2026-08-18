import { useEffect, useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { JobCard } from '../components/JobCard'
import { FilterBar } from '../components/FilterBar'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../hooks/useAuth'
import { useApplications } from '../hooks/useApplications'
import type { Job } from '../types'

export function Jobs() {
  const { user } = useAuth()
  const { jobs, totalJobs, loading, error, filters, setFilters, fetchJobs, lastFetch } = useJobs(['React', 'TypeScript', 'JavaScript', 'Node', 'Python'])
  const { applications, addApplication } = useApplications(user?.id ?? null)
  const [applyModal, setApplyModal] = useState<Job | null>(null)
  const [applyNote, setApplyNote] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => { fetchJobs() }, [])

  const appliedJobIds = new Set(applications.map(a => a.job_id))

  const handleApply = async () => {
    if (!applyModal) return
    setApplying(true)
    await addApplication(applyModal.id, applyNote)
    setApplyModal(null)
    setApplyNote('')
    setApplying(false)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ofertas de empleo</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? 'Cargando...' : `${jobs.length} de ${totalJobs} ofertas`}
            {lastFetch && !loading && ` · actualizado ${lastFetch.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-4 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg mb-2">Sin resultados</p>
            <p className="text-sm">Intenta cambiar los filtros o actualizar las ofertas</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onApply={setApplyModal}
              applied={appliedJobIds.has(job.id)}
            />
          ))}
        </div>
      </div>

      {applyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setApplyModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-slate-800 mb-1">Preparar aplicación</h2>
            <p className="text-sm text-slate-500 mb-4">
              <span className="font-medium">{applyModal.titulo}</span> en {applyModal.empresa}
            </p>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700 mb-4">
              Revisa la oferta y personaliza tu CV antes de enviar. Este registro te ayuda a hacer seguimiento.
            </div>

            <textarea
              rows={3}
              placeholder="Notas (por qué te interesa, puntos a destacar, etc.)"
              value={applyNote}
              onChange={e => setApplyNote(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setApplyModal(null)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <a
                href={applyModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center border border-indigo-200 text-indigo-600 rounded-lg py-2 text-sm hover:bg-indigo-50 transition-colors"
              >
                Ver oferta
              </a>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {applying ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
