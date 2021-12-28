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
  NoteInputHandler,
  KeyboardDragHandler,
  KeyPressHandler,
  ArrowHandler,
} from "./pointer-handlers";

const durations = [1, 2, 4, 8, 16, 32] as const;
export type Duration = typeof durations[number];

// C4 (middleC) = 0
type Pitch = number;

// 臨時記号の表記
type Accidental = "sharp" | "natural" | "flat";

type PitchAcc = {
  pitch: Pitch;
  accidental?: Accidental;
};

type Note = {
  type: "note";
  duration: Duration;
  notes: PitchAcc[];
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

const createSection = (start: number, end?: number): DrawnSection => {
  return { start, end: end ?? start };
};

const calcSection = (
  start: number,
  scale: number,
  path: Path
): DrawnSection => {
  const width = (path.bbox.ne.x - path.bbox.sw.x) * UNIT * scale;
  return createSection(start, start + width);
};

const drawNoteHead = (dnp: DrawNoteParams, pa: PitchAcc): DrawnSection => {
  const { ctx, left, topOfStaff, scale, duration } = dnp;
  const top = pitchToY(topOfStaff, pa.pitch, scale);
  const path = noteHeadByDuration(duration);
  drawBravuraPath(ctx, left, top, scale, path);
  return calcSection(left, scale, path);
};

// note headからはみ出る長さ(片方)
const ledgerLineExtension = (scale: number): number => {
  return UNIT * EXTENSION_LEDGER_LINE * scale;
};

const drawLedgerLine = ({
  ctx,
  top,
  start,
  duration,
  scale,
}: {
  ctx: CanvasRenderingContext2D;
  top: number;
  start: number;
  duration: Duration;
  scale: number;
}): DrawnSection => {
  const end =
    start + noteHeadWidth(duration) * scale + ledgerLineExtension(scale) * 2;
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

/**
 * 構成音に対して必要なledger lineをすべて描画する
 * @returns Section of ledger line
 * @param dnp DrawNoteParams
 * @param pas PitchAcc array of pitches
 */
const drawLedgerLines = (
  dnp: DrawNoteParams,
  pas: PitchAcc[]
): DrawnSection => {
  const { scale, topOfStaff, left } = dnp;
  const pitches = pas.map((pa) => pa.pitch);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  let section = createSection(left);

  // min<=0 && max<=0 : minのみ描画
  // min>=12 && max>=12 : maxのみ描画
  // min===max && min<=0 : minのみ描画
  // min===max && min>=12 : minのみ描画
  // min<=0 && max>=12 : min, max描画

  if (minPitch <= 0) {
    // 0=C4
    for (let i = 0; i >= minPitch; i -= 2) {
      section = drawLedgerLine({
        ...dnp,
        start: left,
        top: pitchToY(topOfStaff, i, scale),
      });
    }
  }
  if (maxPitch >= 12) {
    // 12=A5
    for (let i = 12; i < maxPitch + 1; i += 2) {
      section = drawLedgerLine({
        ...dnp,
        start: left,
        top: pitchToY(topOfStaff, i, scale),
      });
    }
  }
  return section;
};

const drawStemFlag = ({
  dnp,
  direction,
  lowest,
  highest,
}: {
  dnp: DrawNoteParams;
  direction: "down" | "up";
  lowest: PitchAcc;
  highest: PitchAcc;
}): DrawnSection => {
  const { ctx, topOfStaff, left, scale, duration } = dnp;
  if (duration === 1) {
    return createSection(left);
  }
  const heightOfB4 = topOfStaff + (bStaffHeight * scale) / 2;
  const lineWidth = bStemWidth * scale;
  let stemCenter: number;
  let top: number;
  let bottom: number;
  let drawnSection: DrawnSection | undefined;
  if (direction === "up") {
    // 符頭の右に符幹がはみ出るのを補正
    stemCenter = left - lineWidth / 2;
    bottom = pitchToY(topOfStaff, lowest.pitch, scale) - 5;
    if (highest.pitch < 0) {
      // C4より低い -> topはB4 (楽譜の書き方p17)
      top = heightOfB4;
    } else {
      // stemの長さは基本1オクターブ分 (楽譜の書き方p17)
      // 32分以降は1間ずつ長くする (楽譜の書き方p53)
      const index = duration <= 32 ? highest.pitch + 7 : highest.pitch + 8;
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
    stemCenter = left + lineWidth / 2;
    top = pitchToY(topOfStaff, highest.pitch, scale);
    if (lowest.pitch > 12) {
      // A5より高い -> bottomはB3
      bottom = heightOfB4;
    } else {
      const index = duration < 32 ? lowest.pitch - 7 : lowest.pitch - 8;
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

/**
 * 構成音すべてのAccidentalを描画
 * @return すべてのAccidentalを内包するDrawnSection
 * @param dnp DrawNoteParams
 * @param pas PitchAcc array of pitches
 */
const drawAccidental = (dnp: DrawNoteParams, pas: PitchAcc[]): DrawnSection => {
  const { ctx, left, topOfStaff, scale } = dnp;
  const sections: DrawnSection[] = [];
  // TODO 7度未満の音程に複数のAccidentalが付く場合 (楽譜の書き方p75)
  for (const pa of pas) {
    if (!pa.accidental) {
      return createSection(left);
    }
    const { pitch, accidental } = pa;
    const top = pitchToY(topOfStaff, pitch, scale);
    const path = accidentalPathMap.get(accidental)!;
    drawBravuraPath(ctx, left, top, scale, path);
    sections.push(calcSection(left, scale, path));
  }
  return maxSection(left, sections);
};

interface DrawNoteParams {
  ctx: CanvasRenderingContext2D;
  topOfStaff: number;
  left: number;
  scale: number;
  duration: Duration;
}

const maxSection = (left: number, sections: DrawnSection[]): DrawnSection => {
  const start = Math.min(...sections.map((section) => section?.start ?? left));
  const end = Math.max(...sections.map((section) => section?.end ?? left));
  return { start, end };
};

const gapWithAccidental = (scale: number): number => {
  return (UNIT / 4) * scale; // 勘
};

const calcStemDirection = (pitches: Pitch[]): "up" | "down" => {
  // B4から最も遠い音程を計算する
  // B4未満 -> 上向き (楽譜の書き方p17)
  const lowestToB4 = 6 - Math.min(...pitches);
  const highestToB4 = Math.max(...pitches) - 6;
  if (lowestToB4 > highestToB4) {
    return "up";
  } else if (highestToB4 > lowestToB4) {
    return "down";
  }

  // 最も遠い音程が高低側で同じ場合、重心から向きを決定する (satake案)
  let lowerB4 = 0;
  let higherB4 = 0;
  pitches.forEach((p) => {
    if (p < 6) {
      lowerB4++;
    } else if (p > 6) {
      higherB4++;
    }
  });
  if (lowerB4 > higherB4) {
    return "up";
  } else if (higherB4 > lowerB4) {
    return "down";
  }

  // FM7のような和音はとりあえず上向きにしておく
  // TODO 直前のSectionが和音なら、その和音の向きに揃える
  return "up";
};

const drawNote = (dnp: DrawNoteParams, pas: PitchAcc[]): DrawnSection => {
  const { scale, left } = dnp;
  const sections: DrawnSection[] = [];

  sections.push(drawAccidental(dnp, pas));
  let leftOfLedgerLine = left;
  if (sections[0]?.end) {
    // Accidentalが描画されていればledger line開始位置を右にずらす
    leftOfLedgerLine = sections[0]?.end + gapWithAccidental(scale);
  }
  sections.push(drawLedgerLines({ ...dnp, left: leftOfLedgerLine }, pas));

  let leftOfNoteHead = left;
  if (sections[1]?.start) {
    // Ledger lineが描画されていればnote描画位置を右にずらす
    leftOfNoteHead = sections[1].start + ledgerLineExtension(scale);
  } else if (sections[0]?.end) {
    // Accidentalが描画されていればnote描画位置を右にずらす
    leftOfNoteHead = sections[0]?.end + gapWithAccidental(scale) * 2;
  }

  // stemの左右どちらに音符を描画するか
  const stemDirection = calcStemDirection(pas.map((pa) => pa.pitch));
  const notesLeftOfStem: PitchAcc[] = [];
  const notesRightOfStem: PitchAcc[] = [];
  const 低い順 = pas.sort((a, b) => {
    if (a.pitch < b.pitch) {
      return -1;
    } else if (a.pitch === b.pitch) {
      return 0;
    } else {
      return 1;
    }
  });
  if (stemDirection === "up") {
    // 上向きstem
    for (let i = 0; i < 低い順.length; i++) {
      if (i === 0) {
        // 最低音は左側
        notesLeftOfStem.push(低い順[i]);
      } else if (低い順[i].pitch - 低い順[i - 1].pitch === 1) {
        // 2度は右側
        notesRightOfStem.push(低い順[i]);
        if (i + 1 < 低い順.length) {
          // 右側描画となった次の音は左側
          notesLeftOfStem.push(低い順[++i]);
        }
      } else {
        notesLeftOfStem.push(低い順[i]);
      }
    }
  } else {
    // 下向きstem
    const 高い順 = 低い順.concat().reverse();
    for (let i = 0; i < 高い順.length; i++) {
      if (i === 0) {
        // 最低音は右側
        notesRightOfStem.push(高い順[i]);
      } else if (高い順[i - 1].pitch - 高い順[i].pitch === 1) {
        // 2度は左側
        notesLeftOfStem.push(高い順[i]);
        if (i + 1 < 高い順.length) {
          // 左側描画となった次の音は右側
          notesRightOfStem.push(高い順[++i]);
        }
      } else {
        notesRightOfStem.push(高い順[i]);
      }
    }
  }

  notesLeftOfStem.forEach((pa) => {
    sections.push(drawNoteHead({ ...dnp, left: leftOfNoteHead }, pa));
  });
  let leftOfStemOrNotehead = leftOfNoteHead;
  if (notesLeftOfStem.length > 0) {
    // Stem左側にnotehead描画していたらnotehead右端をstem開始位置に指定する
    leftOfStemOrNotehead = sections[sections.length - 1]?.end ?? leftOfNoteHead;
  }
  sections.push(
    drawStemFlag({
      dnp: { ...dnp, left: leftOfStemOrNotehead },
      direction: stemDirection,
      lowest: 低い順[0],
      highest: 低い順[低い順.length - 1],
    })
  );
  notesRightOfStem.forEach((pa) => {
    sections.push(drawNoteHead({ ...dnp, left: leftOfStemOrNotehead }, pa));
  });
  return maxSection(dnp.left, sections);
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

type Caret = { x: number; y: number; width: number; elIdx: number };

const drawElements = ({
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
}): Caret[] => {
  drawStaff(ctx, leftOfStaff, topOfStaff, canvasWidth - leftOfStaff * 2, scale);
  let cursor = leftOfStaff + elementGap;
  cursor = drawGClef(ctx, cursor, topOfStaff, scale).end;
  if (elements.length === 0) {
    return [{ x: cursor + elementGap, y: topOfStaff, width: 1, elIdx: -1 }];
  }
  const elementIdxToX: Caret[] = [];
  for (let i in elements) {
    const elIdx = Number(i);
    const el = elements[elIdx];
    const left = cursor + elementGap;
    elementIdxToX.push({
      x: left,
      y: topOfStaff,
      width: 1,
      elIdx: elIdx - 1 >= 0 ? elIdx - 1 : -1,
    });
    switch (el.type) {
      case "note":
        cursor = drawNote(
          {
            ctx,
            topOfStaff: topOfStaff,
            left,
            duration: el.duration,
            scale,
          },
          el.notes
        ).end;
        elementIdxToX.push({
          x: left,
          y: topOfStaff,
          width: cursor - left,
          elIdx,
        });
        break;
      case "rest":
        cursor = drawRest(ctx, topOfStaff, left, el, scale).end;
        elementIdxToX.push({ x: left, y: topOfStaff, width: 1, elIdx });
        break;
      case "bar":
        cursor = drawBarline(ctx, topOfStaff, left, scale).end;
        elementIdxToX.push({ x: left, y: topOfStaff, width: 1, elIdx });
        break;
    }
  }
  const lastX = elementIdxToX[elementIdxToX.length - 1].x;
  elementIdxToX.push({
    x: lastX + elementGap,
    y: topOfStaff,
    width: 1,
    elIdx: elements.length - 1,
  });
  return elementIdxToX;
};

const drawCaret = ({
  ctx,
  scale,
  pos,
}: {
  ctx: CanvasRenderingContext2D;
  scale: number;
  pos: Caret;
}) => {
  const { x, y, width } = pos;
  const height = bStaffHeight * scale;
  ctx.save();
  ctx.fillStyle = "#FF000055";
  ctx.fillRect(x, y, width, height);
  ctx.restore();
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
export interface NoteInputCallback {
  startPreview(duration: Duration, downX: number, downY: number): void;

  updatePreview(duration: Duration, dy: number): void;

  commit(duration: Duration, dy?: number): void;

  backspace(): void;

  finish(): void;
}

export interface CaretMoveCallback {
  back(): void;

  forward(): void;
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
  const elements: Element[] = [
    {
      type: "note",
      duration: 4,
      notes: [{ pitch: 5 }, { pitch: 7 }, { pitch: 9 }],
    },
    {
      type: "note",
      duration: 4,
      notes: [{ pitch: 3 }, { pitch: 5 }, { pitch: 7 }],
    },
    {
      type: "note",
      duration: 1,
      notes: [{ pitch: 3 }, { pitch: 5 }, { pitch: 7 }],
    },
    {
      type: "note",
      duration: 4,
      notes: [{ pitch: 6 }, { pitch: 8 }, { pitch: 10 }],
    },
    {
      type: "note",
      duration: 4,
      notes: [{ pitch: 2 }, { pitch: 4 }, { pitch: 6 }],
    },
    {
      type: "note",
      duration: 1,
      notes: [{ pitch: 4 }, { pitch: 6 }, { pitch: 8 }],
    },
    {
      type: "note",
      duration: 4,
      notes: [{ pitch: 5 }, { pitch: 6 }],
    },
    {
      type: "note",
      duration: 8,
      notes: [{ pitch: 2 }, { pitch: 3 }, { pitch: 5 }, { pitch: 7 }],
    },
    {
      type: "note",
      duration: 1,
      notes: [{ pitch: 2 }, { pitch: 3 }],
    },
    {
      type: "note",
      duration: 16,
      notes: [
        { pitch: 3 },
        { pitch: 5 },
        { pitch: 7 },
        { pitch: 8 },
        { pitch: 9 },
      ],
    },
    {
      type: "note",
      duration: 2,
      notes: [{ pitch: 4 }, { pitch: 5 }, { pitch: 9 }, { pitch: 10 }],
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

  const caretMoveCallback: CaretMoveCallback = {
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
