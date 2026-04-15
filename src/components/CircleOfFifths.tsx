import { colorMap, notes, romanNumerals, minorRomanNumerals, circleOfFifths } from "../constants"
import { mod12 } from "../utils"
import type { DisplayMode } from "../types"

interface CircleOfFifthsProps {
  displayMode: DisplayMode
  root: number
  selection: number[]
  pressedNotes: Set<number>
  onNotePressStart: (raw: number) => void
  onNotePressEnd: (raw: number) => void
  onNotePressCancel: () => void
}

export function CircleOfFifths({
  displayMode,
  root,
  selection,
  pressedNotes,
  onNotePressStart,
  onNotePressEnd,
  onNotePressCancel,
}: CircleOfFifthsProps) {
  return (
    <div className="w-[300px] h-[300px] relative">
      <svg width="300" height="300" viewBox="0 0 300 300" className="relative">
        {/* Outer circle */}
        <circle cx="150" cy="150" r="120" fill="none" stroke="#ddd" strokeWidth="2" />
        {/* Inner circle */}
        <circle cx="150" cy="150" r="80" fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Major keys (outer circle) */}
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
                className="cursor-pointer"
                onPointerDown={() => onNotePressStart(noteIndex)}
                onPointerUp={() => onNotePressEnd(noteIndex)}
                onPointerCancel={onNotePressCancel}
                onPointerLeave={onNotePressCancel}
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
        
        {/* Minor keys (inner circle) */}
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
                className="cursor-pointer"
                onPointerDown={() => onNotePressStart(minorIndex)}
                onPointerUp={() => onNotePressEnd(minorIndex)}
                onPointerCancel={onNotePressCancel}
                onPointerLeave={onNotePressCancel}
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
  )
}
