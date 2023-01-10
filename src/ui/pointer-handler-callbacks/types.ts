import { Bar, Duration } from "../../notation/types";
import { AccidentalModes, BeamModes, TieModes } from "../types";
import { Point } from "../../geometry";

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

export interface CanvasCallback {
  onMove(htmlPoint: Point): void;
}
