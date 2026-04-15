import { commonTunings } from "../constants"
import type { DisplayMode } from "../types"

interface ControlsProps {
  displayMode: DisplayMode
  root: number
  tuning: number[]
  stringOctaves: number[]
  fretCount: number
  displayValue: (c: number) => string | number
  onChangeDisplayMode: (value: string) => void
  onChangeRoot: (value: number) => void
  onChangeTuning: (value: string) => void
  onShiftTuning: (d: number) => void
  onShiftString: (i: number, d: number) => void
  onSetStringTuning: (i: number, value: number) => void
  onSetStringOctave: (i: number, value: number) => void
  onChangeStringCount: (count: number) => void
  onChangeFretCount: (count: number) => void
  currentTuningName: string
}

export function Controls({
  displayMode,
  root,
  tuning,
  stringOctaves,
  fretCount,
  displayValue,
  onChangeDisplayMode,
  onChangeRoot,
  onChangeTuning,
  onShiftTuning,
  onShiftString,
  onSetStringTuning,
  onSetStringOctave,
  onChangeStringCount,
  onChangeFretCount,
  currentTuningName,
}: ControlsProps) {
  return (
    <div className="flex flex-row gap-4 flex-wrap justify-center">
      {/* Display Mode Select */}
      <select
        value={displayMode}
        onChange={(event) => onChangeDisplayMode(event.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg font-serif bg-white"
      >
        {["raw", "functions", "notes"].map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>

      {/* Root Note Select */}
      <select
        value={root}
        onChange={(event) => onChangeRoot(Number(event.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg font-serif bg-white"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {displayValue(i)}
          </option>
        ))}
      </select>

      {/* Tuning Controls */}
      <div className="flex flex-col gap-1">
        <button 
          onClick={() => onShiftTuning(-1)}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
        >
          Transpose down
        </button>
        <select
          value={currentTuningName}
          onChange={(event) => onChangeTuning(event.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg font-serif bg-white"
        >
          <option value="">Custom Tuning</option>
          {Object.keys(commonTunings).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button 
          onClick={() => onShiftTuning(+1)}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
        >
          Transpose up
        </button>
      </div>

      {/* String Tuning Controls */}
      {tuning.map((c, i) => (
        <div key={i} className="flex flex-col gap-1">
          <button 
            onClick={() => onShiftString(i, -1)}
            className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
          >
            -
          </button>
          <select
            value={c}
            onChange={(event) => onSetStringTuning(i, Number(event.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg font-serif bg-white"
          >
            {Array.from({ length: 12 }, (_, value) => (
              <option key={value} value={value}>
                {displayValue(value)}
              </option>
            ))}
          </select>
          <button 
            onClick={() => onShiftString(i, 1)}
            className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
          >
            +
          </button>
          <input
            type="number"
            min="0"
            max="8"
            value={stringOctaves[i] ?? 3}
            onChange={(event) => onSetStringOctave(i, Number(event.target.value))}
            className="w-12.5 text-center p-2 border border-gray-300 rounded font-serif text-black bg-white"
            aria-label={`String ${i + 1} octave`}
            title="Open string octave"
          />
        </div>
      ))}

      {/* String Count Control */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onChangeStringCount(tuning.length - 1)}
          disabled={tuning.length === 1}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-serif"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={tuning.length}
          onChange={(e) => {
            const newLength = parseInt(e.target.value)
            if (newLength > 0) {
              onChangeStringCount(newLength)
            }
          }}
          className="w-12.5 text-center p-2 border border-gray-300 rounded font-serif text-black bg-white"
        />
        <button
          onClick={() => onChangeStringCount(tuning.length + 1)}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
        >
          +
        </button>
      </div>

      {/* Fret Count Control */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onChangeFretCount(Math.max(0, fretCount - 1))}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
        >
          -
        </button>
        <input
          type="number"
          min="0"
          value={fretCount}
          onChange={(e) => {
            const newFretCount = parseInt(e.target.value)
            if (newFretCount >= 0) {
              onChangeFretCount(newFretCount)
            }
          }}
          className="w-12.5 text-center p-2 border border-gray-300 rounded font-serif text-black bg-white"
        />
        <button
          onClick={() => onChangeFretCount(fretCount + 1)}
          className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
        >
          +
        </button>
      </div>
    </div>
  )
}
