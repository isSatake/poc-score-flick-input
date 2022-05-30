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

const scale = 0.08;
const leftOfStaff = 20;
const topOfStaff = 2000 * scale;
const elementGap = UNIT * 2 * scale;
let isNoteInputMode = true;

window.onload = () => {
  const mainWidth = window.innerWidth;
  const mainHeight = window.innerHeight;
  const previewWidth = 300;
  const previewHeight = 600;
  const mainCanvas = document.getElementById("mainCanvas") as HTMLCanvasElement;
  const previewCanvas = document.getElementById(
    "previewCanvas"
  ) as HTMLCanvasElement;
  const mainCtx = mainCanvas.getContext("2d")!;
  const previewCtx = previewCanvas.getContext("2d")!;
  const noteKeyEls = Array.from(document.getElementsByClassName("note"));
  const mainElements: Element[] = [];
  const elements: Element[] = [
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 2 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 4 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 5 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 0 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: -3 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 1 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: -4 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 7 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 9 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 10 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 7 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 9 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "end",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 10 }],
      beam: "begin",
    },
    {
      type: "note",
      duration: 8,
      pitches: [{ pitch: 6 }],
      beam: "end",
    },
  ];
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
      elements,
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
    const _topOfStaff = previewHeight / 2 - (bStaffHeight * scale) / 2;
    drawElements({
      ctx: previewCtx,
      canvasWidth: previewWidth,
      scale,
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
      updatePreview({
        type: isNoteInputMode ? "note" : "rest",
        duration,
        pitch: pitchByDistance(scale, 0, 6),
      });
      previewCanvas.style.visibility = "visible";
    },
    updatePreview(duration: Duration, dy: number) {
      updatePreview({
        type: isNoteInputMode ? "note" : "rest",
        duration,
        pitch: pitchByDistance(scale, dy, 6),
      });
    },
    commit(duration: Duration, dy?: number) {
      const pitch = pitchByDistance(scale, dy ?? 0, 6);
      console.log(isNoteInputMode);
      mainElements.push({
        type: isNoteInputMode ? "note" : "rest",
        duration,
        pitch,
      });
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

  registerPointerHandlers(
    ["keyboardBottom", "keyboardHandle"],
    [new KeyboardDragHandler()]
  );
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

  initCanvas(0, 0, window.innerWidth, window.innerHeight, mainCanvas);
  initCanvas(0, 0, previewWidth, previewHeight, previewCanvas);
  updateMain();
};
