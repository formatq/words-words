import { describe, expect, it } from 'vitest'
import { findNextValid, isValid, nextValidIndex, particles, validateData, verbs } from './combos'

describe('findNextValid', () => {
  const always = () => true

  it('wraps around cyclically in both directions', () => {
    expect(findNextValid(3, 2, 1, always)).toBe(0)
    expect(findNextValid(3, 0, -1, always)).toBe(2)
  })

  it('skips invalid values', () => {
    const ok = (i: number) => i === 0 || i === 2
    expect(findNextValid(4, 0, 1, ok)).toBe(2)
    expect(findNextValid(4, 0, -1, ok)).toBe(2)
    expect(findNextValid(4, 2, 1, ok)).toBe(0)
  })

  it('stays in place when no other valid value exists', () => {
    expect(findNextValid(5, 3, 1, i => i === 3)).toBe(3)
  })

  it('stays in place when no valid values exist at all', () => {
    expect(findNextValid(5, 3, 1, () => false)).toBe(3)
  })
})

describe('nextValidIndex on real data', () => {
  it('spinning particles always lands on an existing combo', () => {
    for (let v = 0; v < verbs.length; v++) {
      const start = particles.findIndex(p => isValid(verbs[v], p))
      let state = { verbIndex: v, particleIndex: start }
      for (let i = 0; i < particles.length; i++) {
        state = { ...state, particleIndex: nextValidIndex('particle', state, 1) }
        expect(isValid(verbs[state.verbIndex], particles[state.particleIndex])).toBe(true)
      }
    }
  })

  it('spinning verbs always lands on an existing combo', () => {
    for (let p = 0; p < particles.length; p++) {
      const start = verbs.findIndex(v => isValid(v, particles[p]))
      let state = { verbIndex: start, particleIndex: p }
      for (let i = 0; i < verbs.length; i++) {
        state = { ...state, verbIndex: nextValidIndex('verb', state, -1) }
        expect(isValid(verbs[state.verbIndex], particles[state.particleIndex])).toBe(true)
      }
    }
  })
})

describe('dataset', () => {
  it('satisfies the invariants', () => {
    expect(validateData()).toEqual([])
  })
})
