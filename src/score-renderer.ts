import { UNIT } from "./bravura";
import {
  addCaret,
  getCaretPositions,
  getCurrentCaret,
  initCaretPositions,
} from "./caret-states";
import { offsetBBox } from "./geometry";
import { paintCaret, paintStaff, paintStyle, resetCanvas } from "./paint";
import {
  getScale,
  getStaffOrigin,
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
  // canvas・各種ステートの初期化、五線の描画
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
  mainCtx.translate(getStaffOrigin().x, getStaffOrigin().y);
  paintStaff(mainCtx, 0, 0, UNIT * 100, 1);
  // style生成
  setStyles(
    determinePaintElementStyle(
      getMainElements(),
      UNIT,
      { clef: { type: "g" } },
      getPointing()
    )
  );
  // style描画、当たり判定用bbox生成、キャレット生成
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
  updateCaret(mainCtx);
  console.log("main", "end");
};

const updateCaret = (mainCtx: CanvasRenderingContext2D) => {
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
