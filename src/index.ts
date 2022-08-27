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
  ChangeBeamHandler,
  ChangeNoteRestHandler,
  GrayPointerHandler,
  KeyboardDragHandler,
  KeyPressHandler,
  NoteInputHandler,
} from "./ui/pointer-handlers";
import { bStaffHeight, UNIT } from "./bravura";
import { Duration, Element, Note, Rest } from "./notation/types";
import {
  CaretCallback,
  ChangeBeamCallback,
  ChangeNoteRestCallback,
  NoteInputCallback,
} from "./ui/callbacks";
import { sortPitches } from "./pitch";

export type BeamModes = "beam" | "lock" | "nobeam";

const scale = 0.08;
const previewScale = 0.08;
const leftOfStaff = 20;
const topOfStaff = 2000 * scale;
const elementGap = UNIT * 2 * scale;

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
  const mainElements: (Note | Rest)[] = [];
  // const elements: Element[] = [];
  let caretPositions: Caret[] = [];
  let caretIndex = 0;
  let isNoteInputMode = true;
  let beamMode: BeamModes = "nobeam";
  let lastEditedIdx: number;
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
  const updatePreview = (beamMode: BeamModes, element?: Element) => {
    resetCanvas({
      ctx: previewCtx,
      width: previewWidth,
      height: previewHeight,
      fillStyle: "#fff",
    });
    if (!element) {
      return;
    }
    const preview: Element = { ...element };
    if (beamMode !== "nobeam" && preview.type === "note") {
      preview.beam = "begin";
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
      elements: [preview],
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
      updatePreview(beamMode, element);
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
      updatePreview(beamMode, element);
    },
    commit(duration: Duration, dy?: number) {
      let newEl: Element;
      if (isNoteInputMode) {
        newEl = {
          type: "note",
          duration,
          pitches: [{ pitch: pitchByDistance(previewScale, dy ?? 0, 6) }],
        };
      } else {
        newEl = {
          type: "rest",
          duration,
        };
      }
      // 先頭
      if (caretIndex === 0) {
        const right = mainElements[caretIndex]; // まだ挿入してないのでcaretIdxと同じ
        applyBeam(beamMode, newEl, undefined, right);
        mainElements.splice(caretIndex, 0, newEl);
        caretIndex += 2;
        lastEditedIdx = 0;
      } else {
        if (caretIndex % 2 === 0) {
          // 挿入
          const insertIdx = caretIndex / 2;
          const left = mainElements[insertIdx - 1];
          const right = mainElements[insertIdx]; // まだ挿入してないのでinsertIdxと同じ
          console.log("insertIdx", insertIdx, "left", left, "right", right);
          applyBeam(beamMode, newEl, left, right);
          mainElements.splice(insertIdx, 0, newEl);
          caretIndex += 2;
          lastEditedIdx = insertIdx;
        } else {
          // 上書き
          const overrideIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
          const overrideEl = mainElements[overrideIdx];
          if (
            newEl.type === "note" &&
            overrideEl.type === "note" &&
            newEl.duration === overrideEl.duration
          ) {
            newEl.pitches = sortPitches([
              ...overrideEl.pitches,
              ...newEl.pitches,
            ]);
          }
          const left = mainElements[overrideIdx - 1];
          const right = mainElements[overrideIdx + 1];
          applyBeam(beamMode, newEl, left, right);
          mainElements.splice(overrideIdx, 1, newEl);
          lastEditedIdx = overrideIdx;
        }
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
      if (caretIndex % 2 !== 0) {
        const idx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
        if (idx === lastEditedIdx) {
          if (idx === lastEditedIdx) {
            const lastEl = mainElements[lastEditedIdx];
            const left = mainElements[idx - 1];
            const right = mainElements[idx + 1];
            applyBeamForLastEdited(lastEl, left, right);
          }
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
  // for screen capture
  registerPointerHandlers([], [new GrayPointerHandler()]);

  initCanvas(0, 0, window.innerWidth, window.innerHeight, mainCanvas);
  initCanvas(0, 0, previewWidth, previewHeight, previewCanvas);
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
  insert: Note | Rest,
  left: Note | Rest | undefined,
  right: Note | Rest | undefined
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
  last: Element,
  left?: Element,
  right?: Element
) {
  console.log(last, left, right);
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
