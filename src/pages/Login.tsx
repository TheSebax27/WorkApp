import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const fn = mode === 'login' ? signIn : signUp
    const { error } = await fn(email, password)
    if (error) setMsg(error.message)
    else if (mode === 'register') setMsg('Revisa tu email para confirmar la cuenta.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <Globe size={26} className="text-indigo-600" />
          <span className="text-xl font-bold text-slate-800">Job Hunter</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-700 mb-1">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h1>
        <p className="text-sm text-slate-400 mb-6">Encuentra trabajo en empresas extranjeras</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {msg && <p className="text-xs text-rose-500">{msg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <LoadingSpinner size="sm" />}
            {mode === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-indigo-600 hover:underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
