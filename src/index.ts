import { bStaffHeight, UNIT } from "./bravura";
import { getCanvasById } from "./canvas/canvas";
import { BBox, offsetBBox, Point, scalePoint } from "./geometry";
import {
  Bar,
  Duration,
  durations,
  MusicalElement,
  Note,
  Pitch,
  Tie,
} from "./notation/types";
import { initCanvas, paintStaff, paintStyle, resetCanvas } from "./paint";
import { sortPitches } from "./pitch";
import {
  getPreviewHeight,
  getPreviewScale,
  getPreviewWidth,
  getScale,
  getStaffOrigin,
} from "./score-preferences";
import { updateMain } from "./score-renderer";
import {
  addCaretIndex,
  changeAccidentalMode,
  flipIsNoteInputMode,
  getAccidentalMode,
  getBeamMode,
  getCaretByIndex,
  getCaretIndex,
  getCaretPositions,
  getCurrentCaret,
  getElementBBoxes,
  getIsNoteInputMode,
  getLastEditedIndex,
  getMainElements,
  getPointing,
  getStyles,
  getTieMode,
  setBeamMode,
  setCaretIndex,
  setLastEditedIndex,
  setMainElements,
  setPointing,
  setTieMode,
} from "./score-states";
import { determinePaintElementStyle } from "./style/style";
import { registerPointerHandlers } from "./ui/pointer-event";
import {
  BarInputCallback,
  CanvasCallback,
  CaretInputCallback,
  ChangeAccidentalCallback,
  ChangeBeamCallback,
  ChangeTieCallback,
  IChangeNoteRestCallback,
  NoteInputCallback,
} from "./ui/pointer-handler-callbacks/types";
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
} from "./ui/pointer-handlers";
import { BeamModes } from "./ui/types";

const updatePreview = (
  previewCtx: CanvasRenderingContext2D,
  baseElements: MusicalElement[],
  beamMode: BeamModes,
  newElement: MusicalElement
) => {
  console.log("preview", "start");
  resetCanvas({
    ctx: previewCtx,
    width: getPreviewWidth(),
    height: getPreviewHeight(),
    fillStyle: "#fff",
  });
  const { elements: preview, insertedIndex } = inputMusicalElement({
    caretIndex: getCaretIndex(),
    elements: baseElements,
    newElement,
    beamMode,
  });
  console.log("insertedIdx", insertedIndex);
  console.log("preview", preview);
  // B4がcanvasのvertical centerにくるように
  const _topOfStaff =
    getPreviewHeight() / 2 - (bStaffHeight * getPreviewScale()) / 2;
  const styles = [...determinePaintElementStyle(preview, UNIT)];
  const elIdxToX = new Map<number, number>();
  let cursor = 0;
  for (const style of styles) {
    const { width, element, index } = style;
    console.log("style", style);
    if (index !== undefined) {
      elIdxToX.set(index, cursor + width / 2);
    }
    if (element.type !== "beam" && element.type !== "tie") {
      cursor += width;
    }
  }

  console.log("elIdxToX", elIdxToX);

  // paint staff
  previewCtx.save();
  // x: 左端 y: 中心
  previewCtx.translate(0, _topOfStaff);
  previewCtx.scale(getPreviewScale(), getPreviewScale());
  paintStaff(previewCtx, 0, 0, UNIT * 100, 1);
  previewCtx.restore();

  // paint elements
  previewCtx.save();
  // x: 中心, y: 中心
  previewCtx.translate(getPreviewWidth() / 2, _topOfStaff);
  previewCtx.scale(getPreviewScale(), getPreviewScale());
  // x: previewの中心
  const centerX = elIdxToX.get(insertedIndex)!;
  console.log("centerX", centerX);
  previewCtx.translate(-centerX, 0);
  for (const style of styles) {
    const { width, element } = style;
    paintStyle(previewCtx, style);
    if (element.type !== "beam" && element.type !== "tie") {
      previewCtx.translate(width, 0);
    }
  }
  previewCtx.restore();
  console.log("preview", "end");
};

