import { UNIT } from "./bravura";
import {
  addCaret,
  getCaretPositions,
  getCurrentCaret,
  initCaretPositions,
} from "./caret-states";
import { offsetBBox } from "./geometry";
import { Clef } from "./notation/types";
import { paintCaret, paintStaff, paintStyle, resetCanvas } from "./paint";
import {
  getLeftOfStaff,
  getScale,
  getTopOfStaff,
  kDefaultCaretWidth,
} from "./score-preferences";
import {
  addElementBBoxes,
  getMainElements,
  getPointing,
  getStyles,
  initElementBBoxes,
  setStyles,
} from "./score-states";
import { determinePaintElementStyle } from "./style/style";

export const updateMain = (mainCtx: CanvasRenderingContext2D) => {
  console.log("main", "start");
  resetCanvas({
    ctx: mainCtx,
    width: window.innerWidth,
    height: window.innerHeight,
    fillStyle: "#fff",
  });
  initCaretPositions();
  initElementBBoxes();
  mainCtx.save();
  mainCtx.scale(getScale(), getScale());
  mainCtx.translate(getLeftOfStaff(), getTopOfStaff());
  paintStaff(mainCtx, 0, 0, UNIT * 100, 1);
  const clef: Clef = { type: "g" };
  setStyles(
    determinePaintElementStyle(getMainElements(), UNIT, { clef }, getPointing())
  );
  let cursor = 0;
  for (const style of getStyles()) {
    console.log("style", style);
    const { width, element, caretOption, bbox, index: elIdx } = style;
    paintStyle(mainCtx, style);
    const _bbox = offsetBBox(bbox, { x: cursor });
    addElementBBoxes({ bbox: _bbox, elIdx });
    // paintBBox(mainCtx, bbox); // debug
    if (caretOption) {
      const { index: elIdx, defaultWidth } = caretOption;
      const caretWidth = defaultWidth ? kDefaultCaretWidth : width;
      addCaret({
        x: cursor + (defaultWidth ? width / 2 - caretWidth / 2 : 0),
        y: 0,
        width: caretWidth,
        elIdx,
      });
    }
    if (element.type !== "beam" && element.type !== "tie") {
      cursor += width;
      mainCtx.translate(width, 0);
    }
  }
  mainCtx.restore();
  console.log("carets", getCaretPositions());
  console.log("current caret", getCurrentCaret());
  mainCtx.save();
  mainCtx.scale(getScale(), getScale());
  mainCtx.translate(getLeftOfStaff(), getTopOfStaff());
  if (getCurrentCaret()) {
    paintCaret({
      ctx: mainCtx,
      scale: 1,
      caret: getCurrentCaret(),
    });
  }
  mainCtx.restore();
  console.log("main", "end");
};
