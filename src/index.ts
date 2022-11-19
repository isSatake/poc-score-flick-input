import { registerPointerHandlers } from "./ui/pointer-event";
import {
  initCanvas,
  paintBBox,
  paintCaret,
  paintStaff,
  paintStyle,
  resetCanvas,
} from "./paint";
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
} from "./ui/pointer-handlers";
import { bStaffHeight, UNIT } from "./bravura";
import {
  accidentals,
  Bar,
  Clef,
  Duration,
  durations,
  MusicalElement,
  Note,
  Pitch,
} from "./notation/types";
import {
  BarInputCallback,
  CanvasCallback,
  CaretInputCallback,
  ChangeAccidentalCallback,
  ChangeBeamCallback,
  ChangeNoteRestCallback,
  NoteInputCallback,
} from "./ui/callbacks";
import { sortPitches } from "./pitch";
import {
  CaretStyle,
  determinePaintElementStyle,
  PaintElementStyle,
} from "./style";
import { BBox, offsetBBox, Point, scalePoint } from "./geometry";

export type BeamModes = "beam" | "lock" | "nobeam";
const accidentalModes = [undefined, ...accidentals] as const;
export type AccidentalModes = typeof accidentalModes[number];

const dpr = window.devicePixelRatio;
const scale = 0.08;
const previewScale = 0.08;
const leftOfStaff = 250;
const topOfStaff = 2000;
const defaultCaretWidth = 50;

