import { useEffect, useMemo, useRef, useState } from "react"
import { colorMap, notes, selectionToChordNames } from "../constants"
import { mod12, rotateArray } from "../utils"

interface TabEditorProps {
  tuning: number[]
  stringOctaves: number[]
  root: number
  selection: number[]
  onChangeSelection: (selection: number[]) => void
}

interface Cursor {
  stringIndex: number
  columnIndex: number
}

const MIN_TAB_WIDTH = 30
const LABEL_WIDTH_PX = 40
const MIN_WRAP_COLUMNS = 8

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12)
}

function createEmptyGrid(stringCount: number, width: number) {
  return Array.from({ length: stringCount }, () => Array.from({ length: width }, () => null as number | null))
}

function padGrid(grid: Array<Array<number | null>>, width: number) {
  return grid.map((line) => {
    if (line.length >= width) {
      return line
    }

    return [...line, ...Array.from({ length: width - line.length }, () => null as number | null)]
  })
}

function getGridBaseWidth(grid: Array<Array<number | null>>) {
  const contentWidth = grid.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0)
  return Math.max(MIN_TAB_WIDTH, contentWidth)
}

function setNoteAt(line: Array<number | null>, index: number, value: number | null) {
  const next = [...line]
  while (next.length <= index) {
    next.push(null)
  }
  next[index] = value
  return next
}

function getDigitStyles(line: Array<number | null>, root: number, selection: number[]) {
  const styles = new Map<number, { color: string; isSelected: boolean }>()

  for (let index = 0; index < line.length; index += 1) {
    const note = line[index]
    if (note === null) {
      continue
    }

    const color = colorMap[mod12(note - root)]
    const isSelected = selection[note] === 1
    styles.set(index, { color, isSelected })
  }

  return styles
}

function getDisplayValue(note: number | null, openString: number) {
  if (note === null) {
    return "-"
  }

  return String(mod12(note - openString))
}

function identifyChordName(noteMask: number[], preferredRoot: number) {
  const rootsInMask = Array.from({ length: 12 }, (_, index) => index).filter(
    (index) => noteMask[index] === 1,
  )
  if (rootsInMask.length === 0) {
    return null
  }

  const orderedRoots = rootsInMask.includes(preferredRoot)
    ? [preferredRoot, ...rootsInMask.filter((root) => root !== preferredRoot)]
    : rootsInMask

  for (const chordRoot of orderedRoots) {
    const pattern = rotateArray(noteMask, -chordRoot).join("")
    const names = selectionToChordNames[pattern]
    if (names && names.length > 0) {
      return `${notes[chordRoot]} ${names[0]}`
    }
  }

  return null
}

