export const durations = [1, 2, 4, 8, 16, 32] as const;
export type Duration = typeof durations[number];

// C4 (middleC) = 0
export type Pitch = number;

export type Accidental = "sharp" | "natural" | "flat";

export type PitchAcc = {
  pitch: Pitch;
  accidental?: Accidental;
};

export type Beam = "begin" | "continue" | "end";

export type Note = {
  type: "note";
  duration: Duration;
  pitches: PitchAcc[]; // sort pitch by asc
  beam?: Beam;
};

export type Rest = {
  type: "rest";
  duration: Duration;
};

export type BarTypes = "single" | "double" | "final" | "repeat";
export type Bar = {
  type: "bar";
  subtype: BarTypes;
};

export type Repeat = {
  type: "repeat";
  subtype: "begin" | "end";
};

export type MusicalElement = Note | Rest | Bar;

export type Clef = {
  type: "g";
};
