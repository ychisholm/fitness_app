import { useState, useRef, useEffect } from 'react'

const TENS = Array.from({ length: 30 }, (_, i) => (i + 1) * 10) // 10, 20, … 300

export default function WeightPicker({ value, lastWeight, onChange, disabled }) {
  const [open, setOpen]     = useState(false)
  const [level, setLevel]   = useState(0)       // 0 = tens list, 1 = fine 2.5-step list
  const [base10, setBase10] = useState(null)

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
  }, [open, level])

  function openPicker() {
    if (disabled) return
    if (numValue != null) {
      // Pre-select the matching base and jump straight to fine level
      setBase10(Math.floor(numValue / 10) * 10)
      setLevel(1)
    } else {
      setBase10(null)
      setLevel(0)
    }
    setOpen(true)
  }

  function selectTen(v) {
    setBase10(v)
    if (listRef.current) listRef.current.scrollTop = 0
    // rAF ensures the fine-level items render on the next frame so the
    // same pointer event can't immediately commit a fine value
    requestAnimationFrame(() => setLevel(1))
  }

  function selectFine(v) {
    onChange(v)
    setOpen(false)
    setLevel(0)
  }

  function goBack() {
    setLevel(0)
    if (listRef.current) listRef.current.scrollTop = 0
  }

  const fineOptions = base10 != null
    ? [base10, base10 + 2.5, base10 + 5, base10 + 7.5]
    : []

  // ── Trigger label ────────────────────────────────────────────────────────
  let btnLabel, btnColor
  if (numValue != null) {
    btnLabel = `${numValue} lbs`
    btnColor  = 'text-white'
  } else if (lastWeight) {
    btnLabel = `${lastWeight} lbs`
    btnColor  = 'text-zinc-500'
  } else {
    btnLabel = '– lbs'
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
        {/* Scrollable list */}
        <div
          ref={listRef}
          className="overflow-y-auto overscroll-contain"
          style={{
            maxHeight: 176,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {level === 0
            ? TENS.map((v) => (
                <Row
                  key={v}
                  label={v}
                  selected={base10 === v}
                  onClick={() => selectTen(v)}
                  chevron
                />
              ))
            : fineOptions.map((v) => (
                <Row
                  key={v}
                  label={v}
                  selected={numValue === v}
                  onClick={() => selectFine(v)}
                />
              ))
          }
        </div>

        {/* Back to tens (fine level only) */}
        {level === 1 && (
          <button
            onClick={goBack}
            className="
              w-full text-left px-3 py-1.5
              text-xs text-zinc-600 hover:text-zinc-400
              border-t border-zinc-800 transition-colors
            "
          >
            ← back
          </button>
        )}
      </div>
    </div>
  )
}

function Row({ label, selected, onClick, chevron }) {
  return (
    <button
      data-sel={selected ? 'true' : undefined}
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-3 py-[9px] text-sm transition-colors
        ${selected
          ? 'text-indigo-300 bg-indigo-500/15'
          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white active:bg-zinc-700'
        }
      `}
    >
      <span>{label}</span>
      {chevron && <span className="text-zinc-600 text-xs">›</span>}
    </button>
  )
}
