import {
  bClefG,
  bLedgerLineThickness,
  bStaffHeight,
  bStaffLineWidth,
  Path,
  repeatDotRadius,
  UNIT,
} from "./bravura";
import {
  accidentalPathMap,
  downFlagMap,
  noteHeadByDuration,
  restPathMap,
  upFlagMap,
} from "./notation/notation";
import {
  BarStyle,
  BeamStyle,
  CaretStyle,
  NoteStyleElement,
  PaintElementStyle,
  pitchToY,
  RestStyle,
} from "./style";
import { BBox } from "./geometry";

export const initCanvas = ({
  dpr,
  leftPx,
  topPx,
  width,
  height,
  _canvas,
}: {
  dpr: number;
  leftPx: number;
  topPx: number;
  width: number;
  height: number;
  _canvas?: HTMLCanvasElement;
}) => {
  const canvas = _canvas ?? document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = `${topPx}px`;
  canvas.style.left = `${leftPx}px`;
  canvas.style.width = `${width}px`;
  // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#scaling_for_high_resolution_displays
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = `${height}px`;
  canvas.getContext("2d")?.scale(dpr, dpr);
};

const paintBravuraPath = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  scale: number,
  path: Path
) => {
  ctx.save();
  ctx.rotate((Math.PI / 180) * 180); // もとのパスは回転している
  ctx.translate(-left, -top); // 回転しているため負の値
  ctx.scale(-scale, scale); // もとのパスは五線の高さを1000としているのでスケールする
  ctx.fill(path.path2d);
  ctx.restore();
};

const paintGClef = (
  ctx: CanvasRenderingContext2D,
  left: number,
  topOfStaff: number
) => {
  const g = pitchToY(topOfStaff, 4, 1);
  paintBravuraPath(ctx, left, g, 1, bClefG);
};

export const paintStaff = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  scale: number
) => {
  const heightHead = UNIT * scale;
  for (let i = 0; i < 5; i++) {
    const y = top + heightHead * i;
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = bStaffLineWidth * scale;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
};

/**
 * 小節線描画
 */
const paintBarline = (ctx: CanvasRenderingContext2D, element: BarStyle) => {
  for (const el of element.elements) {
    ctx.save();
    if (el.type === "line") {
      ctx.translate(el.position.x + el.lineWidth / 2, el.position.y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = el.lineWidth;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, el.height);
      ctx.closePath();
      ctx.stroke();
    } else {
      const rad = repeatDotRadius;
      ctx.translate(el.position.x + rad, el.position.y);
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, UNIT, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
};

const paintNote = ({
  ctx,
  elements,
}: {
  ctx: CanvasRenderingContext2D;
  elements: NoteStyleElement[];
}) => {
  for (const noteEl of elements) {
    if (noteEl.type === "head") {
      const { duration, position } = noteEl;
      ctx.save();
      ctx.translate(position.x, position.y);
      const path = noteHeadByDuration(duration);
      paintBravuraPath(ctx, 0, 0, 1, path);
      ctx.restore();
    } else if (noteEl.type === "ledger") {
      const { width, position } = noteEl;
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = bLedgerLineThickness;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (noteEl.type === "accidental") {
      const { position, accidental } = noteEl;
      const path = accidentalPathMap.get(accidental)!;
      ctx.save();
      ctx.translate(position.x, position.y);
      paintBravuraPath(ctx, 0, 0, 1, path);
      ctx.restore();
    } else if (noteEl.type === "flag") {
      const { duration, direction, position } = noteEl;
      const path =
        direction === "up"
          ? upFlagMap.get(duration)
          : downFlagMap.get(duration);
      if (path) {
        paintBravuraPath(ctx, position.x, position.y, 1, path);
      }
    } else if (noteEl.type === "stem") {
      const { top, bottom, center, width } = noteEl;
      ctx.save();
      ctx.translate(center, top);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, bottom - top);
      ctx.stroke();
      ctx.restore();
    }
  }
};

const paintRest = ({
  ctx,
  element,
}: {
  ctx: CanvasRenderingContext2D;
  element: RestStyle;
}) => {
  const { rest, position } = element;
  const path = restPathMap.get(rest.duration)!;
  ctx.save();
  ctx.translate(position.x, position.y);
  paintBravuraPath(ctx, 0, 0, 1, path);
  ctx.restore();
};

const paintBeam = (ctx: CanvasRenderingContext2D, beam: BeamStyle) => {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(beam.nw.x, beam.nw.y);
  ctx.lineTo(beam.sw.x, beam.sw.y);
  ctx.lineTo(beam.se.x, beam.se.y);
  ctx.lineTo(beam.ne.x, beam.ne.y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

export const paintStyle = (
  ctx: CanvasRenderingContext2D,
  { element }: PaintElementStyle
) => {
  const { type } = element;
  if (type === "clef") {
    paintGClef(ctx, 0, 0);
  } else if (type === "note") {
    paintNote({ ctx, elements: element.elements });
  } else if (type === "rest") {
    paintRest({ ctx, element });
  } else if (type === "beam") {
    paintBeam(ctx, element);
  } else if (type === "bar") {
    paintBarline(ctx, element);
  } else if (type === "gap") {
    // no-op
  }
};

export const paintBBox = (ctx: CanvasRenderingContext2D, bbox: BBox) => {
  ctx.save();
  ctx.strokeStyle = "#FF0000";
  ctx.strokeRect(
    bbox.left,
    bbox.top,
    bbox.right - bbox.left,
    bbox.bottom - bbox.top
  );
  ctx.restore();
};

export const paintCaret = ({
  ctx,
  scale,
  caret,
}: {
  ctx: CanvasRenderingContext2D;
  scale: number;
  caret: CaretStyle;
}) => {
  const { x, y, width } = caret;
  const height = bStaffHeight * scale;
  ctx.save();
  ctx.fillStyle = "#FF000055";
  ctx.fillRect(x, y, width, height);
  ctx.restore();
};

export const resetCanvas = ({
  ctx,
  width,
  height,
  fillStyle,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fillStyle: string;
}) => {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};
