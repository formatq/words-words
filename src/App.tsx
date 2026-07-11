import { useReducer } from 'react'
import { Wheel } from './components/Wheel'
import { HistoryFeed } from './components/HistoryFeed'
import { nextValidIndex, particles, translation, verbs, type WheelId } from './lib/combos'
import { useKeyboardControls } from './lib/useControls'

export interface HistoryEntry {
  id: number
  combo: string
  ru: string
}

interface State {
  verbIndex: number
  particleIndex: number
  active: WheelId
  directions: Record<WheelId, 1 | -1>
  history: HistoryEntry[]
  nextId: number
}

type Action =
  | { type: 'activate'; wheel: WheelId }
  | { type: 'spin'; wheel?: WheelId; direction: 1 | -1 }

const HISTORY_LIMIT = 50

function pushHistory(state: State): State {
  const verb = verbs[state.verbIndex]
  const particle = particles[state.particleIndex]
  const combo = `${verb} ${particle}`
  if (state.history[0]?.combo === combo) return state
  const entry: HistoryEntry = { id: state.nextId, combo, ru: translation(verb, particle) ?? '' }
  return {
    ...state,
    nextId: state.nextId + 1,
    history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'activate':
      return { ...state, active: action.wheel }
    case 'spin': {
      const wheel = action.wheel ?? state.active
      const index = nextValidIndex(wheel, state, action.direction)
      return pushHistory({
        ...state,
        active: wheel,
        directions: { ...state.directions, [wheel]: action.direction },
        verbIndex: wheel === 'verb' ? index : state.verbIndex,
        particleIndex: wheel === 'particle' ? index : state.particleIndex,
      })
    }
  }
}

function initState(): State {
  const base: State = {
    verbIndex: 0,
    particleIndex: 0,
    active: 'verb',
    directions: { verb: 1, particle: 1 },
    history: [],
    nextId: 0,
  }
  // the starting combo must be valid
  const particleIndex = translation(verbs[0], particles[0])
    ? 0
    : nextValidIndex('particle', base, 1)
  return pushHistory({ ...base, particleIndex })
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  useKeyboardControls({
    onActivate: wheel => dispatch({ type: 'activate', wheel }),
    onSpin: direction => dispatch({ type: 'spin', direction }),
  })

  const verb = verbs[state.verbIndex]
  const particle = particles[state.particleIndex]

  const wheelProps = (wheel: WheelId) => {
    const list = wheel === 'verb' ? verbs : particles
    return {
      prev: list[nextValidIndex(wheel, state, -1)],
      current: wheel === 'verb' ? verb : particle,
      next: list[nextValidIndex(wheel, state, 1)],
      active: state.active === wheel,
      direction: state.directions[wheel],
      onActivate: () => dispatch({ type: 'activate', wheel }),
      onSpin: (direction: 1 | -1) => dispatch({ type: 'spin', wheel, direction }),
    }
  }

  return (
    <div className="app">
      <div className="wheels">
        <Wheel {...wheelProps('verb')} />
        <Wheel {...wheelProps('particle')} />
      </div>
      <div className="translation">{translation(verb, particle)}</div>
      <HistoryFeed entries={state.history} />
      <div className="hint">← → — pick a wheel · ↑ ↓ — spin it · on mobile: tap and swipe</div>
    </div>
  )
}
