import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, BarChart2, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/log', icon: Dumbbell, label: 'Log' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/exercises', icon: BookOpen, label: 'Exercises' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="mx-3 mb-3 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl px-2 py-2 shadow-2xl">
        <div className="flex justify-around">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-500/15' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
