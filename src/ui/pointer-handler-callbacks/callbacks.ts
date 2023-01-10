import { UNIT } from "../../bravura";

import { BBox, offsetBBox, Point, scalePoint } from "../../geometry";
import { applyBeamForLastEdited } from "../../notation/notation";
import { Bar, Duration, durations } from "../../notation/types";
import { getScale, getStaffOrigin } from "../../score-preferences";
import { updateMain } from "../../score-renderer";
import {
  getBeamMode,
  getCaretIndex,
  getCaretPositions,
  getElementBBoxes,
  getLastEditedIndex,
  getMainElements,
  getPointing,
  getStyles,
  setCaretIndex,
  setPointing,
} from "../../score-states";
import { inputMusicalElement } from "../../score-updater";
import { registerPointerHandlers } from "../pointer-event";
import {
  ArrowHandler,
  BarInputHandler,
  CanvasPointerHandler,
  ChangeAccidentalHandler,
  ChangeBeamHandler,
  ChangeNoteRestHandler,
  GrayPointerHandler,
  KeyboardDragHandler,
  KeyPressHandler,
  NoteInputHandler,
  TieHandler,
} from "../pointer-handlers";
import { ChangeAccidentalCallback } from "./change-accidental";
import { ChangeBeamCallback } from "./change-beam";
import { ChangeNoteRestCallback } from "./change-note-rest";
import { ChangeTieCallback } from "./change-tie";
import { MoveCaretCallback } from "./move-caret";
import { NoteInputCallback } from "./note-input";
import { BarInputCallback, CanvasCallback } from "./types";

export const registerCallbacks = () => {
  const barInputCallback: BarInputCallback = {
    commit(bar: Bar) {
      inputMusicalElement({
        caretIndex: getCaretIndex(),
        elements: getMainElements(),
        newElement: bar,
        beamMode: getBeamMode(),
      });
      updateMain();
    },
  };

  const canvasCallback: CanvasCallback = {
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
    },
  };

  // for tablet
  registerPointerHandlers(
    ["keyboardBottom", "keyboardHandle"],
    [new KeyboardDragHandler()]
  );
  registerPointerHandlers(
    ["changeNoteRest"],
    [new ChangeNoteRestHandler(new ChangeNoteRestCallback())]
  );
  registerPointerHandlers(
    ["changeBeam"],
    [new ChangeBeamHandler(new ChangeBeamCallback())]
  );
  registerPointerHandlers(["grayKey", "whiteKey"], [new KeyPressHandler()]);
  registerPointerHandlers(
    ["note", "rest", "backspace"],
    [new NoteInputHandler(new NoteInputCallback())]
  );
  registerPointerHandlers(
    ["toLeft", "toRight"],
    [new ArrowHandler(new MoveCaretCallback())]
  );
  registerPointerHandlers(
    ["bars", "candidate"],
    [new BarInputHandler(barInputCallback)]
  );
  registerPointerHandlers(
    ["accidentals"],
    [new ChangeAccidentalHandler(new ChangeAccidentalCallback())]
  );
  registerPointerHandlers([], [new GrayPointerHandler()]);
  registerPointerHandlers(
    ["mainCanvas"],
    [new CanvasPointerHandler(canvasCallback)]
  );
  registerPointerHandlers(
    ["changeTie"],
    [new TieHandler(new ChangeTieCallback())]
  );
};

const durationByDistance = (
  scale: number,
  dx: number,
  origin: Duration
): Duration => {
  const unitX = UNIT * 2 * scale;
  const _di = Math.round(dx / unitX + durations.indexOf(origin));
  const di = Math.min(Math.max(_di, 0), 6);
  return durations[di];
};

const isPointInBBox = (
  { x, y }: Point,
  { left, top, right, bottom }: BBox
): boolean => {
  return left <= x && x <= right && top <= y && y <= bottom;
};
