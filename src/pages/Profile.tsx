import { useState, useEffect, useRef } from 'react'
import { Save, Upload, FileText, X, Sparkles, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { extractTextFromPdf, parseProfileFromText } from '../lib/pdfParser'
import type { Profile } from '../types'

const STACK_OPTIONS = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'AWS', 'Azure', 'Git', 'Next.js', 'Vue', 'Angular', 'Express', 'Django', 'Spring', 'GraphQL', 'React Native', 'Flutter', 'Kotlin', 'Linux', 'Redis', 'Supabase']
const COUNTRIES = ['España', 'Estados Unidos', 'Canadá', 'Australia', 'Reino Unido', 'Alemania', 'Países Bajos']
const LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']

type CvState = 'idle' | 'reading' | 'uploading' | 'done' | 'error'

export function Profile() {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Partial<Profile>>({
    nombre: '',
    stack: [],
    nivel_ingles: 'B2',
    paises_objetivo: [],
    anios_experiencia: 2,
    cv_base_url: null,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cvState, setCvState] = useState<CvState>('idle')
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const [cvSuggestions, setCvSuggestions] = useState<ReturnType<typeof parseProfileFromText> | null>(null)
  const [cvError, setCvError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

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

  const handleCvFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setCvError('Solo se aceptan archivos PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('El archivo no puede superar 5 MB.')
      return
    }

    setCvError(null)
    setCvFileName(file.name)
    setCvState('reading')
    setCvSuggestions(null)

    try {
      // 1. Extraer texto del PDF
      const text = await extractTextFromPdf(file)
      const parsed = parseProfileFromText(text)
      setCvSuggestions(parsed)

      // 2. Subir a Supabase Storage
      setCvState('uploading')
      const path = `${user!.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(path, file, { upsert: true, contentType: 'application/pdf' })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(path)
      setProfile(p => ({ ...p, cv_base_url: urlData.publicUrl }))
      setCvState('done')
    } catch (e) {
      console.error(e)
      setCvError('Error al procesar el PDF. Intenta de nuevo.')
      setCvState('error')
    }
  }

  const applySuggestions = () => {
    if (!cvSuggestions) return
    setProfile(p => ({
      ...p,
      ...(cvSuggestions.nombre && !p.nombre ? { nombre: cvSuggestions.nombre } : {}),
      ...(cvSuggestions.anios_experiencia !== null ? { anios_experiencia: cvSuggestions.anios_experiencia } : {}),
      ...(cvSuggestions.nivel_ingles ? { nivel_ingles: cvSuggestions.nivel_ingles } : {}),
      stack: Array.from(new Set([...(p.stack ?? []), ...cvSuggestions.stack])),
    }))
    setCvSuggestions(null)
  }

  const removeCv = () => {
    setProfile(p => ({ ...p, cv_base_url: null }))
    setCvFileName(null)
    setCvState('idle')
    setCvSuggestions(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleCvFile(file)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Mi Perfil</h1>
      <p className="text-slate-400 text-sm mb-8">Esta info se usa para calcular el match con las ofertas</p>

      <div className="space-y-6">

        {/* CV Upload */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <FileText size={17} className="text-indigo-500" />
            Curriculum Vitae
          </h2>

          {profile.cv_base_url ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
              <FileText size={18} className="text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-700 truncate">{cvFileName ?? 'CV subido'}</p>
                <a href={profile.cv_base_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-emerald-500 hover:underline">Ver PDF</a>
              </div>
              <button onClick={removeCv} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <Upload size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Arrastra tu CV aquí o haz clic</p>
              <p className="text-xs text-slate-400 mt-1">PDF · máx. 5 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleCvFile(e.target.files[0]) }}
              />
            </div>
          )}

          {/* Estado de carga */}
          {(cvState === 'reading' || cvState === 'uploading') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              {cvState === 'reading' ? 'Leyendo tu CV...' : 'Subiendo archivo...'}
            </div>
          )}

          {cvError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
              <AlertCircle size={15} /> {cvError}
            </div>
          )}

          {/* Sugerencias detectadas */}
          {cvSuggestions && cvState === 'done' && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800">Info detectada en tu CV</span>
              </div>
              <div className="space-y-1.5 text-sm text-indigo-700">
                {cvSuggestions.nombre && (
                  <p><span className="font-medium">Nombre:</span> {cvSuggestions.nombre}</p>
                )}
                {cvSuggestions.anios_experiencia !== null && (
                  <p><span className="font-medium">Experiencia:</span> {cvSuggestions.anios_experiencia} años</p>
                )}
                {cvSuggestions.nivel_ingles && (
                  <p><span className="font-medium">Inglés:</span> {cvSuggestions.nivel_ingles}</p>
                )}
                {cvSuggestions.stack.length > 0 && (
                  <p><span className="font-medium">Stack detectado:</span> {cvSuggestions.stack.join(', ')}</p>
                )}
              </div>
              <button
                onClick={applySuggestions}
                className="mt-3 text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Aplicar al perfil
              </button>
            </div>
          )}
        </div>

        {/* Nombre */}
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

        {/* Años de experiencia */}
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

        {/* Stack */}
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

        {/* Países objetivo */}
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

        {/* Nivel de inglés */}
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
