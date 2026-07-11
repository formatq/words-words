import data from '../data/phrasal-verbs.json'

export type WheelId = 'verb' | 'particle'

export const verbs = data.verbs as string[]
export const particles = data.particles as string[]

const combos = data.combos as Record<string, { ru: string }>

export const comboKey = (verb: string, particle: string) => `${verb} ${particle}`

export const isValid = (verb: string, particle: string) =>
  comboKey(verb, particle) in combos

export const translation = (verb: string, particle: string): string | null =>
  combos[comboKey(verb, particle)]?.ru ?? null

/**
 * Next valid index in a cyclic list of the given length, moving from
 * current in the given direction. Returns current if no other valid
 * value exists.
 */
export function findNextValid(
  length: number,
  current: number,
  direction: 1 | -1,
  isOk: (index: number) => boolean,
): number {
  for (let step = 1; step <= length; step++) {
    const index = (((current + direction * step) % length) + length) % length
    if (isOk(index)) return index
  }
  return current
}

/**
 * Index of the next value of the given wheel that forms a valid combo
 * with the current value of the other wheel.
 */
export function nextValidIndex(
  wheel: WheelId,
  state: { verbIndex: number; particleIndex: number },
  direction: 1 | -1,
): number {
  if (wheel === 'verb') {
    return findNextValid(verbs.length, state.verbIndex, direction, i =>
      isValid(verbs[i], particles[state.particleIndex]),
    )
  }
  return findNextValid(particles.length, state.particleIndex, direction, i =>
    isValid(verbs[state.verbIndex], particles[i]),
  )
}

/** Checks dataset invariants. Returns a list of violations. */
export function validateData(): string[] {
  const errors: string[] = []
  for (const [key, value] of Object.entries(combos)) {
    const words = key.split(' ')
    if (words.length !== 2) {
      errors.push(`combo "${key}": key must consist of two words`)
      continue
    }
    const [verb, particle] = words
    if (!verbs.includes(verb)) errors.push(`combo "${key}": verb "${verb}" is not in the verbs list`)
    if (!particles.includes(particle)) errors.push(`combo "${key}": particle "${particle}" is not in the particles list`)
    if (!value.ru?.trim()) errors.push(`combo "${key}": empty translation`)
  }
  for (const verb of verbs) {
    if (!particles.some(p => isValid(verb, p))) errors.push(`verb "${verb}" has no combos`)
  }
  for (const particle of particles) {
    if (!verbs.some(v => isValid(v, particle))) errors.push(`particle "${particle}" has no combos`)
  }
  return errors
}
