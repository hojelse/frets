import { commonTunings, UNKNOWN_VALUE } from "../constants"

interface Rotation {
  i: number
  prefix: string
  chords: string[]
  scales: string[]
}

interface TuningMatch {
  name: string
  shift: number
}

interface ChordScalePanelProps {
  tuningSelectValue: string
  chordSelectValue: string
  scaleSelectValue: string
  allChordNames: string[]
  allScaleNames: string[]
  shiftedTunings: TuningMatch[]
  chordRotations: Rotation[]
  scaleRotations: Rotation[]
  onChangeTuning: (value: string) => void
  onSelectChord: (name: string) => void
  onSelectScale: (name: string) => void
  onSetTuning: (tuning: number[]) => void
  onSetRoot: (root: number) => void
}

export function ChordScalePanel({
  tuningSelectValue,
  chordSelectValue,
  scaleSelectValue,
  allChordNames,
  allScaleNames,
  shiftedTunings,
  chordRotations,
  scaleRotations,
  onChangeTuning,
  onSelectChord,
  onSelectScale,
  onSetTuning,
  onSetRoot,
}: ChordScalePanelProps) {
  return (
    <div className="flex gap-6 flex-wrap justify-center p-4">
      {/* Tunings Panel */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold mb-2">Tunings:</h3>
        <select
          value={tuningSelectValue}
          onChange={(event) => onChangeTuning(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg font-serif bg-white"
        >
          <option value={UNKNOWN_VALUE}>Unknown</option>
          {Object.keys(commonTunings).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-1">
          {shiftedTunings.map((match, i) => (
            <div key={i} className="flex items-center gap-2">
              {match.shift > 0 && (
                <span className="text-sm text-gray-600">rotation +{match.shift}:</span>
              )}
              <button
                onClick={() => onSetTuning(commonTunings[match.name])}
                className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif text-left"
              >
                {match.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chords Panel */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold mb-2">Chords:</h3>
        <select
          value={chordSelectValue}
          onChange={(event) => onSelectChord(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg font-serif bg-white"
        >
          <option value={UNKNOWN_VALUE}>Unknown</option>
          {allChordNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-1">
          {chordRotations.map((rotation) => (
            <div key={rotation.i} className="flex items-center gap-2 flex-wrap">
              {rotation.i > 0 && (
                <span className="text-sm text-gray-600">rotation +{rotation.i}:</span>
              )}
              {rotation.chords.map((name, j) => (
                <button
                  key={j}
                  onClick={() => onSetRoot(rotation.i)}
                  className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
                >
                  {rotation.prefix}
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scales Panel */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold mb-2">Scales:</h3>
        <select
          value={scaleSelectValue}
          onChange={(event) => onSelectScale(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg font-serif bg-white"
        >
          <option value={UNKNOWN_VALUE}>Unknown</option>
          {allScaleNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-1">
          {scaleRotations.map((rotation) => (
            <div key={rotation.i} className="flex items-center gap-2 flex-wrap">
              {rotation.i > 0 && (
                <span className="text-sm text-gray-600">rotation +{rotation.i}:</span>
              )}
              {rotation.scales.map((name, j) => (
                <button
                  key={j}
                  onClick={() => onSetRoot(rotation.i)}
                  className="px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-serif"
                >
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
