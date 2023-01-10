import { UNIT } from "./font/bravura";
import { offsetBBox } from "./geometry";
import { paintCaret, paintStaff, paintStyle, resetCanvas } from "./paint";
import { getScale, getStaffOrigin } from "./score-preferences";
import {
  addCaret,
  getCaretPositions,
  getCurrentCaret,
  initCaretPositions,
  addElementBBoxes,
  getMainElements,
  getPointing,
  getStyles,
  initElementBBoxes,
  setStyles,
} from "./score-states";
import { determineCaretStyle, determinePaintElementStyle } from "./style/style";

let isUpdated = false;
export const getShouldRender = () => isUpdated;
export const setUpdated = (v: boolean) => {
  isUpdated = v;
};

export const updateMain = () => {
  setStyles(
    determinePaintElementStyle(
      getMainElements(),
      UNIT,
      { clef: { type: "g" } },
      getPointing()
    )
  );
  initCaretPositions();
  initElementBBoxes();
  let cursor = 0;
  for (const style of getStyles()) {
    console.log("style", style);
    const { width, element, caretOption, bbox, index: elIdx } = style;
    addElementBBoxes({ bbox: offsetBBox(bbox, { x: cursor }), elIdx });
    if (caretOption) {
      addCaret(determineCaretStyle(caretOption, width, cursor));
    }
    if (element.type !== "beam" && element.type !== "tie") {
      cursor += width;
    }
  }
  setUpdated(true);
};

export const renderScore = (ctx: CanvasRenderingContext2D) => {
  resetCanvas({
    ctx,
    width: window.innerWidth,
    height: window.innerHeight,
    fillStyle: "#fff",
  });
  ctx.save();
  ctx.scale(getScale(), getScale());
  ctx.translate(getStaffOrigin().x, getStaffOrigin().y);
  paintStaff(ctx, 0, 0, UNIT * 100, 1);
  for (const style of getStyles()) {
    paintStyle(ctx, style);
    // paintBBox(ctx, style.bbox); // debug
    if (style.element.type !== "beam" && style.element.type !== "tie") {
      ctx.translate(style.width, 0);
    }
  }
  ctx.restore();
  renderCaret(ctx);
};

const renderCaret = (mainCtx: CanvasRenderingContext2D) => {
  console.log("carets", getCaretPositions());
  console.log("current caret", getCurrentCaret());
  mainCtx.save();
  mainCtx.scale(getScale(), getScale());
  mainCtx.translate(getStaffOrigin().x, getStaffOrigin().y);
  paintCaret({
    ctx: mainCtx,
    scale: 1,
    caret: getCurrentCaret(),
  });
  mainCtx.restore();
};
