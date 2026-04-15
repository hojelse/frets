export const functions: Record<number, string> = {
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

export const colorMap = [
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

export const notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]

export const romanNumerals: Record<number, string> = {
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

export const minorRomanNumerals: Record<number, string> = {
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

export const commonTunings: Record<string, number[]> = {
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
}

export const circleOfFifths = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]

export const selectionToChordNames: Record<string, string[]> = {
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

export const selectionToScaleNames: Record<string, string[]> = {
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

export const UNKNOWN_VALUE = "unknown"
export const HOLD_MS = 350
