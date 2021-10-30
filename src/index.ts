import {
  bAccidentalFlat,
  bAccidentalNatural,
  bAccidentalSharp,
  bClefG,
  bFlag16Down,
  bFlag16Up,
  bFlag32Down,
  bFlag32Up,
  bFlag8Down,
  bFlag8Up,
  bLedgerLineWidth,
  bNoteHead,
  bNoteHeadHalf,
  bNoteHeadWhole,
  bRest1,
  bRest16,
  bRest2,
  bRest32,
  bRest4,
  bRest8,
  bStaffHeight,
  bStaffLineWidth,
  bStemWidth,
  bThinBarlineThickness,
  EXTENSION_LEDGER_LINE,
  FlagDown,
  FlagUp,
  Path,
  RestPath,
  UNIT,
  WIDTH_NOTE_HEAD_BLACK,
  WIDTH_NOTE_HEAD_WHOLE,
} from "./bravura";
import { registerPointerHandlers } from "./pointer-event";
import {
  ChangeNoteRestHandler,
  InputHandler,
  KeyboardDragHandler,
  KeyPressHandler,
} from "./pointer-handlers";

const durations = [1, 2, 4, 8, 16, 32] as const;
export type Duration = typeof durations[number];

// C4 (middleC) = 0
type Pitch = number;

// 臨時記号の表記
type Accidental = "sharp" | "natural" | "flat";

type Note = {
  type: "note";
  pitch: Pitch;
  duration: Duration;
  accidental?: Accidental;
};

type Rest = {
  type: "rest";
  duration: Duration;
};

type Bar = {
  type: "bar";
};

type Element = Note | Rest | Bar;

const upFlagMap = new Map<Duration, FlagUp>([
  [8, bFlag8Up],
  [16, bFlag16Up],
  [32, bFlag32Up],
]);

const downFlagMap = new Map<Duration, FlagDown>([
  [8, bFlag8Down],
  [16, bFlag16Down],
  [32, bFlag32Down],
]);

const restPathMap = new Map<Duration, RestPath>([
  [1, bRest1],
  [2, bRest2],
  [4, bRest4],
  [8, bRest8],
  [16, bRest16],
  [32, bRest32],
]);

const accidentalPathMap = new Map<Accidental, Path>([
  ["sharp", bAccidentalSharp],
  ["natural", bAccidentalNatural],
  ["flat", bAccidentalFlat],
]);

const noteHeadByDuration = (duration: Duration): Path => {
  switch (duration) {
    case 1:
      return bNoteHeadWhole;
    case 2:
      return bNoteHeadHalf;
    default:
      return bNoteHead;
  }
};

const noteHeadWidth = (duration: Duration): number => {
  if (duration === 1) {
    return WIDTH_NOTE_HEAD_WHOLE;
  }
  return WIDTH_NOTE_HEAD_BLACK;
};

