import useEmblaCarousel from 'embla-carousel-react'
import { useState, useEffect, useCallback } from 'react'
import OneRMChart from './OneRMChart'
import VolumeChart from './VolumeChart'

const CARDS = [
  {
    title: 'Estimated 1RM',
    subtitle: 'Bench · Squat · Deadlift',
    component: OneRMChart,
    legend: [
      { color: '#6366f1', label: 'Bench' },
      { color: '#22d3ee', label: 'Squat' },
      { color: '#f59e0b', label: 'Deadlift' },
    ],
  },
  {
    title: 'Total Volume',
    subtitle: 'Weight × Reps per session',
    component: VolumeChart,
    legend: [
      { color: '#6366f1', label: 'Upper Body' },
      { color: '#22d3ee', label: 'Leg Day' },
    ],
  },
]

export default function ChartCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => emblaApi.off('select', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3">
          {CARDS.map((card, i) => {
            const Chart = card.component
            return (
              <div key={i} className="flex-none w-full min-w-0">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                      <p className="text-xs text-zinc-500">{card.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      {card.legend.map((l) => (
                        <div key={l.label} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                          <span className="text-xs text-zinc-500">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Chart />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === selectedIndex ? 'w-4 bg-indigo-400' : 'w-1.5 bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
