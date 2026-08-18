import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Profile } from '../types'

const STACK_OPTIONS = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C#', '.NET', 'SQL', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Next.js', 'Vue', 'Angular']
const COUNTRIES = ['España', 'Estados Unidos', 'Canadá', 'Australia', 'Reino Unido', 'Alemania', 'Países Bajos']
const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<Profile>>({
    nombre: '',
    stack: [],
    nivel_ingles: 'B2',
    paises_objetivo: [],
    anios_experiencia: 2,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data)
    })
  }, [user])

  const toggleItem = (key: 'stack' | 'paises_objetivo', val: string) => {
    const arr = (profile[key] ?? []) as string[]
    setProfile(p => ({
      ...p,
      [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ ...profile, id: user.id, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Mi Perfil</h1>
      <p className="text-slate-400 text-sm mb-8">Esta info se usa para calcular el match con las ofertas</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            value={profile.nombre ?? ''}
            onChange={e => setProfile(p => ({ ...p, nombre: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Años de experiencia</label>
          <input
            type="number"
            min={0}
            max={30}
            value={profile.anios_experiencia ?? 2}
            onChange={e => setProfile(p => ({ ...p, anios_experiencia: Number(e.target.value) }))}
            className="w-32 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tu stack</label>
          <div className="flex flex-wrap gap-2">
            {STACK_OPTIONS.map(s => {
              const active = (profile.stack ?? []).includes(s)
              return (
                <button
                  key={s}
                  onClick={() => toggleItem('stack', s)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Países objetivo</label>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map(c => {
              const active = (profile.paises_objetivo ?? []).includes(c)
              return (
                <button
                  key={c}
                  onClick={() => toggleItem('paises_objetivo', c)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de inglés</label>
          <select
            value={profile.nivel_ingles ?? 'B2'}
            onChange={e => setProfile(p => ({ ...p, nivel_ingles: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Save size={15} />
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  )
}
