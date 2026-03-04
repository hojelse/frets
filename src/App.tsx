import { useRef, useState } from "react"

const functions: Record<number, string> = {
  0: "1",
  1: "♭2",
  2: "2",
  3: "♭3",
  4: "3",
  5: "4",
  6: "♯4",
  7: "5",
  8: "♭6",
  9: "6",
  10: "♭7",
  11: "7",
}

const colorMap = [
  "#6665FF",
  "#92CC55",
  "#FE63FE",
  "#60FFB6",
  "#EB595B",
  "#65B6FF",
  "#BDBD4F",
  "#B662FF",
  "#5CEA5B",
  "#FD63B7",
  "#64FFFF",
  "#CC8F53",
]

const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

const romanNumerals: Record<number, string> = {
  0: "I",
  1: "♭II",
  2: "II",
  3: "♭III",
  4: "III",
  5: "IV",
  6: "♯IV",
  7: "V",
  8: "♭VI",
  9: "VI",
  10: "♭VII",
  11: "VII",
}

const minorRomanNumerals: Record<number, string> = {
  0: "i",
  1: "♭ii",
  2: "ii",
  3: "♭iii",
  4: "iii",
  5: "iv",
  6: "♯iv",
  7: "v",
  8: "♭vi",
  9: "vi",
  10: "♭vii",
  11: "vii",
}

const commonTunings: Record<string, number[]> = {
  // Standard
  "Standard (EADGBE)": [4, 9, 2, 7, 11, 4],

  // Drop Tunings
  "Drop D (DADGBE)": [2, 9, 2, 7, 11, 4],
  "Drop C (CGCFAD)": [0, 7, 0, 5, 9, 2],
  "Drop B (BF♯BEG♯C♯)": [11, 6, 11, 4, 8, 1],

  // Open Tunings
  "Open G (DGDGBD)": [2, 7, 2, 7, 11, 2],
  "Open D (DADF♯AD)": [2, 9, 2, 6, 9, 2],
  "Open E (EBEg♯BE)": [4, 11, 4, 8, 11, 4],
  "Open C (CGCGCE)": [0, 7, 0, 7, 0, 4],

  // Modal / Folk
  "DADGAD (DADGAD)": [2, 9, 2, 7, 9, 2],
};

const arraysEqual = (a: number[], b: number[]) => {
  return a.length === b.length && a.every((val, idx) => val === b[idx])
}

const circleOfFifths = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]

