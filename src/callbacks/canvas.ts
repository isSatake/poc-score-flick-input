import { isPointInBBox, offsetBBox, Point, scalePoint } from "../geometry";
import { getScale, getStaffOrigin } from "../score-preferences";
import { updateMain } from "../score-renderer";
import {
  getElementBBoxes,
  getPointing,
  getStyles,
  setPointing,
} from "../score-states";

export interface ICanvasCallback {
  onMove(htmlPoint: Point): void;
}

// TODO 命名
export class CanvasCallback implements ICanvasCallback {
  constructor() {}

  onMove(htmlPoint: Point) {
    let nextPointing = undefined;
    for (let i in getElementBBoxes()) {
      const { type } = getStyles()[i].element;
      if (type === "gap" || type === "beam" || type === "tie") {
        continue;
      }
      if (
        isPointInBBox(
          scalePoint(htmlPoint, 1 / getScale()),
          offsetBBox(getElementBBoxes()[i].bbox, getStaffOrigin())
        )
      ) {
        const { elIdx } = getElementBBoxes()[i];
        if (elIdx !== undefined) {
          nextPointing = { index: elIdx, type };
        }
      }
    }
    if (getPointing() !== nextPointing) {
      setPointing(nextPointing);
      updateMain();
    }
  }
}