const initCanvas = (
  leftPx: number,
  topPx: number,
  width: number,
  height: number,
  _canvas?: HTMLCanvasElement
): HTMLCanvasElement => {
  const canvas = _canvas ?? document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = `${topPx}px`;
  canvas.style.left = `${leftPx}px`;
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const drawBravuraPath = (
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

const drawGClef = (
  ctx: CanvasRenderingContext2D,
  left: number,
  topOfStaff: number,
  scale: number
): DrawnSection => {
  const y = topOfStaff + UNIT * scale * 3; // 五線上のGの高さ
  drawBravuraPath(ctx, left, y, scale, bClefG);
  return calcSection(left, scale, bClefG);
};

const drawStaff = (
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

const pitchToY = (topOfStaff: number, pitch: Pitch, scale: number): number => {
  // ギターの音域に合わせ最低音をE2(=index:0)としている
  // middleC(C4)=0とする
  // y原点は符頭の中心(音程を示す高さ)
  const halfOfNoteHeadHeight = (bStaffHeight * scale) / 8;
  const c4y = topOfStaff + UNIT * 4.5 * scale + halfOfNoteHeadHeight;
  return c4y - pitch * halfOfNoteHeadHeight;
};

type DrawnSection = {
  start: number;
  end: number;
};

const calcSection = (
  start: number,
  scale: number,
  path: Path
): DrawnSection => {
  const width = (path.bbox.ne.x - path.bbox.sw.x) * UNIT * scale;
  return { start, end: start + width };
};

const drawNoteHead = (params: DrawNoteParams): DrawnSection => {
  const { ctx, left, topOfStaff, note, scale } = params;
  const { pitch, duration } = note;
  const top = pitchToY(topOfStaff, pitch, scale);
  const path = noteHeadByDuration(duration);
  drawBravuraPath(ctx, left, top, scale, path);
  return calcSection(left, scale, path);
};

// note headからはみ出る長さ(片方)
const ledgerLineExtension = (scale: number): number => {
  return UNIT * EXTENSION_LEDGER_LINE * scale;
};

const drawLedgerLine = (
  ctx: CanvasRenderingContext2D,
  top: number,
  start: number,
  note: Note,
  scale: number
): DrawnSection => {
  const end =
    start +
    noteHeadWidth(note.duration) * scale +
    ledgerLineExtension(scale) * 2;
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = bLedgerLineWidth * scale;
  ctx.beginPath();
  ctx.moveTo(start, top);
  ctx.lineTo(end, top);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  return { start, end };
};

const drawLedgerLines = (params: DrawNoteParams): DrawnSection | undefined => {
  const { ctx, note, scale, left, topOfStaff } = params;
  const { pitch } = note;
  let section: DrawnSection | undefined;
  if (pitch <= 0) {
    // 0=C4
    for (let i = 0; i >= pitch; i -= 2) {
      section = drawLedgerLine(
        ctx,
        pitchToY(topOfStaff, i, scale),
        left,
        note,
        scale
      );
    }
  } else if (pitch >= 12) {
    // 12=A5
    for (let i = 12; i < pitch + 1; i += 2) {
      section = drawLedgerLine(
        ctx,
        pitchToY(topOfStaff, i, scale),
        left,
        note,
        scale
      );
    }
  }
  return section;
};

const drawStemAndFlags = (params: DrawNoteParams): DrawnSection | undefined => {
  const { ctx, topOfStaff, left, scale, note } = params;
  const { pitch, duration } = note;
  if (duration === 1) {
    return;
  }
  const heightOfB3 = topOfStaff + (bStaffHeight * scale) / 2;
  const lineWidth = bStemWidth * scale;
  let stemCenter: number;
  let top: number;
  let bottom: number;
  let drawnSection: DrawnSection | undefined;
  if (pitch < 6) {
    // B4未満 -> 上向き (楽譜の書き方p17)
    // 符頭の右に符幹がはみ出るのを補正 (lineWidth / 2)
    stemCenter = left + WIDTH_NOTE_HEAD_BLACK * scale - lineWidth / 2;
    bottom = pitchToY(topOfStaff, pitch, scale) - 5;
    if (pitch < 0) {
      // C4より低い -> topはB3 (楽譜の書き方p17)
      top = heightOfB3;
    } else {
      // stemの長さは基本1オクターブ分 (楽譜の書き方p17)
      // 32分以降は1間ずつ長くする (楽譜の書き方p53)
      const index = duration <= 32 ? pitch + 7 : pitch + 8;
      top = pitchToY(topOfStaff, index, scale);
    }
    const path = upFlagMap.get(duration);
    if (path) {
      drawBravuraPath(
        ctx,
        stemCenter - lineWidth / 2 + UNIT * path.stemUpNW.x * scale,
        top + UNIT * path.stemUpNW.y * scale,
        scale,
        path
      );
      drawnSection = calcSection(left, scale, path);
    }
  } else {
    // 下向き
    stemCenter = left + lineWidth / 2;
    top = pitchToY(topOfStaff, pitch, scale);
    if (pitch > 12) {
      // A5より高い -> bottomはB3
      bottom = heightOfB3;
    } else {
      const index = duration < 32 ? pitch - 7 : pitch - 8;
      bottom = pitchToY(topOfStaff, index, scale);
    }
    const path = downFlagMap.get(duration);
    if (path) {
      drawBravuraPath(
        ctx,
        stemCenter - lineWidth / 2 + UNIT * path.stemDownSW.x * scale,
        bottom + UNIT * path.stemDownSW.y * scale,
        scale,
        path
      );
      drawnSection = calcSection(left, scale, path);
    }
  }

  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(stemCenter, top);
  ctx.lineTo(stemCenter, bottom);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  if (drawnSection) {
    return drawnSection;
  } else {
    return { start: left, end: left + lineWidth };
  }
};

const drawAccidental = (params: DrawNoteParams): DrawnSection | undefined => {
  const { ctx, left, topOfStaff, note, scale } = params;
  const { pitch, accidental } = note;
  if (!accidental) {
    return;
  }
  const top = pitchToY(topOfStaff, pitch, scale);
  const path = accidentalPathMap.get(accidental)!;
  drawBravuraPath(ctx, left, top, scale, path);
  return calcSection(left, scale, path);
};

interface DrawNoteParams {
  ctx: CanvasRenderingContext2D;
  topOfStaff: number;
  left: number;
  note: Note;
  scale: number;
}

const gapWithAccidental = (scale: number): number => {
  return (UNIT / 4) * scale; // 勘
};

/**
 * 音符描画
 */
const drawNote = (params: DrawNoteParams): DrawnSection => {
  const { scale, left } = params;
  const arr: (DrawnSection | undefined)[] = [];
  arr.push(drawAccidental(params));
  let leftOfLedgerLine = left;
  if (arr[0]?.end) {
    leftOfLedgerLine = arr[0]?.end + gapWithAccidental(scale);
  }
  arr.push(drawLedgerLines({ ...params, left: leftOfLedgerLine }));
  let leftOfNoteHead = left;
  if (arr[1]?.start) {
    leftOfNoteHead = arr[1].start + ledgerLineExtension(scale);
  } else if (arr[0]?.end) {
    leftOfNoteHead = arr[0]?.end + gapWithAccidental(scale) * 2;
  }
  arr.push(drawNoteHead({ ...params, left: leftOfNoteHead }));
  arr.push(drawStemAndFlags({ ...params, left: leftOfNoteHead }));
  const start = Math.min(
    ...arr.map((section) => section?.start ?? params.left)
  );
  const end = Math.max(...arr.map((section) => section?.end ?? params.left));
  return { start, end };
};

/**
 * 休符描画
 */
const drawRest = (
  ctx: CanvasRenderingContext2D,
  topOfStaff: number,
  leftOfRest: number,
  rest: Rest,
  scale: number
): DrawnSection => {
  const path = restPathMap.get(rest.duration)!;
  drawBravuraPath(
    ctx,
    leftOfRest,
    topOfStaff + UNIT * path.top * scale,
    scale,
    path
  );
  return calcSection(leftOfRest, scale, path);
};

/**
 * 小節線描画
 */
const drawBarline = (
  ctx: CanvasRenderingContext2D,
  topOfStaff: number,
  left: number,
  scale: number
): DrawnSection => {
  const width = UNIT * bThinBarlineThickness * scale;
  const center = left + width / 2;
  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(center, topOfStaff);
  ctx.lineTo(center, topOfStaff + bStaffHeight * scale);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  return {
    start: left,
    end: left + width,
  };
};

const draw = ({
  ctx,
  canvasWidth,
  scale,
  leftOfStaff,
  topOfStaff,
  elementGap,
  elements,
}: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  scale: number;
  leftOfStaff: number;
  topOfStaff: number;
  elementGap: number;
  elements: Element[];
}) => {
  drawStaff(ctx, leftOfStaff, topOfStaff, canvasWidth - leftOfStaff * 2, scale);
  let cursor = leftOfStaff + elementGap;
  cursor = drawGClef(ctx, cursor, topOfStaff, scale).end;
  if (elements.length === 0) {
    return;
  }
  for (let i in elements) {
    const el = elements[i];
    const left = cursor + elementGap;
    switch (el.type) {
      case "note":
        cursor = drawNote({
          ctx,
          topOfStaff: topOfStaff,
          left,
          note: el,
          scale,
        }).end;
        break;
      case "rest":
        cursor = drawRest(ctx, topOfStaff, left, el, scale).end;
        break;
      case "bar":
        cursor = drawBarline(ctx, topOfStaff, left, scale).end;
        break;
    }
  }
};

const scale = 0.08;
const leftOfStaff = 20;
const topOfStaff = 2000 * scale;
const elementGap = UNIT * 2 * scale;

const resetCanvas = ({
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

let isNoteInputMode = true;

export interface ChangeNoteRestCallback {
  isNoteInputMode(): boolean;
  change(): void;
}

// このコールバックはキーハンドラだけじゃなくてMIDIキーとか普通のキーボードとかからも使う想定
export interface InputCallback {
  startPreview(duration: Duration, downX: number, downY: number): void;
  updatePreview(duration: Duration, dy: number): void;
  commit(duration: Duration, dy?: number): void;
  backspace(): void;
  finish(): void;
}

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
  const updateMain = (elements: Element[]) => {
    resetCanvas({
      ctx: mainCtx,
      width: mainWidth,
      height: mainHeight,
      fillStyle: "#fff",
    });
    draw({
      ctx: mainCtx,
      canvasWidth: mainWidth,
      scale,
      leftOfStaff,
      topOfStaff,
      elementGap,
      elements,
    });
  };
  const updatePreview = (element?: Element) => {
    resetCanvas({
      ctx: previewCtx,
      width: previewWidth,
      height: previewHeight,
      fillStyle: "#aaa",
    });
    if (element) {
      // B4がcanvasのvertical centerにくるように
      const _topOfStaff = previewHeight / 2 - (bStaffHeight * scale) / 2;
      draw({
        ctx: previewCtx,
        canvasWidth: previewWidth,
        scale,
        leftOfStaff,
        topOfStaff: _topOfStaff,
        elementGap,
        elements: [element],
      });
    }
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
  const inputCallback: InputCallback = {
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
      mainElements.push({
        type: isNoteInputMode ? "note" : "rest",
        duration,
        pitch,
      });
      updateMain(mainElements);
    },
    backspace() {
      mainElements.pop();
      updateMain(mainElements);
    },
    finish() {
      previewCanvas.style.visibility = "hidden";
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
    ["grayKey", "whiteKey"],
    [new InputHandler(inputCallback)]
  );

  initCanvas(0, 0, window.innerWidth, window.innerHeight, mainCanvas);
  initCanvas(0, 0, previewWidth, previewHeight, previewCanvas);
  updateMain(mainElements);
};
