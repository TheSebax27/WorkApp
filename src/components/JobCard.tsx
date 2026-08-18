import { ExternalLink, MapPin, Building2, Wifi } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Job } from '../types'

interface Props {
  job: Job
  onApply: (job: Job) => void
  applied?: boolean
}

const sourceColors: Record<string, string> = {
  remotive: 'bg-purple-100 text-purple-700',
  adzuna: 'bg-blue-100 text-blue-700',
  arbeitnow: 'bg-teal-100 text-teal-700',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-100 text-emerald-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{score}% match</span>
}

export function JobCard({ job, onApply, applied }: Props) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(job.fecha_publicacion), { addSuffix: true, locale: es })
    } catch {
      return ''
    }
  })()

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 leading-tight">{job.titulo}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
            <Building2 size={13} />
            <span>{job.empresa}</span>
          </div>
        </div>
        <ScoreBadge score={job.score} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-medium ${sourceColors[job.fuente] ?? 'bg-slate-100 text-slate-600'}`}>
          {job.fuente}
        </span>
        {job.remoto && (
          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            <Wifi size={11} /> Remoto
          </span>
        )}
        <span className="flex items-center gap-1 text-slate-400">
          <MapPin size={11} /> {job.pais}
        </span>
        {timeAgo && <span className="text-slate-400">{timeAgo}</span>}
      </div>

      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {job.tags.slice(0, 6).map(tag => (
            <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{tag}</span>
          ))}
          {job.tags.length > 6 && <span className="text-xs text-slate-400">+{job.tags.length - 6}</span>}
        </div>
      )}

      {job.salario_min && (
        <p className="text-sm text-emerald-600 font-medium">
          {job.moneda} {job.salario_min.toLocaleString()} – {job.salario_max?.toLocaleString() ?? '?'}
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ExternalLink size={13} /> Ver oferta
        </a>
        <button
          onClick={() => onApply(job)}
          disabled={applied}
          className={`ml-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            applied
              ? 'bg-slate-100 text-slate-400 cursor-default'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {applied ? 'Ya aplicaste' : 'Preparar aplicación'}
        </button>
      </div>
    </div>
  )
}
