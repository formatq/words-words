import { useRef, useState, type TouchEvent, type WheelEvent } from 'react'

interface WheelProps {
  prev: string
  current: string
  next: string
  active: boolean
  direction: 1 | -1
  onActivate: () => void
  onSpin: (direction: 1 | -1) => void
}

const WHEEL_STEP_PX = 40 // mouse wheel: pixels per position
const SWIPE_STEP_PX = 50 // swipe: pixels per position
const DRAG_RESISTANCE = 0.5 // how closely the track follows the finger between steps

export function Wheel({ prev, current, next, active, direction, onActivate, onSpin }: WheelProps) {
  const wheelDelta = useRef(0)
  const touchY = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    onActivate()
    wheelDelta.current += e.deltaY
    while (Math.abs(wheelDelta.current) >= WHEEL_STEP_PX) {
      const dir = wheelDelta.current > 0 ? 1 : -1
      onSpin(dir)
      wheelDelta.current -= dir * WHEEL_STEP_PX
    }
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    onActivate()
    touchY.current = e.touches[0].clientY
    setDragging(true)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchY.current === null) return
    const dy = e.touches[0].clientY - touchY.current
    if (Math.abs(dy) >= SWIPE_STEP_PX) {
      // swipe up selects the next value, like an iOS picker
      onSpin(dy < 0 ? 1 : -1)
      touchY.current = e.touches[0].clientY
      setDragOffset(0)
    } else {
      setDragOffset(dy * DRAG_RESISTANCE)
    }
  }

  const endDrag = () => {
    touchY.current = null
    setDragging(false)
    setDragOffset(0)
  }

  return (
    <div
      className={active ? 'wheel active' : 'wheel'}
      onClick={onActivate}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={endDrag}
      onTouchCancel={endDrag}
    >
      <div
        className="wheel-track"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: dragging ? 'none' : 'transform 0.18s ease-out',
        }}
      >
        <div key={`prev-${prev}`} className="wheel-neighbor">
          {prev !== current ? prev : ' '}
        </div>
        <div
          key={current}
          className={direction === 1 ? 'wheel-current slide-from-below' : 'wheel-current slide-from-above'}
        >
          {current}
        </div>
        <div key={`next-${next}`} className="wheel-neighbor">
          {next !== current ? next : ' '}
        </div>
      </div>
    </div>
  )
}
