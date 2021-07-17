import {
  bAccidentalFlat,
  bAccidentalNatural,
  bAccidentalSharp,
  bFlag16Down,
  bFlag16Up,
  bFlag32Down,
  bFlag32Up,
  bFlag8Down,
  bFlag8Up,
  bRest1,
  bRest16,
  bRest2,
  bRest32,
  bRest4,
  bRest8,
  EXTENSION_LEDGER_LINE,
  FlagDown,
  FlagUp,
  bStaffHeight,
  Path,
  bClefG,
  bNoteHead,
  bNoteHeadHalf,
  bNoteHeadWhole,
  RestPath,
  UNIT,
  WIDTH_NOTE_HEAD_BLACK,
  WIDTH_NOTE_HEAD_WHOLE,
  bLedgerLineWidth,
  bStaffLineWidth,
  bStemWidth,
  bThinBarlineThickness,
} from "./bravura";

type Duration = 1 | 2 | 4 | 8 | 16 | 32;

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

const initCanvas = (): HTMLCanvasElement => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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

window.onload = () => {
  const ctx = initCanvas().getContext("2d");
  if (ctx == null) return;
  const scale = 0.08;
  const staffPaddingLeft = 20;
  const topOfStaff = 2000 * scale;
  const leftOfStaff = staffPaddingLeft;
  const elementGap = UNIT * 2 * scale;
  const elements: Element[] = [
    { type: "note", pitch: 10, duration: 1 },
    { type: "bar" },
    { type: "note", pitch: 7, duration: 8, accidental: "sharp" },
    { type: "note", pitch: -1, duration: 8, accidental: "flat" },
    { type: "note", pitch: 13, duration: 4 },
    { type: "note", pitch: 0, duration: 4 },
    { type: "note", pitch: 1, duration: 4, accidental: "natural" },
    { type: "bar" },
    { type: "note", pitch: -2, duration: 16 },
    { type: "note", pitch: 14, duration: 32, accidental: "sharp" },
    { type: "note", pitch: -6, duration: 32 },
    { type: "note", pitch: 20, duration: 8 },
    { type: "rest", duration: 4 },
    { type: "rest", duration: 2 },
    { type: "bar" },
    { type: "rest", duration: 4 },
    { type: "rest", duration: 8 },
    { type: "rest", duration: 16 },
    { type: "rest", duration: 16 },
    { type: "rest", duration: 4 },
    { type: "rest", duration: 4 },
    { type: "bar" },
  ];
  drawStaff(
    ctx,
    leftOfStaff,
    topOfStaff,
    window.innerWidth - staffPaddingLeft * 2,
    scale
  );
  let cursor = staffPaddingLeft + elementGap;
  cursor = drawGClef(ctx, cursor, topOfStaff, scale).end;
  for (let i in elements) {
    const el = elements[i];
    const left = cursor + elementGap;
    switch (el.type) {
      case "note":
        cursor = drawNote({
          ctx,
          topOfStaff,
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
