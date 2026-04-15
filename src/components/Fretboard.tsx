import { colorMap } from "../constants"
import { mod12 } from "../utils"
import type { DisplayMode } from "../types"

interface FretboardProps {
  tuning: number[]
  fretCount: number
  selection: number[]
  root: number
  pressedNotes: Set<number>
  displayValue: (c: number) => string | number
  onNotePressStart: (raw: number) => void
  onNotePressEnd: (raw: number) => void
  onNotePressCancel: () => void
}

const MARKED_FRETS = [0, 3, 5, 7, 9, 12, 15, 17, 19, 21]

export function Fretboard({
  tuning,
  fretCount,
  selection,
  root,
  pressedNotes,
  displayValue,
  onNotePressStart,
  onNotePressEnd,
  onNotePressCancel,
}: FretboardProps) {
  return (
    <div className="w-screen box-border grid place-content-center gap-0.5">
      {/* Fret markers */}
      <div className="flex gap-5 mb-2 justify-center items-center h-5 text-xs font-bold text-gray-600">
        {Array.from({ length: fretCount + 1 }, (_, i) => (
          <div key={i} className="w-[35px] h-5 flex items-center justify-center">
            {MARKED_FRETS.includes(i) && i}
          </div>
        ))}
      </div>

      {/* Strings (reversed to show high to low) */}
      {tuning.toReversed().map((c, i) => (
        <div key={i} className="flex gap-5">
          {Array.from({ length: fretCount + 1 }, (_, fretIndex) => {
            const raw = mod12(Number(c) + fretIndex)
            const isSelected = selection[raw] === 1
            const color = colorMap[mod12(raw - root)]
            const isRoot = raw === root
            const isPressed = pressedNotes.has(raw)

            return (
              <button
                key={fretIndex}
                className={`
                  w-[35px] h-[35px] rounded-full text-[0.6em]
                  transition-all duration-50
                  ${isPressed ? "opacity-70 scale-95" : "opacity-100 scale-100"}
                  ${isRoot ? "font-bold ring-2" : ""}
                  ${isSelected ? "text-white" : "bg-white border border-gray-300"}
                `}
                style={{
                  backgroundColor: isSelected ? color : undefined,
                  borderColor: isRoot ? colorMap[0] : undefined,
                }}
                onPointerDown={() => onNotePressStart(raw)}
                onPointerUp={() => onNotePressEnd(raw)}
                onPointerCancel={onNotePressCancel}
                onPointerLeave={onNotePressCancel}
              >
                {displayValue(raw)}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
