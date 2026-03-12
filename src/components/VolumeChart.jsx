import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getVolumeHistory, formatDate } from '../lib/utils'
import { WORKOUT_TYPES } from '../lib/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value.toLocaleString()} lbs total</p>
    </div>
  )
}

export default function VolumeChart() {
  const raw = getVolumeHistory()
  const data = raw.slice(-12).map((d) => ({
    date: formatDate(d.date),
    volume: d.volume,
    type: d.type,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
        Log workouts to see your volume history
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} maxBarSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.type === WORKOUT_TYPES.UPPER ? '#6366f1' : '#22d3ee'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