export function App() {
  const UNKNOWN_VALUE = "unknown"
  const HOLD_MS = 350
  const [tuning, setTuning] = useState([4, 9, 2, 7, 11, 4])
  const [selection, setSelection] = useState<number[]>([
    1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0,
  ])
  const [displayMode, setDisplayMode] = useState<"raw" | "notes" | "functions">(
    "functions",
  )
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

  const rotateArray = (arr: number[], d: number) => {
    const updated = [...arr]
    const steps = mod(d, updated.length)

    if (steps === 0) {
      return updated
    }

    const moved = updated.splice(updated.length - steps, steps)
    updated.splice(0, 0, ...moved)
    return updated
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
    setDisplayMode(value as "raw" | "notes" | "functions")
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

  const rotations = Array.from({ length: 12 }, (_, i) => {
    const pattern = rotateArray(selection, root + i).join("")
    const chords = selectionToChordNames[pattern] ?? []
    const scales = selectionToScaleNames[pattern] ?? []

    let prefix = ""
    if (displayMode === "notes") {
      prefix = notes[mod12(root + i)] + " "
    } else if (displayMode === "functions") {
      prefix = romanNumerals[i] + " "
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
    <main>
      <div
				className="containers"
        style={{
          display: "flex",
					alignItems: "center",
					gap: "25px",
					paddingTop: "100px"
        }}
      >
        <div className="container">
          <button onClick={() => handleShiftTuning(-1)}>Transpose down</button>
					<select 
            name="tunings" 
            value={getCurrentTuningName()}
            onChange={(event) => handleChangeTuning(event.target.value)}
          >
            <option value="">Custom Tuning</option>
            {Object.keys(commonTunings).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button onClick={() => handleShiftTuning(+1)}>Transpose up</button>
          {tuning.toReversed().map((c, i) => {
            const stringIndex = tuning.length - 1 - i
            return (
              <div
                style={{
                  display: "flex",
                }}
              >
                <div
                  key={i}
                  style={{
                    display: "flex",
                  }}
                >
                  <button onClick={() => handleShift(stringIndex, -1)}>
                    -
                  </button>
                  <select
                    className="stringTuning"
                    value={c}
                    onChange={(event) =>
                      handleSetStringTuning(stringIndex, Number(event.target.value))
                    }
                  >
                    {Array.from({ length: 12 }, (_, value) => (
                      <option key={value} value={value}>
                        {displayValue(value)}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleShift(stringIndex, 1)}>
                    +
                  </button>
                </div>
              </div>
            )
          })}
            <button onClick={handleAddString}>Add String</button>
            <button onClick={handleRemoveString} disabled={tuning.length === 1}>Remove String</button>
            <button onClick={() => setFretCount(fretCount + 1)}>More Frets</button>
            <button onClick={() => setFretCount(Math.max(1, fretCount - 1))}>Fewer Frets</button>
        </div>
        <div className="container" style={{
          gap: "3px" 
        }}>
          {tuning.toReversed().map((c, i) => {
            return (
                <div
                  style={{
                    display: "flex",
                    gap: "30px",
                  }}
                >
                  {Array.from({ length: fretCount }, (_, i) => {
                    const raw = mod12(Number(c) + i)
                    const isSelected = selection[raw] === 1
                    const color = colorMap[mod12(raw - root)]
                    const isRoot = raw === root

                    const isPressed = pressedNotes.has(raw)

                    return (
                      <button
                        key={i}
                        className="note"
                        onPointerDown={() => handleNotePressStart(raw)}
                        onPointerUp={() => handleNotePressEnd(raw)}
                        onPointerCancel={handleNotePressCancel}
                        onPointerLeave={handleNotePressCancel}
                        style={{
                          backgroundColor: isSelected ? color : undefined,
                          width: "40px",
                          height: "40px",
                          borderRadius: "100vw",
                          border: isRoot ? `2px solid ${colorMap[0]}` : undefined,
                          fontWeight: isRoot ? 'bold' : undefined,
                          opacity: isPressed ? 0.7 : 1,
                          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
                          transition: 'transform 0.05s, opacity 0.05s',
                        }}
                      >
                        {displayValue(raw)}
                      </button>
                    )
                  })}
                </div>
            )
          })}
        </div>
          <div
            style={{
              width: "300px",
              height: "300px",
              position: "relative",
            }}
          >
            <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: "relative" }}>
              <circle cx="150" cy="150" r="120" fill="none" stroke="#ddd" strokeWidth="2" />
              <circle cx="150" cy="150" r="80" fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
              {circleOfFifths.map((noteValue, i) => {
                const angle = (i * 360) / 12 - 90
                const noteIndex = mod12(root + noteValue)
                const isSelected = selection[noteIndex] === 1
                const color = colorMap[mod12(noteIndex - root)]
                const radius = 120
                const x = 150 + radius * Math.cos((angle * Math.PI) / 180)
                const y = 150 + radius * Math.sin((angle * Math.PI) / 180)
                const isPressed = pressedNotes.has(noteIndex)
                
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="25"
                      fill={isSelected ? color : "#fff"}
                      stroke={isPressed ? (isSelected ? color : "#000") : isSelected ? color : "#ccc"}
                      strokeWidth={isPressed ? "3" : "2"}
                      opacity={isPressed ? 0.8 : 1}
                      style={{ cursor: "pointer" }}
                      onPointerDown={() => handleNotePressStart(noteIndex)}
                      onPointerUp={() => handleNotePressEnd(noteIndex)}
                      onPointerCancel={handleNotePressCancel}
                      onPointerLeave={handleNotePressCancel}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="14"
                      fontWeight="bold"
                      pointerEvents="none"
                      fill={isSelected ? "#fff" : "#000"}
                    >
                      {displayMode === "raw" ? noteIndex : displayMode === "notes" ? notes[noteIndex] : romanNumerals[mod12(noteValue)]}
                    </text>
                  </g>
                )
              })}
              {circleOfFifths.map((noteValue, i) => {
                const angle = (i * 360) / 12 - 90
                const minorNoteValue = mod12(noteValue - 3)
                const minorIndex = mod12(root + minorNoteValue)
                const isSelected = selection[minorIndex] === 1
                const color = colorMap[mod12(minorIndex - root)]
                const radius = 80
                const x = 150 + radius * Math.cos((angle * Math.PI) / 180)
                const y = 150 + radius * Math.sin((angle * Math.PI) / 180)
                const isPressed = pressedNotes.has(minorIndex)
                
                return (
                  <g key={`minor-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill={isSelected ? color : "#f9f9f9"}
                      stroke={isPressed ? (isSelected ? color : "#000") : isSelected ? color : "#ddd"}
                      strokeWidth={isPressed ? "3" : "2"}
                      opacity={isPressed ? 0.8 : 1}
                      style={{ cursor: "pointer" }}
                      onPointerDown={() => handleNotePressStart(minorIndex)}
                      onPointerUp={() => handleNotePressEnd(minorIndex)}
                      onPointerCancel={handleNotePressCancel}
                      onPointerLeave={handleNotePressCancel}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="11"
                      fontWeight="bold"
                      pointerEvents="none"
                      fill={isSelected ? "#fff" : "#666"}
                    >
                      {displayMode === "raw" ? minorIndex : displayMode === "notes" ? notes[minorIndex] + "m" : minorRomanNumerals[minorNoteValue]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
      </div>
      <div className="moreStuff">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <select
              className="changeRoot"
              value={root}
              onChange={(event) => {
                const newRoot = Number(event.target.value)
                setRoot(newRoot)
              }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <select
              value={displayMode}
              onChange={(event) => handleChangeDisplayMode(event.target.value)}
            >
              {["raw", "functions", "notes"].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "25px"}}>
          <div className="names">
            <h3>Tunings:</h3>
            <select
              name="tunings-list"
              value={tuningSelectValue}
              onChange={(event) => handleChangeTuning(event.target.value)}
            >
              <option value={UNKNOWN_VALUE}>Unknown</option>
              {Object.keys(commonTunings).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {shiftedTunings.map((match, i) => (
              <div key={i}>
                {match.shift > 0 && <span>rotation +{match.shift}: </span>}
                <button
                  onClick={() => {
                    setTuning(commonTunings[match.name].map((note) => mod12(note)))
                  }
                  }
                >
                  {match.name}
                </button>
              </div>
            ))}
          </div>
          <div className="names">
            <h3>Chords:</h3>
            <select
              name="chords-list"
              value={chordSelectValue}
              onChange={(event) => handleSelectChord(event.target.value)}
            >
              <option value={UNKNOWN_VALUE}>Unknown</option>
              {allChordNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {chordRotations.map((rotation) => (
              <div key={rotation.i}>
                {rotation.i > 0 && <span>rotation +{rotation.i}: </span>}
                {rotation.chords.map((name, j) => (
                  <button key={j} onClick={() => setRoot(mod12(root + rotation.i))}>
                    {rotation.prefix}
                    {name}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="names">
            <h3>Scales:</h3>
            <select
              name="scales-list"
              value={scaleSelectValue}
              onChange={(event) => handleSelectScale(event.target.value)}
            >
              <option value={UNKNOWN_VALUE}>Unknown</option>
              {allScaleNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {scaleRotations.map((rotation) => (
              <div key={rotation.i}>
                {rotation.i > 0 && <span>rotation +{rotation.i}: </span>}
                {rotation.scales.map((name, j) => (
                  <button key={j} onClick={() => setRoot(mod12(root + rotation.i))}>{name}</button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

const shift = (n: number, k: number) => {
  return mod12(n + k)
}

const mod12 = (n: number) => {
  return mod(n, 12)
}

const mod = (n: number, d: number) => {
  return ((n % d) + d) % d
}

let selectionToChordNames: Record<string, string[]> = {
  "100010010000": ["Major Triad"],
  "100010010100": ["6"],
  "100010010010": ["7"],
  "101010010010": ["9"],
  "101011010010": ["11"],
  "101011010110": ["13"],
  "100010010001": ["maj7"],
  "101010010001": ["maj9"],
  "100100010000": ["m"],
  "100100010100": ["m6"],
  "100100010010": ["m7"],
  "101100010010": ["m9"],
  "101101010010": ["m11"],
  "101101010110": ["m13"],
  "100100010001": ["min/maj7"],
  "101100010001": ["min/maj9"],
  "100100100000": ["dim"],
  "100100100100": ["dim7"],
  "100100100010": ["half-dim"],
  "100010001000": ["aug"],
  "100010001010": ["aug7"],
  "101000010000": ["sus2"],
  "100001010000": ["sus4"],
  "100001010010": ["7sus4"],
  "101001010000": ["sus4 add9"],
  "101010010000": ["add9"],
  "101100010000": ["m add9"],
  "100010010110": ["7add6"],
  "100000010000": ["omit3"],
  "100000010010": ["7omit3"],
  "100010000000": ["omit5"],
  "100010100010": ["7(♭5)"],
  "110010010010": ["7(♭9)"],
  "100110010010": ["7(♯9)"],
  "101010110010": ["7(♯11)"],
  "110010011010": ["7(♭9♭13)"],
  "100100011010": ["m7(♭13)"],
  "110110101010": ["7alt"],
}

let selectionToScaleNames: Record<string, string[]> = {
  "111111111111": ["Chromatic Scale"],
  "101011010101": ["Major Scale (Ionian Mode)"],
  "101101010110": ["Major Scale (Dorian Mode)"],
  "110101011010": ["Major Scale (Phrygian Mode)"],
  "101010110101": ["Major Scale (Lydian Mode)"],
  "101011010110": ["Major Scale (Mixolydian Mode)"],
  "101101011010": ["Minor Scale (Aeolian Mode)"],
  "110101101010": ["Major Scale (Locrian Mode)"],
  "101010010100": ["Major Pentatonic Scale"],
  "100101010010": ["Minor Pentatonic Scale"],
  "101101010101": ["Melodic Minor Scale"],
  "101101011001": ["Harmonic Minor Scale"],
  "100101110010": ["Minor Blues Scale (♭5)"],
  "100111010010": ["Minor Blues Scale (3)"],
  "100101010011": ["Minor Blues Scale (7)"],
  "100101110001": ["Minor Blues Scale (♭5, 7)"],
  "100101110100": ["Voodoo Blues Scale"],
  "101110010100": ["Major Blues Scale"],
  "101111110110": ["Mixolydian Blues Scale"],
  "101011011101": ["Major Bebop Scale"],
  "101111010110": ["Dorian Bebop Scale"],
  "101011010111": ["Dominant Bebop Scale"],
  "110101111010": ["Locrian Bebop Scale"],
  "110011011011": ["Phrygian Dominant Bebop Scale"],
  "101101010111": ["Dorian Melodic Bebop Scale"],
  "101101011011": ["Harmonic Minor Bebop Scale"],
  "101101011101": ["Melodic Minor Bebop Scale"],
  "101101101101": ["Whole Half Diminished Scale"],
  "110110110110": ["Half Whole Diminished Scale"],
  "101010101010": ["Whole-Tone Scale"],
}
