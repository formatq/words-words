import { useEffect } from 'react'
import type { WheelId } from './combos'

interface Handlers {
  onActivate: (wheel: WheelId) => void
  onSpin: (direction: 1 | -1) => void
}

export function useKeyboardControls({ onActivate, onSpin }: Handlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          onActivate('verb')
          break
        case 'ArrowRight':
          onActivate('particle')
          break
        case 'ArrowUp':
          onSpin(-1)
          break
        case 'ArrowDown':
          onSpin(1)
          break
        default:
          return
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onActivate, onSpin])
}
