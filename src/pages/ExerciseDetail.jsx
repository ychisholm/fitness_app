import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Trophy, TrendingUp, Dumbbell, BarChart2 } from 'lucide-react'
import {
  getExerciseSessionHistory,
  get1RMHistory,
  getBest1RMPerExercise,
  formatDate,
} from '../lib/utils'
import { LIFT_COLORS } from '../lib/constants'

const DEFAULT_COLOR = '#6366f1'

function getColor(name) {
  return LIFT_COLORS[name] || DEFAULT_COLOR
}

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value} lbs</p>
    </div>
  )
}

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value.toLocaleString()} lbs</p>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}

export default function ExerciseDetail() {
  const { exerciseName } = useParams()
  const navigate = useNavigate()
  const name = decodeURIComponent(exerciseName)
  const color = getColor(name)

  const sessions = getExerciseSessionHistory(name)
  const rmHistory = get1RMHistory(name)
  const bests = getBest1RMPerExercise()
  const bestRM = bests[name]

  // Chart data
  const rmChartData = rmHistory.map((p) => ({ date: formatDate(p.date), value: p.value }))
  const volumeChartData = sessions.map((s) => ({ date: formatDate(s.date), volume: s.volume }))

  // PR date
  let prDate = null
  if (bestRM) {
    const prSession = sessions.find((s) => s.est1RM === Math.round(bestRM))
    if (prSession) prDate = formatDate(prSession.date)
  }

  // Summary stats
  const totalSessions = sessions.length
  const lastSession = sessions[sessions.length - 1]
  const topSetEver = sessions.reduce((best, s) => {
    if (!best || (s.topSet && s.topSet.weight > best.weight)) return s.topSet
    return best
  }, null)

  // Trend (last vs first 1RM)
  let trendPct = null
  let trendPositive = true
  if (rmHistory.length >= 2) {
    const first = rmHistory[0].value
    const last = rmHistory[rmHistory.length - 1].value
    const diff = last - first
    trendPositive = diff >= 0
    trendPct = ((diff / first) * 100).toFixed(1)
  }

  const hasData = sessions.length > 0

  return (
    <div className="flex flex-col pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-4">
        <button
          onClick={() => navigate('/stats')}
          className="flex items-center gap-1.5 text-zinc-400 text-sm mb-3 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Stats
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{name}</h1>
            {totalSessions > 0 && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {totalSessions} session{totalSessions !== 1 ? 's' : ''} logged
              </p>
            )}
          </div>
          <div className="w-2 h-8 rounded-full flex-shrink-0 mt-1" style={{ background: color }} />
        </div>
      </div>

      {!hasData ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center px-4 pt-20 text-center">
          <Dumbbell size={48} className="text-zinc-700 mb-4" />
          <p className="text-lg font-semibold text-zinc-400">No data yet</p>
          <p className="text-sm text-zinc-600 mt-1">
            Log a set of {name} to start tracking progress
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-4 pt-5">

          {/* PR + summary row */}
          {bestRM && (
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}25` }}
                >
                  <Trophy size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color }}>Personal Record</p>
                  <p className="text-2xl font-bold text-white mt-0.5">
                    {Math.round(bestRM)}
                    <span className="text-sm font-normal text-zinc-400 ml-1">lbs est. 1RM</span>
                  </p>
                </div>
              </div>
              {prDate && (
                <p className="text-xs text-zinc-500">{prDate}</p>
              )}
            </div>
          )}

          {/* Stat pills */}
          <div className="flex gap-2">
            <StatPill
              label="Best Set"
              value={topSetEver ? `${topSetEver.weight} × ${topSetEver.reps}` : '—'}
            />
            <StatPill
              label="Last Session"
              value={lastSession ? formatDate(lastSession.date) : '—'}
            />
            {trendPct !== null && (
              <StatPill
                label="Overall"
                value={
                  <span style={{ color: trendPositive ? '#34d399' : '#f87171' }}>
                    {trendPositive ? '+' : ''}{trendPct}%
                  </span>
                }
              />
            )}
          </div>

          {/* 1RM Trend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} style={{ color }} />
              <h2 className="text-sm font-semibold text-white">Est. 1RM Over Time</h2>
            </div>
            {rmChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={rmChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<LineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">Not enough data</p>
            )}
          </div>

          {/* Volume per session */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} style={{ color }} />
              <h2 className="text-sm font-semibold text-white">Volume per Session</h2>
              <span className="ml-auto text-xs text-zinc-500">weight × reps</span>
            </div>
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={volumeChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="volume" fill={color} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">Not enough data</p>
            )}
          </div>

          {/* Recent sessions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white mb-4">Recent Sessions</h2>
            <div>
              {sessions
                .slice(-5)
                .reverse()
                .map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{formatDate(session.date)}</p>
                      {session.topSet && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Top set: {session.topSet.weight} lbs × {session.topSet.reps} reps
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{session.est1RM} lbs</p>
                      <p className="text-xs text-zinc-500">est. 1RM</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
