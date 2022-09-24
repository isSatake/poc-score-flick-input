import { Duration } from "../notation/types";
import { BeamModes } from "../index";

export interface ChangeNoteRestCallback {
  isNoteInputMode(): boolean;

  change(): void;
}

export interface ChangeBeamCallback {
  getMode(): BeamModes;

  change(mode: BeamModes): void;
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
  bar(): void;
}
