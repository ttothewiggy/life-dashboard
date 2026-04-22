import { useCallback, useId, useMemo, useRef } from 'react'

const DIR_16 = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
]

function clampDeg(deg) {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

function snapTo16(deg) {
  const step = 360 / 16
  const idx = Math.round(clampDeg(deg) / step) % 16
  return { idx, label: DIR_16[idx], deg: idx * step }
}

function labelToDeg(label) {
  const idx = DIR_16.indexOf(label)
  if (idx === -1) return 0
  return idx * (360 / 16)
}

function pointerEventToDeg(e, el) {
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  const rad = Math.atan2(dy, dx)
  return clampDeg((rad * 180) / Math.PI + 90)
}

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  label?: string,
 *  size?: number,
 * }} props
 */
export function WindCompass({ value, onChange, label = 'Wind direction', size = 112 }) {
  const uid = useId()
  const elRef = useRef(null)

  const snapped = useMemo(() => snapTo16(labelToDeg(value)), [value])

  const setFromDeg = useCallback(
    (deg) => {
      const next = snapTo16(deg).label
      onChange(next)
    },
    [onChange],
  )

  const onPointerDown = useCallback(
    (e) => {
      const el = elRef.current
      if (!el) return
      el.setPointerCapture(e.pointerId)
      setFromDeg(pointerEventToDeg(e, el))
    },
    [setFromDeg],
  )

  const onPointerMove = useCallback(
    (e) => {
      const el = elRef.current
      if (!el) return
      if (!el.hasPointerCapture(e.pointerId)) return
      setFromDeg(pointerEventToDeg(e, el))
    },
    [setFromDeg],
  )

  const onKeyDown = useCallback(
    (e) => {
      const step = 360 / 16
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        setFromDeg(snapped.deg - step)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        setFromDeg(snapped.deg + step)
      } else if (e.key === 'Home') {
        e.preventDefault()
        onChange('N')
      } else if (e.key === 'End') {
        e.preventDefault()
        onChange('S')
      }
    },
    [onChange, setFromDeg, snapped.deg],
  )

  return (
    <div className="wind-compass">
      <div className="wind-compass__header">
        <span id={`${uid}-label`} className="wind-compass__label">
          {label}
        </span>
        <span className="wind-compass__value" aria-live="polite">
          {snapped.label}
        </span>
      </div>

      <div
        ref={elRef}
        className="wind-compass__dial"
        style={{ width: size, height: size }}
        role="slider"
        tabIndex={0}
        aria-labelledby={`${uid}-label`}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(snapped.deg)}
        aria-valuetext={`${snapped.label} (${Math.round(snapped.deg)}°)`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKeyDown}
      >
        <span className="wind-compass__tick wind-compass__tick--n" aria-hidden>
          N
        </span>
        <span className="wind-compass__tick wind-compass__tick--e" aria-hidden>
          E
        </span>
        <span className="wind-compass__tick wind-compass__tick--s" aria-hidden>
          S
        </span>
        <span className="wind-compass__tick wind-compass__tick--w" aria-hidden>
          W
        </span>

        <div
          className="wind-compass__needle"
          style={{ transform: `rotate(${snapped.deg}deg)` }}
          aria-hidden
        >
          <span className="wind-compass__needle-head" />
        </div>
      </div>
    </div>
  )
}

