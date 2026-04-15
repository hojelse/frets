import { useEffect, useRef, useState } from "react"
import { 
  functions, 
  notes, 
  romanNumerals, 
  commonTunings, 
  selectionToChordNames, 
  selectionToScaleNames,
  UNKNOWN_VALUE,
  HOLD_MS,
} from "./constants"
import { mod12, shift, arraysEqual, rotateArray } from "./utils"
import type { DisplayMode } from "./types"
import { Fretboard } from "./components/Fretboard"
import { TabEditor } from "./components/TabEditor"
import { CircleOfFifths } from "./components/CircleOfFifths"
import { Controls } from "./components/Controls"
import { ChordScalePanel } from "./components/ChordScalePanel"

export function App() {
  const [tuning, setTuning] = useState([4, 9, 2, 7, 11, 4])
  const [stringOctaves, setStringOctaves] = useState([2, 2, 3, 3, 3, 4])
  const [selection, setSelection] = useState<number[]>([
    1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1,
  ])
  const [displayMode, setDisplayMode] = useState<DisplayMode>("notes")
  const [root, setRoot] = useState<number>(0)
  const [pressedNotes, setPressedNotes] = useState<Set<number>>(new Set())
  const [fretCount, setFretCount] = useState(12)
  const holdTimerRef = useRef<number | null>(null)
  const holdTriggeredRef = useRef(false)

  const displayValue = (c: number) => {
    if (displayMode === "raw") return c
    if (displayMode === "notes") return notes[c]
    if (displayMode === "functions") return functions[mod12(c - root)]
    throw new Error("err")
  }

  const handleShiftSelection = (d: number) => {
    setSelection(rotateArray(selection, d))
  }

  const handleShiftTuning = (d: number) => {
    const updated = tuning.map((value) => shift(value, d))
    setTuning(updated)
  }

  const handleShift = (i: number, d: number) => {
    const updated = [...tuning]
    updated[i] = shift(updated[i], d)
    setTuning(updated)
  }

  const handleSetStringTuning = (i: number, value: number) => {
    const updated = [...tuning]
    updated[i] = mod12(value)
    setTuning(updated)
  }

  const handleSetStringOctave = (i: number, value: number) => {
    const nextOctave = Number.isFinite(value) ? Math.max(0, Math.min(8, value)) : 3
    setStringOctaves((current) => {
      const updated = [...current]
      updated[i] = nextOctave
      return updated
    })
  }

  const handleAddString = () => {
    const updated = [...tuning, 0]
    setTuning(updated)
  }

  const handleRemoveString = () => {
    if (tuning.length > 1) {
      const updated = tuning.slice(0, -1)
      setTuning(updated)
    }
  }

  const handleChangeTuning = (value: string) => {
    if (value && commonTunings[value]) {
      setTuning(commonTunings[value])
    }
  }

  const getCurrentTuningName = () => {
    for (const [name, tuningArray] of Object.entries(commonTunings)) {
      if (arraysEqual(tuning, tuningArray)) {
        return name
      }
    }
    return ""
  }

  const getShiftedTuningMatches = () => {
    const matches: { name: string; shift: number }[] = []
    
    for (const [name, baseTuning] of Object.entries(commonTunings)) {
      if (tuning.length !== baseTuning.length) continue
      
      for (let shift = 0; shift < 12; shift++) {
        const shiftedTuning = baseTuning.map((note) => mod12(note + shift))
        if (arraysEqual(tuning, shiftedTuning)) {
          matches.push({ name, shift })
        }
      }
    }
    
    return matches
  }

  const handleToggleSelection = (noteIndex: number) => {
    const updated = [...selection]
    updated[noteIndex] = updated[noteIndex] === 1 ? 0 : 1
    setSelection(updated)
  }

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const handleNotePressStart = (raw: number) => {
    setPressedNotes((prev) => new Set(prev).add(raw))
    clearHoldTimer()
    holdTriggeredRef.current = false

    holdTimerRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true
      setRoot(raw)
    }, HOLD_MS)
  }

  const handleNotePressEnd = (raw: number) => {
    setPressedNotes((prev) => {
      const updated = new Set(prev)
      updated.delete(raw)
      return updated
    })
    clearHoldTimer()

    if (!holdTriggeredRef.current) {
      handleToggleSelection(raw)
    }
  }

  const handleNotePressCancel = () => {
    setPressedNotes(new Set())
    clearHoldTimer()
  }

  const handleChangeDisplayMode = (value: string) => {
    setDisplayMode(value as DisplayMode)
  }

  const handleSelectChord = (name: string) => {
    if (!name || name === UNKNOWN_VALUE) return

    const entry = Object.entries(selectionToChordNames).find(([, names]) =>
      names.includes(name),
    )
    if (!entry) return

    const selectedPattern = entry[0].split("").map((digit) => Number(digit))
    setSelection(rotateArray(selectedPattern, -root))
  }

  const handleSelectScale = (name: string) => {
    if (!name || name === UNKNOWN_VALUE) return

    const entry = Object.entries(selectionToScaleNames).find(([, names]) =>
      names.includes(name),
    )
    if (!entry) return

    const selectedPattern = entry[0].split("").map((digit) => Number(digit))
    setSelection(rotateArray(selectedPattern, -root))
  }

  const handleChangeStringCount = (newLength: number) => {
    if (newLength < 1) return
    
    const current = tuning.length
    if (newLength > current) {
      const updated = [...tuning, ...Array(newLength - current).fill(0)]
      setTuning(updated)
    } else if (newLength < current) {
      setTuning(tuning.slice(0, newLength))
    }
  }

  useEffect(() => {
    setStringOctaves((current) => {
      if (current.length === tuning.length) {
        return current
      }

      if (current.length > tuning.length) {
        return current.slice(0, tuning.length)
      }

      const fill = current.length > 0 ? current[current.length - 1] : 3
      return [...current, ...Array(tuning.length - current.length).fill(fill)]
    })
  }, [tuning.length])

  const rotations = Array.from({ length: 12 }, (_, i) => {
		const relativeSelection = rotateArray(selection, -root)
    const pattern = rotateArray(relativeSelection, i).join("")
    const chords = selectionToChordNames[pattern] ?? []
    const scales = selectionToScaleNames[pattern] ?? []
		i = mod12(-i);

    let prefix = ""
    if (displayMode === "notes") {
      prefix = notes[mod12(root + i)] + " "
    } else if (displayMode === "functions") {
      prefix = romanNumerals[mod12(i)] + " "
    }

    return { i, prefix, chords, scales }
  })

  const chordRotations = rotations.filter(
    (rotation) => rotation.chords.length > 0,
  )
  const scaleRotations = rotations.filter(
    (rotation) => rotation.scales.length > 0,
  )
  const shiftedTunings = getShiftedTuningMatches()
  const allChordNames = Array.from(
    new Set(Object.values(selectionToChordNames).flat()),
  )
  const allScaleNames = Array.from(
    new Set(Object.values(selectionToScaleNames).flat()),
  )
  const currentTuningName = getCurrentTuningName()
  const tuningSelectValue = commonTunings[currentTuningName]
    ? currentTuningName
    : UNKNOWN_VALUE
  const currentPattern = rotateArray(selection, root).join("")
  const chordSelectValue = selectionToChordNames[currentPattern]?.[0] ?? UNKNOWN_VALUE
  const scaleSelectValue = selectionToScaleNames[currentPattern]?.[0] ?? UNKNOWN_VALUE

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-4">
        {/* Controls Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Controls
            displayMode={displayMode}
            root={root}
            tuning={tuning}
            stringOctaves={stringOctaves}
            fretCount={fretCount}
            displayValue={displayValue}
            onChangeDisplayMode={handleChangeDisplayMode}
            onChangeRoot={setRoot}
            onChangeTuning={handleChangeTuning}
            onShiftTuning={handleShiftTuning}
            onShiftString={handleShift}
            onSetStringTuning={handleSetStringTuning}
            onSetStringOctave={handleSetStringOctave}
            onChangeStringCount={handleChangeStringCount}
            onChangeFretCount={setFretCount}
            currentTuningName={currentTuningName}
          />
        </div>

        {/* Fretboard Section */}
        <Fretboard
          tuning={tuning}
          fretCount={fretCount}
          selection={selection}
          root={root}
          pressedNotes={pressedNotes}
          displayValue={displayValue}
          onNotePressStart={handleNotePressStart}
          onNotePressEnd={handleNotePressEnd}
          onNotePressCancel={handleNotePressCancel}
        />

        <TabEditor
          tuning={tuning}
          stringOctaves={stringOctaves}
          root={root}
          selection={selection}
          onChangeSelection={setSelection}
        />

        {/* Circle of Fifths Section */}
        <CircleOfFifths
          displayMode={displayMode}
          root={root}
          selection={selection}
          pressedNotes={pressedNotes}
          onNotePressStart={handleNotePressStart}
          onNotePressEnd={handleNotePressEnd}
          onNotePressCancel={handleNotePressCancel}
        />

        {/* Chord/Scale Panel Section */}
        <div className="bg-white rounded-xl shadow-lg w-full">
          <ChordScalePanel
            tuningSelectValue={tuningSelectValue}
            chordSelectValue={chordSelectValue}
            scaleSelectValue={scaleSelectValue}
            allChordNames={allChordNames}
            allScaleNames={allScaleNames}
            shiftedTunings={shiftedTunings}
            chordRotations={chordRotations}
            scaleRotations={scaleRotations}
            onChangeTuning={handleChangeTuning}
            onSelectChord={handleSelectChord}
            onSelectScale={handleSelectScale}
            onSetTuning={setTuning}
            onSetRoot={(i) => setRoot(mod12(root + i))}
          />
        </div>
      </div>
    </main>
  )}