window.onload = () => {
  const mainWidth = window.innerWidth;
  const mainHeight = window.innerHeight;
  const previewWidth = 300;
  const previewHeight = 400;
  const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
  const previewCanvas = document.getElementById(
    "previewCanvas"
  ) as HTMLCanvasElement;
  const mainCtx = mainCanvas.getContext("2d")!;
  const previewCtx = previewCanvas.getContext("2d")!;
  const noteKeyEls = Array.from(document.getElementsByClassName("note"));
  const changeNoteRestKey =
    document.getElementsByClassName("changeNoteRest")[0];
  let mainElements: MusicalElement[] = [];
  let caretPositions: CaretStyle[] = [];
  let caretIndex = 0;
  let isNoteInputMode = true;
  let beamMode: BeamModes = "nobeam";
  let accidentalModeIdx = 0;
  let lastEditedIdx: number;
  let styles: PaintElementStyle[] = [];
  const updateMain = () => {
    console.log("main", "start");
    resetCanvas({
      ctx: mainCtx,
      width: mainWidth,
      height: mainHeight,
      fillStyle: "#fff",
    });
    const clef: Clef = { type: "g" };
    let cursor = 0;
    caretPositions = [];
    mainCtx.save();
    mainCtx.scale(scale, scale);
    mainCtx.translate(leftOfStaff, topOfStaff);
    paintStaff(mainCtx, 0, 0, UNIT * 100, 1);
    styles = [...determinePaintElementStyle(mainElements, UNIT, { clef })];
    for (const style of styles) {
      console.log("style", style);
      const { width, element, caretOption } = style;
      paintStyle(mainCtx, style);
      if (caretOption) {
        const { index: elIdx, defaultWidth } = caretOption;
        const caretWidth = defaultWidth ? defaultCaretWidth : width;
        caretPositions.push({
          x: cursor + (defaultWidth ? width / 2 - caretWidth / 2 : 0),
          y: 0,
          width: caretWidth,
          elIdx,
        });
      }
      if (element.type !== "beam") {
        cursor += width;
        mainCtx.translate(width, 0);
      }
    }
    mainCtx.restore();
    console.log("carets", caretPositions);
    console.log("current caret", caretPositions[caretIndex]);
    mainCtx.save();
    mainCtx.scale(scale, scale);
    mainCtx.translate(leftOfStaff, topOfStaff);
    if (caretPositions[caretIndex]) {
      paintCaret({
        ctx: mainCtx,
        scale: 1,
        caret: caretPositions[caretIndex],
      });
    }
    for (let { bbox } of styles) {
      console.log(bbox);
      paintBBox(mainCtx, bbox);
    }
    mainCtx.restore();
    console.log("main", "end");
  };
  const updatePreview = (beamMode: BeamModes, newElement: MusicalElement) => {
    console.log("preview", "start");
    resetCanvas({
      ctx: previewCtx,
      width: previewWidth,
      height: previewHeight,
      fillStyle: "#fff",
    });
    const { elements: preview, insertedIndex } = inputMusicalElement({
      caretIndex,
      elements: mainElements,
      newElement,
      beamMode,
    });
    console.log("insertedIdx", insertedIndex);
    console.log("preview", preview);
    // B4がcanvasのvertical centerにくるように
    const _topOfStaff = previewHeight / 2 - (bStaffHeight * previewScale) / 2;
    const styles = [...determinePaintElementStyle(preview, UNIT)];
    const elIdxToX = new Map<number, number>();
    let cursor = 0;
    for (const style of styles) {
      const { width, element, index } = style;
      console.log("style", style);
      if (index !== undefined) {
        elIdxToX.set(index, cursor + width / 2);
      }
      if (element.type !== "beam") {
        cursor += width;
      }
    }

    console.log("elIdxToX", elIdxToX);

    // paint staff
    previewCtx.save();
    // x: 左端 y: 中心
    previewCtx.translate(0, _topOfStaff);
    previewCtx.scale(previewScale, previewScale);
    paintStaff(previewCtx, 0, 0, UNIT * 100, 1);
    previewCtx.restore();

    // paint elements
    previewCtx.save();
    // x: 中心, y: 中心
    previewCtx.translate(previewWidth / 2, _topOfStaff);
    previewCtx.scale(previewScale, previewScale);
    // x: previewの中心
    const centerX = elIdxToX.get(insertedIndex)!;
    console.log("centerX", centerX);
    previewCtx.translate(-centerX, 0);
    for (const style of styles) {
      const { width, element } = style;
      paintStyle(previewCtx, style);
      if (element.type !== "beam") {
        previewCtx.translate(width, 0);
      }
    }
    previewCtx.restore();
    console.log("preview", "end");
  };

  const changeNoteRestCallback: ChangeNoteRestCallback = {
    isNoteInputMode() {
      return isNoteInputMode;
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
      isNoteInputMode = !isNoteInputMode;
    },
  };
  const changeBeamCallback: ChangeBeamCallback = {
    getMode() {
      return beamMode;
    },
    change(mode) {
      noteKeyEls.forEach((el) => {
        el.className = el.className.replace(
          mode === "nobeam" ? "beamed" : "nobeam",
          mode === "nobeam" ? "nobeam" : "beamed"
        );
      });
      beamMode = mode;
      const lastEl = mainElements[lastEditedIdx];
      if (lastEl) {
        const left = mainElements[lastEditedIdx - 1];
        const right = mainElements[lastEditedIdx + 1];
        applyBeamForLastEdited(lastEl, left, right);
        updateMain();
      }
    },
  };
  const changeAccidentalCallback: ChangeAccidentalCallback = {
    getMode() {
      return accidentalModes[accidentalModeIdx];
    },
    next() {
      accidentalModeIdx =
        accidentalModeIdx === accidentalModes.length - 1
          ? 0
          : accidentalModeIdx + 1;
    },
  };
  const noteInputCallback: NoteInputCallback = {
    startPreview(duration: Duration, downX: number, downY: number) {
      const left = downX - previewWidth / 2;
      const top = downY - previewHeight / 2;
      initCanvas({
        dpr,
        leftPx: left,
        topPx: top,
        width: previewWidth,
        height: previewHeight,
        _canvas: previewCanvas,
      });
      const element: MusicalElement = isNoteInputMode
        ? {
            type: "note",
            duration,
            pitches: [
              {
                pitch: pitchByDistance(previewScale, 0, 6),
                accidental: accidentalModes[accidentalModeIdx],
              },
            ],
          }
        : {
            type: "rest",
            duration,
          };
      if (caretIndex > 0 && caretIndex % 2 !== 0) {
        const oldIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
        const oldEl = mainElements[oldIdx];
        if (
          element.type === "note" &&
          oldEl.type === "note" &&
          element.duration === oldEl.duration
        ) {
          element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
        }
      }
      updatePreview(beamMode, element);
      previewCanvas.style.visibility = "visible";
    },
    updatePreview(duration: Duration, dy: number) {
      const element: MusicalElement = isNoteInputMode
        ? {
            type: "note",
            duration,
            pitches: [
              {
                pitch: pitchByDistance(previewScale, dy, 6),
                accidental: accidentalModes[accidentalModeIdx],
              },
            ],
          }
        : {
            type: "rest",
            duration,
          };
      if (caretIndex > 0 && caretIndex % 2 !== 0) {
        const oldIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
        const oldEl = mainElements[oldIdx];
        if (
          element.type === "note" &&
          oldEl.type === "note" &&
          element.duration === oldEl.duration
        ) {
          element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
        }
      }
      updatePreview(beamMode, element);
    },
    commit(duration: Duration, dy?: number) {
      let newElement: MusicalElement;
      if (isNoteInputMode) {
        newElement = {
          type: "note",
          duration,
          pitches: [
            {
              pitch: pitchByDistance(previewScale, dy ?? 0, 6),
              accidental: accidentalModes[accidentalModeIdx],
            },
          ],
        };
      } else {
        newElement = {
          type: "rest",
          duration,
        };
      }
      const { elements, insertedIndex, caretAdvance } = inputMusicalElement({
        caretIndex,
        elements: mainElements,
        newElement,
        beamMode,
      });
      lastEditedIdx = insertedIndex;
      caretIndex += caretAdvance;
      mainElements = elements;
      updateMain();
    },
    backspace() {
      const targetElIdx = caretPositions[caretIndex].elIdx;
      if (targetElIdx < 0) {
        return;
      }
      const deleted = mainElements.splice(targetElIdx, 1)[0];
      if (deleted.type === "note") {
        const left = mainElements[targetElIdx - 1];
        const right = mainElements[targetElIdx];
        if (deleted.beam === "begin" && right) {
          (right as Note).beam = "begin";
        } else if (deleted.beam === "end" && left) {
          (left as Note).beam = "end";
        }
      }

      // 削除後のcaret位置を計算
      let t = caretIndex - 1;
      while (t > -1) {
        if (t === 0) {
          caretIndex = 0;
          t = -1;
        } else if (caretPositions[t].elIdx !== targetElIdx) {
          caretIndex = t;
          t = -1;
        } else {
          t--;
        }
      }

      updateMain();
    },
    finish() {
      previewCanvas.style.visibility = "hidden";
    },
  };

  const caretMoveCallback: CaretInputCallback = {
    back() {
      if (caretIndex % 2 !== 0) {
        const idx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
        if (idx === lastEditedIdx) {
          const lastEl = mainElements[lastEditedIdx];
          const left = mainElements[idx - 1];
          const right = mainElements[idx + 1];
          applyBeamForLastEdited(lastEl, left, right);
        }
      }
      caretIndex = Math.max(caretIndex - 1, 0);
      updateMain();
    },
    forward() {
      if (caretIndex % 2 === 0) {
        const idx = caretIndex / 2 - 1;
        if (idx === lastEditedIdx) {
          const lastEl = mainElements[lastEditedIdx];
          const left = mainElements[idx - 1];
          const right = mainElements[idx + 1];
          applyBeamForLastEdited(lastEl, left, right);
        }
      }
      caretIndex = Math.min(caretIndex + 1, caretPositions.length - 1);
      updateMain();
    },
  };

  const barInputCallback: BarInputCallback = {
    commit(bar: Bar) {
      const { elements, insertedIndex, caretAdvance } = inputMusicalElement({
        caretIndex,
        elements: mainElements,
        newElement: bar,
        beamMode,
      });
      lastEditedIdx = insertedIndex;
      caretIndex += caretAdvance;
      mainElements = elements;
      updateMain();
    },
  };

  const canvasCallback: CanvasCallback = {
    onMove(htmlPoint: Point) {
      for (const style of styles) {
        if (
          isPointInBBox(
            scalePoint(htmlPoint, 1 / scale),
            offsetBBox(style.bbox, { x: leftOfStaff, y: topOfStaff })
          )
        ) {
          console.log(style.element.type);
        }
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

  initCanvas({
    dpr,
    leftPx: 0,
    topPx: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    _canvas: mainCanvas,
  });
  initCanvas({
    dpr,
    leftPx: 0,
    topPx: 0,
    width: previewWidth,
    height: previewHeight,
    _canvas: previewCanvas,
  });
  updateMain();
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
