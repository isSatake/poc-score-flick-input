export const durations = [1, 2, 4, 8, 16, 32] as const;
export type Duration = typeof durations[number];

// C4 (middleC) = 0
export type Pitch = number;

export type Accidental = "sharp" | "natural" | "flat";

export type PitchAcc = {
  pitch: Pitch;
  accidental?: Accidental;
};

export type Note = {
  type: "note";
  duration: Duration;
  notes: PitchAcc[];
  beam?: boolean;
};

export type Rest = {
  type: "rest";
  duration: Duration;
};

export type Bar = {
  type: "bar";
};

export type Element = Note | Rest | Bar;
