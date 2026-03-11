import { useState, useRef, useEffect } from 'react'

const REPS = Array.from({ length: 30 }, (_, i) => i + 1) // 1–30

export default function RepsPicker({ value, lastReps, onChange, disabled }) {
  const [open, setOpen] = useState(false)

  const containerRef = useRef(null)
  const listRef      = useRef(null)

  const numValue = value !== '' && value != null ? Number(value) : null

  // ── Close on outside click / touch ──────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [open])

  // ── Scroll selected item into view ──────────────────────────────────────
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector('[data-sel="true"]')
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [open])

  function openPicker() {
    if (disabled) return
    setOpen(true)
  }

  function select(v) {
    onChange(v)
    setOpen(false)
  }

  // ── Trigger label ────────────────────────────────────────────────────────
  let btnLabel, btnColor
  if (numValue != null) {
    btnLabel = `${numValue} reps`
    btnColor  = 'text-white'
  } else if (lastReps) {
    btnLabel = `${lastReps} reps`
    btnColor  = 'text-zinc-500'
  } else {
    btnLabel = '– reps'
    btnColor  = 'text-zinc-600'
  }

  return (
    <div ref={containerRef} className="flex-1 relative">

      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        onClick={openPicker}
        className={`
          w-full bg-zinc-800 border rounded-xl px-3 py-2
          text-sm text-center font-medium transition-colors
          ${open
            ? 'border-indigo-500 ring-1 ring-indigo-500/25'
            : 'border-zinc-700'
          }
          ${disabled ? 'cursor-default' : 'hover:border-zinc-500 active:bg-zinc-700'}
          ${btnColor}
        `}
      >
        {btnLabel}
      </button>

      {/* ── Inline dropdown ────────────────────────────────────────────── */}
      <div
        className={`
          absolute left-0 top-[calc(100%+4px)] w-full z-[60]
          bg-[#1c1c1e] border border-zinc-700/70 rounded-xl shadow-2xl
          transition-all duration-150 origin-top
          ${open
            ? 'opacity-100 scale-y-100 translate-y-0'
            : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
          }
        `}
      >
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{
            maxHeight: 176,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {REPS.map((r) => (
            <button
              key={r}
              data-sel={numValue === r ? 'true' : undefined}
              onClick={() => select(r)}
              className={`
                w-full text-left px-3 py-[9px] text-sm transition-colors
                ${numValue === r
                  ? 'text-indigo-300 bg-indigo-500/15'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white active:bg-zinc-700'
                }
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
