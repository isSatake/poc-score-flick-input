import { Duration } from "../notation/types";

export interface ChangeNoteRestCallback {
  isNoteInputMode(): boolean;

  change(): void;
}

// このコールバックはキーハンドラだけじゃなくてMIDIキーとか普通のキーボードとかからも使う想定
export interface NoteInputCallback {
  startPreview(duration: Duration, downX: number, downY: number): void;

  updatePreview(duration: Duration, dy: number): void;

  commit(duration: Duration, dy?: number): void;

  backspace(): void;

  finish(): void;
}

export interface CaretCallback {
  back(): void;

  forward(): void;
}