export function TabEditor({ tuning, stringOctaves, root, selection, onChangeSelection }: TabEditorProps) {
  const [grid, setGrid] = useState(() => createEmptyGrid(tuning.length, MIN_TAB_WIDTH))
  const [cursor, setCursor] = useState<Cursor>({ stringIndex: 0, columnIndex: 0 })
  const [barlines, setBarlines] = useState<number[]>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const synthBusRef = useRef<GainNode | null>(null)
  const lastPlayedRef = useRef<string>("")
  const [containerWidth, setContainerWidth] = useState(0)
  const [cellWidth, setCellWidth] = useState(8)

  const playSynthNote = (midi: number) => {
    if (typeof window === "undefined") {
      return
    }

    let context = audioContextRef.current
    if (!context) {
      context = new window.AudioContext()
      audioContextRef.current = context

      const bus = context.createGain()
      bus.gain.value = 0.12
      bus.connect(context.destination)
      synthBusRef.current = bus
    }

    if (context.state === "suspended") {
      void context.resume()
    }

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const envelope = context.createGain()

    oscillator.type = "triangle"
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), now)

    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(0.22, now + 0.01)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

    oscillator.connect(envelope)
    envelope.connect(synthBusRef.current ?? context.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.24)
  }

  useEffect(() => {
    const element = contentRef.current
    if (!element) {
      return
    }

    const updateWidth = () => {
      setContainerWidth(element.clientWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const element = editorRef.current
    if (!element) {
      return
    }

    const probe = document.createElement("span")
    probe.textContent = "0"
    probe.style.visibility = "hidden"
    probe.style.position = "absolute"
    probe.style.pointerEvents = "none"
    probe.style.fontFamily = "inherit"
    probe.style.fontSize = "inherit"
    probe.style.fontWeight = "inherit"
    probe.style.lineHeight = "inherit"
    element.appendChild(probe)
    const width = probe.getBoundingClientRect().width
    element.removeChild(probe)

    if (width > 0) {
      setCellWidth(width)
    }
  }, [])

  useEffect(() => {
    setGrid((current) => {
      const currentWidth = getGridBaseWidth(current)
      return padGrid(
        tuning.map((_, index) => current[index] ?? []),
        currentWidth,
      )
    })

    setCursor((current) => ({
      stringIndex: Math.min(current.stringIndex, Math.max(0, tuning.length - 1)),
      columnIndex: current.columnIndex,
    }))
  }, [tuning.length])

  useEffect(() => {
    const currentColumn = cursor.columnIndex
    if (barlines.includes(currentColumn)) {
      return
    }

    const leftBoundary = barlines
      .filter((column) => column < currentColumn)
      .reduce((max, column) => (column > max ? column : max), -1)
    const rightCandidates = barlines.filter((column) => column > currentColumn)
    if (leftBoundary < 0 || rightCandidates.length === 0) {
      return
    }

    const rightBoundary = rightCandidates.reduce((min, column) => (column < min ? column : min))
    const nextSelection = Array.from({ length: 12 }, () => 0)

    for (let row = 0; row < grid.length; row += 1) {
      const line = grid[row]
      for (let column = leftBoundary + 1; column < rightBoundary; column += 1) {
        const note = line[column] ?? null
        if (note !== null) {
          nextSelection[note] = 1
        }
      }
    }

    const isSame = nextSelection.every((value, index) => value === selection[index])
    if (!isSame) {
      onChangeSelection(nextSelection)
    }
  }, [barlines, cursor.columnIndex, grid, onChangeSelection, selection])

  useEffect(() => {
    const note = grid[cursor.stringIndex]?.[cursor.columnIndex] ?? null
    const openString = tuning[cursor.stringIndex] ?? 0
    const openOctave = stringOctaves[cursor.stringIndex] ?? 3
    const fret = note === null ? null : mod12(note - openString)
    const midi = fret === null ? null : (openOctave + 1) * 12 + openString + fret
    const playKey = `${cursor.stringIndex}:${cursor.columnIndex}:${midi ?? "-"}`

    if (lastPlayedRef.current === playKey) {
      return
    }

    lastPlayedRef.current = playKey
    if (midi !== null) {
      playSynthNote(midi)
    }
  }, [cursor.columnIndex, cursor.stringIndex, grid, stringOctaves, tuning])

  const baseTabWidth = getGridBaseWidth(grid)
  const tabWidth = Math.max(baseTabWidth, cursor.columnIndex + 1)
  const chordsByColumn = useMemo(() => {
    const byColumn = new Map<number, string>()

    for (let column = 0; column < tabWidth; column += 1) {
      if (barlines.includes(column)) {
        continue
      }

      const noteMask = Array.from({ length: 12 }, () => 0)
      for (let row = 0; row < grid.length; row += 1) {
        const note = grid[row]?.[column] ?? null
        if (note !== null) {
          noteMask[note] = 1
        }
      }

      const hasNotes = noteMask.some((value) => value === 1)
      if (!hasNotes) {
        continue
      }

      const identified = identifyChordName(noteMask, root)
      if (identified) {
        byColumn.set(column, identified)
        continue
      }

      const noteNames = noteMask
        .map((value, index) => ({ value, index }))
        .filter((entry) => entry.value === 1)
        .map((entry) => notes[entry.index])
      byColumn.set(column, noteNames.join(""))
    }

    return byColumn
  }, [barlines, grid, root, tabWidth])
  const wrapColumns = useMemo(() => {
    if (containerWidth <= 0) {
      return tabWidth
    }

    const available = Math.max(0, containerWidth - LABEL_WIDTH_PX)
    const estimate = Math.floor(available / cellWidth)
    return Math.max(MIN_WRAP_COLUMNS, estimate)
  }, [cellWidth, containerWidth, tabWidth])

  const wrappedSegments = useMemo(() => {
    const segments: Array<{ start: number; end: number }> = []

    for (let start = 0; start < tabWidth; start += wrapColumns) {
      segments.push({
        start,
        end: Math.min(start + wrapColumns, tabWidth),
      })
    }

    return segments
  }, [tabWidth, wrapColumns])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (event.key.toLowerCase() === "b") {
      event.preventDefault()
      const targetColumn = cursor.columnIndex
      const hasBarline = barlines.includes(targetColumn)

      setBarlines((current) => {
        if (hasBarline) {
          return current.filter((column) => column !== targetColumn)
        }

        return [...current, targetColumn].sort((a, b) => a - b)
      })

      if (!hasBarline) {
        setGrid((current) => {
          const width = Math.max(getGridBaseWidth(current), targetColumn + 1, MIN_TAB_WIDTH)
          const next = padGrid(current, width)

          for (let row = 0; row < next.length; row += 1) {
            next[row] = setNoteAt(next[row], targetColumn, null)
          }

          return next
        })
      }

      return
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault()

      if (barlines.includes(cursor.columnIndex)) {
        return
      }

      setGrid((current) => {
        const width = Math.max(
          getGridBaseWidth(current),
          cursor.columnIndex + 1,
          MIN_TAB_WIDTH,
        )
        const next = padGrid(current, width)
        const openString = tuning[cursor.stringIndex] ?? 0
        const noteValue = mod12(openString + Number(event.key))
        next[cursor.stringIndex] = setNoteAt(next[cursor.stringIndex], cursor.columnIndex, noteValue)
        return next
      })
      return
    }

    if (event.key === "Backspace") {
      event.preventDefault()

      if (cursor.columnIndex === 0) {
        return
      }

      setGrid((current) => {
        const next = padGrid(current, getGridBaseWidth(current))
        next[cursor.stringIndex] = setNoteAt(next[cursor.stringIndex], cursor.columnIndex - 1, null)
        return next
      })

      setCursor((current) => ({
        stringIndex: current.stringIndex,
        columnIndex: current.columnIndex - 1,
      }))
      return
    }

    if (event.key === "Delete" || event.key === "-" || event.key === " ") {
      event.preventDefault()

      setGrid((current) => {
        const next = padGrid(current, getGridBaseWidth(current))
        next[cursor.stringIndex] = setNoteAt(next[cursor.stringIndex], cursor.columnIndex, null)
        return next
      })
      return
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      setCursor((current) => ({
        stringIndex: current.stringIndex,
        columnIndex: Math.max(0, current.columnIndex - 1),
      }))
      return
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()

      setCursor((current) => ({
        stringIndex: current.stringIndex,
        columnIndex: current.columnIndex + 1,
      }))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setCursor((current) => ({
        stringIndex: Math.min(tuning.length - 1, current.stringIndex + 1),
        columnIndex: current.columnIndex,
      }))
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setCursor((current) => ({
        stringIndex: Math.max(0, current.stringIndex - 1),
        columnIndex: current.columnIndex,
      }))
    }
  }

  return (
    <div
      ref={editorRef}
      tabIndex={0}
      role="textbox"
      aria-multiline="true"
      aria-label="Tab editor"
      onKeyDown={handleKeyDown}
      onMouseDown={focusEditor}
      className="w-full border border-neutral-300 bg-white px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:ring-1 focus:ring-neutral-400"
    >
      <div className="mb-3 text-xs uppercase tracking-[0.35em] text-neutral-500">Tab editor</div>

      <div ref={contentRef} className="space-y-3">
        {wrappedSegments.map((segment) => (
          <div key={`${segment.start}-${segment.end}`} className="space-y-0.5">
            {(() => {
              const segmentColumns = Array.from(
                { length: segment.end - segment.start },
                (_, index) => segment.start + index,
              )
              const chordLabel = chordsByColumn.get(cursor.columnIndex) ?? null
              const cursorInSegment =
                cursor.columnIndex >= segment.start && cursor.columnIndex < segment.end
              const chordChars = segmentColumns.map((columnIndex) =>
                barlines.includes(columnIndex) ? "|" : "-",
              )

              if (cursorInSegment && chordLabel) {
                const start = cursor.columnIndex - segment.start
                for (let index = 0; index < chordLabel.length; index += 1) {
                  const target = start + index
                  if (target >= chordChars.length) {
                    break
                  }
                  chordChars[target] = chordLabel[index]
                }
              }

              return (
                <div className="flex items-start gap-2 leading-5">
                  <div className="w-8 shrink-0 select-none text-neutral-400">ch|</div>
                  <div className="whitespace-pre select-none">
                    {segmentColumns.map((columnIndex, columnOffset) => {
                      const isCursor = cursor.columnIndex === columnIndex
                      return (
                        <span
                          key={`ch-${columnIndex}`}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            setCursor((current) => ({
                              stringIndex: current.stringIndex,
                              columnIndex,
                            }))
                            focusEditor()
                          }}
                          className={[
                            "inline-block min-w-[1ch] text-neutral-500",
                            isCursor ? "bg-neutral-100 ring-1 ring-neutral-500" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {chordChars[columnOffset]}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
            <div className="flex items-start gap-2">
              <div className="w-8 shrink-0" />
              <div className="h-5" />
            </div>
            {tuning.toReversed().map((stringValue, displayIndex) => {
              const stringIndex = tuning.length - 1 - displayIndex
              const line = (grid[stringIndex] ?? []).slice()
              while (line.length < tabWidth) {
                line.push(null)
              }
              const digitStyles = getDigitStyles(line, root, selection)
              const segmentColumns = Array.from(
                { length: segment.end - segment.start },
                (_, index) => segment.start + index,
              )
              const isCursorAfterSegment =
                cursor.stringIndex === stringIndex &&
                cursor.columnIndex === tabWidth &&
                segment.end === tabWidth

              return (
                <div key={`${segment.start}-${stringIndex}`} className="flex items-start gap-2 leading-5">
                  <div className="w-8 shrink-0 select-none text-neutral-400">
                    {notes[stringValue]}|
                  </div>
                  <div className="whitespace-pre select-none">
                    {segmentColumns.map((columnIndex) => {
                      const isBarline = barlines.includes(columnIndex)
                      const char = getDisplayValue(line[columnIndex] ?? null, stringValue)
                      const isCursor =
                        cursor.stringIndex === stringIndex && cursor.columnIndex === columnIndex
                      const digitStyle = digitStyles.get(columnIndex)
                      const useBackground = digitStyle?.isSelected === true

                      return (
                        <span
                          key={columnIndex}
                          onMouseDown={(event) => {
                            event.preventDefault()
                            setCursor({ stringIndex, columnIndex })
                            focusEditor()
                          }}
                          className={[
                            "inline-block min-w-[1ch]",
                            isBarline ? "font-bold text-neutral-500" : "",
                            useBackground ? "text-white" : "",
                            isCursor ? "bg-neutral-100 ring-1 ring-neutral-500" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            color: useBackground ? undefined : digitStyle?.color,
                            backgroundColor: useBackground ? digitStyle?.color : undefined,
                          }}
                        >
                          {isBarline ? "|" : char}
                        </span>
                      )
                    })}
                    {isCursorAfterSegment && (
                      <span className="inline-block min-w-[1ch] bg-neutral-100 ring-1 ring-neutral-500">
                        |
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}