window.onload = () => {
  const { canvas: mainCanvas, ctx: mainCtx } = getCanvasById("mainCanvas");
  const { canvas: previewCanvas, ctx: previewCtx } =
    getCanvasById("previewCanvas");
  const noteKeyEls = Array.from(document.getElementsByClassName("note"));
  const changeNoteRestKey =
    document.getElementsByClassName("changeNoteRest")[0];
  const changeNoteRestCallback: IChangeNoteRestCallback = {
    isNoteInputMode() {
      return getIsNoteInputMode();
    },
    change() {
      noteKeyEls.forEach((el) => {
        el.className = el.className.replace(
          this.isNoteInputMode() ? "note" : "rest",
          this.isNoteInputMode() ? "rest" : "note"
        );
      });
      changeNoteRestKey.className = changeNoteRestKey.className.replace(
        this.isNoteInputMode() ? "rest" : "note",
        this.isNoteInputMode() ? "note" : "rest"
      );
      flipIsNoteInputMode();
    },
  };
  const changeBeamCallback: ChangeBeamCallback = {
    getMode: getBeamMode,
    change(mode: BeamModes) {
      noteKeyEls.forEach((el) => {
        el.className = el.className.replace(
          mode === "nobeam" ? "beamed" : "nobeam",
          mode === "nobeam" ? "nobeam" : "beamed"
        );
      });
      setBeamMode(mode);
      const lastEl = getMainElements()[getLastEditedIndex()];
      if (lastEl) {
        const left = getMainElements()[getLastEditedIndex() - 1];
        const right = getMainElements()[getLastEditedIndex() + 1];
        applyBeamForLastEdited(lastEl, left, right);
        updateMain(mainCtx);
      }
    },
  };
  const changeAccidentalCallback: ChangeAccidentalCallback = {
    getMode: getAccidentalMode,
    next: changeAccidentalMode,
  };
  const changeTieCallback: ChangeTieCallback = {
    getMode: getTieMode,
    change: setTieMode,
  };
  let copiedElements;
  const noteInputCallback: NoteInputCallback = {
    // (start|update)Preview, commitを共通化したい。
    // 基本的にelementを生成するだけだが
    // tieでは直前の音をいじるので
    // 「音を追加」「音を変更」をデータ化できるといいんだけど。reducerみたく
    // applyBeamももうちょいスマートに書けるんじゃないかな？
    startPreview(duration: Duration, downX: number, downY: number) {
      const left = downX - getPreviewWidth() / 2;
      const top = downY - getPreviewHeight() / 2;
      initCanvas({
        leftPx: left,
        topPx: top,
        width: getPreviewWidth(),
        height: getPreviewHeight(),
        _canvas: previewCanvas,
      });
      copiedElements = [...getMainElements()];
      const newPitch = {
        pitch: pitchByDistance(getPreviewScale(), 0, 6),
        accidental: getAccidentalMode(),
      };
      let tie: Tie | undefined;
      if (getTieMode() && getCaretIndex() > 0 && getCaretIndex() % 2 === 0) {
        const prevEl = copiedElements[getCaretIndex() / 2 - 1];
        if (
          prevEl?.type === "note" &&
          prevEl.pitches[0].pitch === newPitch.pitch &&
          prevEl.pitches[0].accidental === newPitch.accidental
        ) {
          prevEl.tie = "start";
          tie = "stop";
        }
      }
      const element: MusicalElement = getIsNoteInputMode()
        ? {
            type: "note",
            duration,
            pitches: [newPitch],
            tie,
          }
        : {
            type: "rest",
            duration,
          };
      if (getCaretIndex() > 0 && getCaretIndex() % 2 !== 0) {
        const oldIdx = getCaretIndex() === 1 ? 0 : (getCaretIndex() - 1) / 2;
        const oldEl = copiedElements[oldIdx];
        if (
          element.type === "note" &&
          oldEl.type === "note" &&
          element.duration === oldEl.duration
        ) {
          element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
        }
      }
      updatePreview(previewCtx, copiedElements, getBeamMode(), element);
      previewCanvas.style.visibility = "visible";
    },
    updatePreview(duration: Duration, dy: number) {
      copiedElements = [...getMainElements()];
      const newPitch = {
        pitch: pitchByDistance(getPreviewScale(), dy, 6),
        accidental: getAccidentalMode(),
      };
      let tie: Tie | undefined;
      if (getTieMode() && getCaretIndex() > 0 && getCaretIndex() % 2 === 0) {
        const prevEl = copiedElements[getCaretIndex() / 2 - 1];
        if (
          prevEl?.type === "note" &&
          prevEl.pitches[0].pitch === newPitch.pitch &&
          prevEl.pitches[0].accidental === newPitch.accidental
        ) {
          prevEl.tie = "start";
          tie = "stop";
        }
      }
      const element: MusicalElement = getIsNoteInputMode()
        ? {
            type: "note",
            duration,
            pitches: [newPitch],
            tie,
          }
        : {
            type: "rest",
            duration,
          };
      if (getCaretIndex() > 0 && getCaretIndex() % 2 !== 0) {
        const oldIdx = getCaretIndex() === 1 ? 0 : (getCaretIndex() - 1) / 2;
        const oldEl = copiedElements[oldIdx];
        if (
          element.type === "note" &&
          oldEl.type === "note" &&
          element.duration === oldEl.duration
        ) {
          element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
        }
      }
      updatePreview(previewCtx, copiedElements, getBeamMode(), element);
    },
    commit(duration: Duration, dy?: number) {
      let newElement: MusicalElement;
      const newPitch = {
        pitch: pitchByDistance(getPreviewScale(), dy ?? 0, 6),
        accidental: getAccidentalMode(),
      };
      let tie: Tie | undefined;
      if (getTieMode() && getCaretIndex() > 0 && getCaretIndex() % 2 === 0) {
        const prevEl = getMainElements()[getCaretIndex() / 2 - 1];
        if (
          prevEl?.type === "note" &&
          prevEl.pitches[0].pitch === newPitch.pitch &&
          prevEl.pitches[0].accidental === newPitch.accidental
        ) {
          prevEl.tie = "start";
          tie = "stop";
        }
      }
      if (getIsNoteInputMode()) {
        newElement = {
          type: "note",
          duration,
          pitches: [newPitch],
          tie,
        };
      } else {
        newElement = {
          type: "rest",
          duration,
        };
      }
      const { elements, insertedIndex, caretAdvance } = inputMusicalElement({
        caretIndex: getCaretIndex(),
        elements: getMainElements(),
        newElement,
        beamMode: getBeamMode(),
      });
      setLastEditedIndex(insertedIndex);
      addCaretIndex(caretAdvance);
      setMainElements(elements);
      updateMain(mainCtx);
      copiedElements = [];
    },
    backspace() {
      const targetElIdx = getCurrentCaret().elIdx;
      if (targetElIdx < 0) {
        return;
      }
      const deleted = getMainElements().splice(targetElIdx, 1)[0];
      if (deleted.type === "note") {
        const left = getMainElements()[targetElIdx - 1];
        const right = getMainElements()[targetElIdx];
        if (deleted.beam === "begin" && right) {
          (right as Note).beam = "begin";
        } else if (deleted.beam === "end" && left) {
          (left as Note).beam = "end";
        }
      }

      // 削除後のcaret位置を計算
      let t = getCaretIndex() - 1;
      while (t > -1) {
        if (t === 0) {
          setCaretIndex(0);
          t = -1;
        } else if (getCaretByIndex(t).elIdx !== targetElIdx) {
          setCaretIndex(t);
          t = -1;
        } else {
          t--;
        }
      }

      updateMain(mainCtx);
    },
    finish() {
      previewCanvas.style.visibility = "hidden";
    },
  };

  const caretMoveCallback: CaretInputCallback = {
    back() {
      if (getCaretIndex() % 2 !== 0) {
        const idx = getCaretIndex() === 1 ? 0 : (getCaretIndex() - 1) / 2;
        if (idx === getLastEditedIndex()) {
          const lastEl = getMainElements()[getLastEditedIndex()];
          const left = getMainElements()[idx - 1];
          const right = getMainElements()[idx + 1];
          applyBeamForLastEdited(lastEl, left, right);
        }
      }
      setCaretIndex(Math.max(getCaretIndex() - 1, 0));
      updateMain(mainCtx);
    },
    forward() {
      if (getCaretIndex() % 2 === 0) {
        const idx = getCaretIndex() / 2 - 1;
        if (idx === getLastEditedIndex()) {
          const lastEl = getMainElements()[getLastEditedIndex()];
          const left = getMainElements()[idx - 1];
          const right = getMainElements()[idx + 1];
          applyBeamForLastEdited(lastEl, left, right);
        }
      }
      setCaretIndex(
        Math.min(getCaretIndex() + 1, getCaretPositions().length - 1)
      );
      updateMain(mainCtx);
    },
  };

  const barInputCallback: BarInputCallback = {
    commit(bar: Bar) {
      const { elements, insertedIndex, caretAdvance } = inputMusicalElement({
        caretIndex: getCaretIndex(),
        elements: getMainElements(),
        newElement: bar,
        beamMode: getBeamMode(),
      });
      setLastEditedIndex(insertedIndex);
      addCaretIndex(caretAdvance);
      setMainElements(elements);
      updateMain(mainCtx);
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
        updateMain(mainCtx);
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
    [new ChangeNoteRestHandler(changeNoteRestCallback)]
  );
  registerPointerHandlers(
    ["changeBeam"],
    [new ChangeBeamHandler(changeBeamCallback)]
  );
  registerPointerHandlers(["grayKey", "whiteKey"], [new KeyPressHandler()]);
  registerPointerHandlers(
    ["note", "rest", "backspace"],
    [new NoteInputHandler(noteInputCallback)]
  );
  registerPointerHandlers(
    ["toLeft", "toRight"],
    [new ArrowHandler(caretMoveCallback)]
  );
  registerPointerHandlers(
    ["bars", "candidate"],
    [new BarInputHandler(barInputCallback)]
  );
  registerPointerHandlers(
    ["accidentals"],
    [new ChangeAccidentalHandler(changeAccidentalCallback)]
  );
  registerPointerHandlers([], [new GrayPointerHandler()]);
  registerPointerHandlers(
    ["mainCanvas"],
    [new CanvasPointerHandler(canvasCallback)]
  );
  registerPointerHandlers(["changeTie"], [new TieHandler(changeTieCallback)]);

  initCanvas({
    leftPx: 0,
    topPx: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    _canvas: mainCanvas,
  });
  initCanvas({
    leftPx: 0,
    topPx: 0,
    width: getPreviewWidth(),
    height: getPreviewHeight(),
    _canvas: previewCanvas,
  });
  updateMain(mainCtx);
};

/**
 * algorithm: https://gyazo.com/09cdc43aa31b8dc2cb487556dac039c2
 * @param beamMode
 * @param insert
 * @param left
 * @param right
 */
function applyBeam(
  beamMode: BeamModes,
  insert: MusicalElement,
  left?: MusicalElement,
  right?: MusicalElement
): void {
  if (insert.type === "note" && beamMode !== "nobeam") {
    // beamを挿入
    if (
      left?.type === "note" &&
      right?.type === "note" &&
      left.beam &&
      right.beam
    ) {
      // beamに囲まれる
      if (left.beam === "begin") {
        if (right.beam === "begin") {
          insert.beam = "continue";
          right.beam = "continue";
        } else {
          insert.beam = "continue";
        }
      } else if (left.beam === "continue") {
        if (right.beam === "begin") {
          insert.beam = "end";
        } else {
          insert.beam = "continue";
        }
      }
    } else {
      insert.beam = "begin";
      if (
        left?.type === "note" &&
        (left?.beam === "begin" || left?.beam === "continue")
      ) {
        insert.beam = "continue";
      }
      if (right?.type === "note" && right?.beam === "begin") {
        right.beam = "continue";
      }
    }
  } else {
    // no beam or restを挿入
    if (right?.type === "note") {
      if (right?.beam === "continue") {
        right.beam = "begin";
      } else if (right?.beam === "end") {
        delete right.beam;
      }
    }
    if (left?.type === "note") {
      if (left?.beam === "begin") {
        delete left.beam;
      } else if (left?.beam === "continue") {
        left.beam = "end";
      }
    }
  }
}

function applyBeamForLastEdited(
  last: MusicalElement,
  left?: MusicalElement,
  right?: MusicalElement
) {
  if (
    last.type === "note" &&
    (last.beam === "begin" || last.beam === "continue")
  ) {
    if (
      !right ||
      (right?.type === "note" && (!right?.beam || right?.beam === "begin"))
    ) {
      if (
        left?.type === "note" &&
        (left?.beam === "begin" || left?.beam === "continue")
      ) {
        last.beam = "end";
      } else {
        delete last.beam;
      }
    }
  }
}

function inputMusicalElement({
  caretIndex,
  elements,
  newElement,
  beamMode,
}: {
  caretIndex: number;
  elements: MusicalElement[];
  newElement: MusicalElement;
  beamMode: BeamModes;
}) {
  const _elements = [...elements];
  let insertedIndex = 0;
  let caretAdvance = 0;
  if (caretIndex === 0) {
    const right = _elements[caretIndex]; // まだ挿入してないのでcaretIdxと同じ
    applyBeam(beamMode, newElement, undefined, right);
    _elements.splice(caretIndex, 0, newElement);
    caretAdvance = 2;
  } else {
    if (caretIndex % 2 === 0) {
      // 挿入
      const insertIdx = caretIndex / 2;
      const left = _elements[insertIdx - 1];
      const right = _elements[insertIdx]; // まだ挿入してないのでinsertIdxと同じ
      console.log("insertIdx", insertIdx, "left", left, "right", right);
      applyBeam(beamMode, newElement, left, right);
      _elements.splice(insertIdx, 0, newElement);
      caretAdvance = 2;
      insertedIndex = insertIdx;
    } else {
      // 上書き
      const overrideIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
      const overrideEl = _elements[overrideIdx];
      if (
        newElement.type === "note" &&
        overrideEl.type === "note" &&
        newElement.duration === overrideEl.duration
      ) {
        newElement.pitches = sortPitches([
          ...overrideEl.pitches,
          ...newElement.pitches,
        ]);
      }
      const left = _elements[overrideIdx - 1];
      const right = _elements[overrideIdx + 1];
      applyBeam(beamMode, newElement, left, right);
      _elements.splice(overrideIdx, 1, newElement);
      insertedIndex = overrideIdx;
    }
  }
  return { elements: _elements, insertedIndex, caretAdvance };
}

const pitchByDistance = (scale: number, dy: number, origin: Pitch): Pitch => {
  const unitY = (UNIT / 2) * scale;
  return Math.round(dy / unitY + origin);
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
