import { Point } from "../../geometry";
import { Bar } from "../../notation/types";

export interface CanvasCallback {
  onMove(htmlPoint: Point): void;
}
