import { Point } from "../../geometry";
import { Bar } from "../../notation/types";

export interface BarInputCallback {
  commit(bar: Bar): void;
}

export interface CanvasCallback {
  onMove(htmlPoint: Point): void;
}
