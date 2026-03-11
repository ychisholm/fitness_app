import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { get1RMHistory, formatDate } from '../lib/utils'
import { KEY_LIFTS, LIFT_COLORS } from '../lib/constants'

function mergeByDate(datasets) {
  const map = {}
  datasets.forEach(({ name, points }) => {
    points.forEach(({ date, value }) => {
      const label = formatDate(date)
      if (!map[label]) map[label] = { date: label }
      map[label][name] = value
    })
  })
  return Object.values(map).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey.split(' ')[1] || p.dataKey}: {Math.round(p.value)} lbs
        </p>
      ))}
    </div>
  )
}

export default function OneRMChart() {
  const datasets = KEY_LIFTS.map((name) => ({
    name,
    points: get1RMHistory(name),
  }))

  const data = mergeByDate(datasets)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
        Log workouts to see your 1RM trends
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {KEY_LIFTS.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={LIFT_COLORS[name]}
            strokeWidth={2}
            dot={{ r: 3, fill: LIFT_COLORS[name] }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
