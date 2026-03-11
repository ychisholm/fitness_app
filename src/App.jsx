import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Dashboard from './pages/Dashboard'
import WorkoutLogger from './pages/WorkoutLogger'
import Analytics from './pages/Analytics'
import ExerciseDetail from './pages/ExerciseDetail'
import BottomNav from './components/BottomNav'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppShell() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<WorkoutLogger />} />
        <Route path="/stats" element={<Analytics />} />
        <Route path="/stats/:exerciseName" element={<ExerciseDetail />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex justify-center bg-black min-h-dvh">
        <div className="w-full max-w-[430px] relative bg-zinc-950 shadow-2xl">
          <AppShell />
        </div>
      </div>
    </BrowserRouter>
  )
}
