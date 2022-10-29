import { Bar, Duration } from "../notation/types";
import { AccidentalModes, BeamModes } from "../index";

export interface ChangeNoteRestCallback {
  isNoteInputMode(): boolean;

  change(): void;
}

export interface ChangeBeamCallback {
  getMode(): BeamModes;

  change(mode: BeamModes): void;
}

export interface ChangeAccidentalCallback {
  getMode(): AccidentalModes;

  next(): void;
}

// このコールバックはキーハンドラだけじゃなくてMIDIキーとか普通のキーボードとかからも使う想定
export interface NoteInputCallback {
  startPreview(duration: Duration, downX: number, downY: number): void;

  updatePreview(duration: Duration, dy: number): void;

  commit(duration: Duration, dy?: number): void;

  backspace(): void;

  finish(): void;
}

export interface CaretInputCallback {
  back(): void;

  forward(): void;
}

export interface BarInputCallback {
  commit(bar: Bar): void;
}
