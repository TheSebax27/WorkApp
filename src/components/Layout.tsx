import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Send, User, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Ofertas' },
  { to: '/applications', icon: Send, label: 'Aplicaciones' },
  { to: '/profile', icon: User, label: 'Mi Perfil' },
]

export function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800">
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col shadow-sm shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-100">
          <Globe size={22} className="text-indigo-600" />
          <span className="font-bold text-slate-800">Job Hunter</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 truncate mb-2">{user?.email}</p>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-500 transition-colors"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
