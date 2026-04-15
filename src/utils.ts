export const shift = (n: number, k: number) => {
  return mod12(n + k)
}

export const mod12 = (n: number) => {
  return mod(n, 12)
}

export const mod = (n: number, d: number) => {
  return ((n % d) + d) % d
}

export const arraysEqual = (a: number[], b: number[]) => {
  return a.length === b.length && a.every((val, idx) => val === b[idx])
}

export const rotateArray = (arr: number[], d: number) => {
  const updated = [...arr]
  const steps = mod(d, updated.length)

  if (steps === 0) {
    return updated
  }

  const moved = updated.splice(updated.length - steps, steps)
  updated.splice(0, 0, ...moved)
  return updated
}
