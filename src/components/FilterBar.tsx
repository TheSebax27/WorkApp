import type { JobFilters } from '../types'

interface Props {
  filters: JobFilters
  onChange: (f: JobFilters) => void
}

export function FilterBar({ filters, onChange }: Props) {
  const set = <K extends keyof JobFilters>(key: K, val: JobFilters[K]) =>
    onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-wrap gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
      <select
        value={filters.fuente}
        onChange={e => set('fuente', e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">Todas las fuentes</option>
        <option value="remotive">Remotive</option>
        <option value="adzuna">Adzuna</option>
        <option value="arbeitnow">Arbeitnow</option>
      </select>

      <select
        value={filters.remoto === null ? '' : String(filters.remoto)}
        onChange={e => set('remoto', e.target.value === '' ? null : e.target.value === 'true')}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <option value="">Modalidad</option>
        <option value="true">Solo remoto</option>
        <option value="false">Presencial</option>
      </select>

      <input
        type="text"
        placeholder="País..."
        value={filters.pais}
        onChange={e => set('pais', e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-32"
      />

      <input
        type="text"
        placeholder="Stack (ej: React)"
        value={filters.stack}
        onChange={e => set('stack', e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-40"
      />

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 whitespace-nowrap">Match mín.</label>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={filters.minScore}
          onChange={e => set('minScore', Number(e.target.value))}
          className="w-24 accent-indigo-600"
        />
        <span className="text-xs text-slate-600 w-8">{filters.minScore}%</span>
      </div>

      <button
        onClick={() => onChange({ remoto: null, pais: '', stack: '', fuente: '', minScore: 0 })}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
