import { registerPointerHandlers } from "./ui/pointer-event";
import {
  Caret,
  drawCaret,
  drawElements,
  initCanvas,
  pitchByDistance,
  resetCanvas,
} from "./renderer";
import {
  ArrowHandler,
  ChangeNoteRestHandler,
  GrayPointerHandler,
  KeyboardDragHandler,
  KeyPressHandler,
  NoteInputHandler,
} from "./ui/pointer-handlers";
import { bStaffHeight, UNIT } from "./bravura";
import { Duration, Element } from "./notation/types";
import {
  CaretCallback,
  ChangeNoteRestCallback,
  NoteInputCallback,
} from "./ui/callbacks";
import { sortPitches } from "./pitch";

const scale = 0.12;
const previewScale = 0.19;
const leftOfStaff = 20;
const topOfStaff = 4000 * scale;
const elementGap = UNIT * 2 * scale;
let isNoteInputMode = true;

window.onload = () => {
  const mainWidth = window.innerWidth;
  const mainHeight = window.innerHeight;
  const previewWidth = 450;
  const previewHeight = 700;
  const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
  const previewCanvas = document.getElementById(
    "previewCanvas"
  ) as HTMLCanvasElement;
  const mainCtx = mainCanvas.getContext("2d")!;
  const previewCtx = previewCanvas.getContext("2d")!;
  const noteKeyEls = Array.from(document.getElementsByClassName("note"));
  const mainElements: Element[] = [];
  const elements: Element[] = [];
  let caretPositions: Caret[] = [];
  let caretIndex = 0;
  const updateMain = () => {
    resetCanvas({
      ctx: mainCtx,
      width: mainWidth,
      height: mainHeight,
      fillStyle: "#fff",
    });
    caretPositions = drawElements({
      ctx: mainCtx,
      canvasWidth: mainWidth,
      scale,
      leftOfStaff,
      topOfStaff,
      elementGap,
      elements: mainElements,
    });
    drawCaret({
      ctx: mainCtx,
      scale,
      pos: caretPositions[caretIndex],
    });
  };
  const updatePreview = (element?: Element) => {
    resetCanvas({
      ctx: previewCtx,
      width: previewWidth,
      height: previewHeight,
      fillStyle: "#fff",
    });
    if (!element) {
      return;
    }
    // B4がcanvasのvertical centerにくるように
    const _topOfStaff = previewHeight / 2 - (bStaffHeight * previewScale) / 2;
    drawElements({
      ctx: previewCtx,
      canvasWidth: previewWidth,
      scale: previewScale,
      leftOfStaff,
      topOfStaff: _topOfStaff,
      elementGap,
      elements: [element],
    });
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
      isNoteInputMode = !isNoteInputMode;
    },
  };
  const noteInputCallback: NoteInputCallback = {
    startPreview(duration: Duration, downX: number, downY: number) {
      const left = downX - previewWidth / 2;
      const top = downY - previewHeight / 2;
      initCanvas(left, top, previewWidth, previewHeight, previewCanvas);
      const element: Element = isNoteInputMode
        ? {
            type: "note",
            duration,
            pitches: [{ pitch: pitchByDistance(previewScale, 0, 6) }],
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
      updatePreview(element);
      previewCanvas.style.visibility = "visible";
    },
    updatePreview(duration: Duration, dy: number) {
      const element: Element = isNoteInputMode
        ? {
            type: "note",
            duration,
            pitches: [{ pitch: pitchByDistance(previewScale, dy, 6) }],
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
      updatePreview(element);
    },
    commit(duration: Duration, dy?: number) {
      const newEl: Element = isNoteInputMode
        ? {
            type: "note",
            duration,
            pitches: [{ pitch: pitchByDistance(previewScale, dy ?? 0, 6) }],
          }
        : {
            type: "rest",
            duration,
          };
      if (caretIndex > 0) {
        if (caretIndex % 2 === 0) {
          // 挿入
          mainElements.splice(caretIndex / 2, 0, newEl);
          caretIndex += 2;
        } else {
          // 上書き
          const oldIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
          const oldEl = mainElements[oldIdx];
          if (
            newEl.type === "note" &&
            oldEl.type === "note" &&
            newEl.duration === oldEl.duration
          ) {
            newEl.pitches = sortPitches([...oldEl.pitches, ...newEl.pitches]);
          }
          mainElements.splice(oldIdx, 1, newEl);
        }
      } else {
        mainElements.splice(caretIndex, 0, newEl);
        caretIndex += 2;
      }
      updateMain();
    },
    backspace() {
      const targetElIdx = caretPositions[caretIndex].elIdx;
      if (targetElIdx < 0) {
        return;
      }
      mainElements.splice(targetElIdx, 1);

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

  const caretMoveCallback: CaretCallback = {
    back() {
      caretIndex = Math.max(caretIndex - 1, 0);
      updateMain();
    },
    forward() {
      caretIndex = Math.min(caretIndex + 1, caretPositions.length - 1);
      updateMain();
    },
  };

  // for tablet
  // registerPointerHandlers(
  //   ["keyboardBottom", "keyboardHandle"],
  //   [new KeyboardDragHandler()]
  // );
  registerPointerHandlers(
    ["changeNoteRest"],
    [new ChangeNoteRestHandler(changeNoteRestCallback)]
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
  registerPointerHandlers([], [new GrayPointerHandler()]);

  initCanvas(0, 0, window.innerWidth, window.innerHeight, mainCanvas);
  initCanvas(0, 0, previewWidth, previewHeight, previewCanvas);
  updateMain();
};
