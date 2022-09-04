import {
  bBeamSpacing,
  bBeamThickness,
  bClefG,
  bLedgerLineThickness,
  bStaffHeight,
  bStaffLineWidth,
  bStemWidth,
  bThinBarlineThickness,
  EXTENSION_LEDGER_LINE,
  Path,
  UNIT,
} from "./bravura";
import {
  Accidental,
  Bar,
  Beam,
  Clef,
  Duration,
  durations,
  Element,
  Note,
  Pitch,
  PitchAcc,
  Rest,
} from "./notation/types";
import {
  accidentalPathMap,
  downFlagMap,
  noteHeadByDuration,
  noteHeadWidth,
  numOfBeamsMap,
  restPathMap,
  upFlagMap,
} from "./notation/notation";
import { Point } from "./geometry";
import { Matrix } from "./matrix";

export const initCanvas = (
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

export const getPathWidth = (path: Path): number => {
  return (path.bbox.ne.x - path.bbox.sw.x) * UNIT;
};

const calcSection = (
  start: number,
  scale: number,
  path: Path
): DrawnSection => {
  const width = getPathWidth(path) * scale;
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

const ledgerLineWidth = (duration: Duration): number => {
  return noteHeadWidth(duration) + ledgerLineExtension(1) * 2;
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
  ctx.lineWidth = bLedgerLineThickness * scale;
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

const calcStemShape = ({
  dnp,
  direction,
  lowest,
  highest,
  extension = 0,
}: {
  dnp: { topOfStaff: number; scale: number; duration: Duration };
  direction: "up" | "down";
  lowest: PitchAcc;
  highest: PitchAcc;
  extension?: number;
}): { top: number; bottom: number } => {
  const { topOfStaff, scale, duration } = dnp;
  const heightOfB4 = topOfStaff + (bStaffHeight * scale) / 2;
  let top: number;
  let bottom: number;
  if (direction === "up") {
    // 符頭の右に符幹がはみ出るのを補正
    bottom = pitchToY(topOfStaff, lowest.pitch, scale) - 5;
    if (highest.pitch < 0) {
      // C4より低い -> topはB4 (楽譜の書き方p17)
      top = heightOfB4;
    } else {
      // stemの長さは基本1オクターブ分 (楽譜の書き方p17)
      // 32分以降は1間ずつ長くする (楽譜の書き方p53)
      const index = duration < 32 ? highest.pitch + 7 : highest.pitch + 8;
      top = pitchToY(topOfStaff, index, scale);
    }
    top -= extension;
  } else {
    top = pitchToY(topOfStaff, highest.pitch, scale);
    if (lowest.pitch > 12) {
      // A5より高い -> bottomはB3
      bottom = heightOfB4;
    } else {
      const index = duration < 32 ? lowest.pitch - 7 : lowest.pitch - 8;
      bottom = pitchToY(topOfStaff, index, scale);
    }
    bottom += extension;
  }
  return { top, bottom };
};

const determineStemFlagStyle = ({
  left,
  duration,
  direction,
  lowest,
  highest,
  beamed,
}: {
  left: number;
  duration: Duration;
  direction: "up" | "down";
  lowest: PitchAcc;
  highest: PitchAcc;
  beamed?: {
    top?: number;
    bottom?: number;
  };
}): { elements: NoteStyleElement[]; section?: DrawnSection } => {
  if (duration === 1) {
    return { elements: [] };
  }
  const elements: NoteStyleElement[] = [];
  let { top, bottom } = calcStemShape({
    dnp: { topOfStaff: 0, scale: 1, duration },
    direction,
    lowest,
    highest,
  });
  let stemCenter: number;
  let flagSection: DrawnSection | undefined;
  if (direction === "up") {
    stemCenter = left - bStemWidth / 2;
    if (beamed) {
      top = beamed.top!;
    } else {
      const path = upFlagMap.get(duration);
      if (path) {
        elements.push({
          type: "flag",
          position: {
            x: stemCenter - bStemWidth / 2 + UNIT * path.stemUpNW.x,
            y: top + UNIT * path.stemUpNW.y,
          },
          duration, // pathも渡したほうがいいんだろうか
          direction,
        });
        flagSection = calcSection(left, 1, path);
      }
    }
  } else {
    stemCenter = left + bStemWidth / 2;
    if (beamed) {
      bottom = beamed.bottom!;
    } else {
      const path = downFlagMap.get(duration);
      if (path) {
        elements.push({
          type: "flag",
          position: {
            x: stemCenter - bStemWidth / 2 + UNIT * path.stemDownSW.x,
            y: bottom + UNIT * path.stemDownSW.y,
          },
          duration,
          direction,
        });
        flagSection = calcSection(left, 1, path);
      }
    }
  }
  elements.push({
    type: "stem",
    center: stemCenter,
    top,
    bottom,
    width: bStemWidth,
  });

  return {
    elements,
    section: flagSection ?? { start: left, end: left + bStemWidth },
  };
};

const drawStemFlag = ({
  dnp,
  direction,
  lowest,
  highest,
  beamed,
}: {
  dnp: DrawNoteParams;
  direction: "down" | "up";
  lowest: PitchAcc;
  highest: PitchAcc;
  beamed?: {
    top?: number;
    bottom?: number;
  };
}): DrawnSection => {
  const { ctx, left, scale, duration } = dnp;
  if (duration === 1) {
    return createSection(left);
  }
  const lineWidth = bStemWidth * scale;
  let { top, bottom } = calcStemShape({ dnp, direction, lowest, highest });
  let stemCenter: number;
  let drawnSection: DrawnSection | undefined;
  if (direction === "up") {
    stemCenter = left - lineWidth / 2;
    if (beamed) {
      top = beamed.top!;
    } else {
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
    }
  } else {
    stemCenter = left + lineWidth / 2;
    if (beamed) {
      bottom = beamed.bottom!;
    } else {
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
  if (sections.length === 0) {
    return { start: left, end: left };
  }
  const start = Math.min(...sections.map((section) => section?.start ?? left));
  const end = Math.max(...sections.map((section) => section?.end ?? left));
  return { start, end };
};

const gapWithAccidental = (scale: number): number => {
  return (UNIT / 4) * scale; // 勘
};

const centerOfNotes = (pitches: Pitch[]): Pitch => {
  const average = pitches.reduce((prev, curr) => prev + curr) / pitches.length;
  return Math.round(average);
};

const getStemDirection = (pitches: Pitch[]): "up" | "down" => {
  // B4から最も遠い音程を計算する
  // B4未満 -> 上向き (楽譜の書き方p17)
  const lowestToB4 = 6 - Math.min(...pitches);
  const highestToB4 = Math.max(...pitches) - 6;
  if (lowestToB4 > highestToB4) {
    return "up";
  } else if (highestToB4 > lowestToB4) {
    return "down";
  }
  // calc direction by center of pitches if lowest and highest are same
  return centerOfNotes(pitches) < 6 ? "up" : "down";
};

const getBeamLinearFunc = ({
  dnp,
  stemDirection,
  beamed,
  beamedLeftOfStem,
}: {
  dnp: { topOfStaff: number; scale: number; duration: Duration };
  stemDirection: "up" | "down";
  beamed: Note[];
  beamedLeftOfStem: number[];
}): ((x: number) => number) => {
  const firstEl = beamed[0];
  const lastEl = beamed[beamed.length - 1];
  const yDistance4th = (UNIT / 2) * 3 * dnp.scale;
  let beamAngle: number;
  let 最短stemとbeamの交点y: Point;
  if (stemDirection === "up") {
    if (beamed.length === 1) {
      beamAngle = 0;
    } else {
      const pitchFirstHi = firstEl.pitches[firstEl.pitches.length - 1].pitch;
      const pitchLastHi = lastEl.pitches[lastEl.pitches.length - 1].pitch;
      const yFirst = pitchToY(dnp.topOfStaff, pitchFirstHi, dnp.scale);
      const yLast = pitchToY(dnp.topOfStaff, pitchLastHi, dnp.scale);
      const yDistance = yLast - yFirst;
      const xDistance =
        beamedLeftOfStem[beamedLeftOfStem.length - 1] - beamedLeftOfStem[0];
      if (pitchFirstHi > pitchLastHi) {
        // 右肩下がり
        beamAngle =
          (yDistance >= yDistance4th ? yDistance4th : yDistance) / xDistance;
      } else {
        // 右肩上がり
        beamAngle =
          (-yDistance >= yDistance4th ? -yDistance4th : yDistance) / xDistance;
      }
    }
    // calc 交点
    const beamedAndLeftOfStem = beamed.map((note, i) => ({
      note,
      leftOfStem: beamedLeftOfStem[i],
    }));
    const highest = beamedAndLeftOfStem.sort(
      (a, b) =>
        b.note.pitches[b.note.pitches.length - 1].pitch -
        a.note.pitches[a.note.pitches.length - 1].pitch
    )[0];
    const x = highest.leftOfStem;
    const y = calcStemShape({
      dnp,
      direction: stemDirection,
      lowest: { pitch: highest.note.pitches[0].pitch },
      highest: {
        pitch: highest.note.pitches[highest.note.pitches.length - 1].pitch,
      },
    }).top;
    最短stemとbeamの交点y = { x, y };
  } else {
    if (beamed.length === 1) {
      beamAngle = 0;
    } else {
      const pitchFirstLo = firstEl.pitches[0].pitch;
      const pitchLastLo = lastEl.pitches[0].pitch;
      const yFirst = pitchToY(dnp.topOfStaff, pitchFirstLo, dnp.scale);
      const yLast = pitchToY(dnp.topOfStaff, pitchLastLo, dnp.scale);
      const yDistance = yLast - yFirst;
      const xDistance =
        beamedLeftOfStem[beamedLeftOfStem.length - 1] - beamedLeftOfStem[0];
      if (pitchFirstLo > pitchLastLo) {
        // 右肩下がり
        beamAngle =
          (yDistance >= yDistance4th ? yDistance4th : yDistance) / xDistance;
      } else {
        // 右肩上がり
        beamAngle =
          (-yDistance >= yDistance4th ? -yDistance4th : yDistance) / xDistance;
      }
    }
    // calc 交点
    const beamedAndLeftOfStem = beamed.map((note, i) => ({
      note,
      leftOfStem: beamedLeftOfStem[i],
    }));
    const lowest = beamedAndLeftOfStem.sort(
      (a, b) => a.note.pitches[0].pitch - b.note.pitches[0].pitch
    )[0];
    const x = lowest.leftOfStem;
    const y = calcStemShape({
      dnp,
      direction: stemDirection,
      lowest: { pitch: lowest.note.pitches[0].pitch },
      highest: {
        pitch: lowest.note.pitches[lowest.note.pitches.length - 1].pitch,
      },
    }).bottom;
    最短stemとbeamの交点y = { x, y };
  }

  const { x, y } = 最短stemとbeamの交点y;
  const 切片 = -x * beamAngle + y;
  return (stemX: number) => stemX * beamAngle + 切片;
};

const getBeamShape = ({
  scale,
  stemDirection,
  firstStemLeft,
  lastStemLeft,
  stemLinearFunc,
  offsetY = 0,
}: {
  scale: number;
  stemDirection: "up" | "down";
  firstStemLeft: number;
  lastStemLeft: number;
  stemLinearFunc: (stemX: number) => number;
  offsetY?: number;
}): { nw: Point; ne: Point; sw: Point; se: Point } => {
  const beamHeight = UNIT * bBeamThickness * scale;
  // first note
  const firstStemEdge =
    stemLinearFunc(firstStemLeft) +
    (stemDirection === "up" ? offsetY : -offsetY);
  const nw = {
    x: firstStemLeft,
    y: stemDirection === "up" ? firstStemEdge : firstStemEdge - beamHeight,
  };
  const sw = {
    x: firstStemLeft,
    y: stemDirection === "up" ? firstStemEdge + beamHeight : firstStemEdge,
  };
  // last note
  const lastStemEdge =
    stemLinearFunc(lastStemLeft) +
    (stemDirection === "up" ? offsetY : -offsetY);
  const ne = {
    x: lastStemLeft,
    y: stemDirection === "up" ? lastStemEdge : lastStemEdge - beamHeight,
  };
  const se = {
    x: lastStemLeft,
    y: stemDirection === "up" ? lastStemEdge + beamHeight : lastStemEdge,
  };
  return { nw, ne, se, sw };
};

const drawBeamedNotes = function* ({
  dnp,
  elementGap,
  els,
  startIdx,
}: {
  dnp: DrawNoteParams;
  elementGap: number;
  els: Note[];
  startIdx: number;
}): IterableIterator<{ elIdx: number; elEnd: number; elLeft: number }> {
  const { ctx, scale, duration, left: startLeft } = dnp;
  const allBeamedPitches = els.flatMap((n) => n.pitches).map((p) => p.pitch);
  const stemDirection = getStemDirection(allBeamedPitches);
  const leftOfStemArr: number[] = [];
  const beamExt = UNIT * scale;
  let left = startLeft;
  let shouldExt = false;
  for (const i in els) {
    const { pitches, beam } = els[i];
    const { leftOfStem, section } = drawNote({
      dnp: { ...dnp, left },
      pas: pitches,
      stemDirection,
      beamed: true,
    });
    yield { elIdx: startIdx++, elLeft: left, elEnd: section.end };
    left = section.end + elementGap;
    leftOfStemArr.push(leftOfStem);
    if (
      Number(i) === els.length - 1 &&
      (beam === "continue" || beam === "begin")
    ) {
      // ちょっとbeamを伸ばしてbeam modeであることを明示
      shouldExt = true;
      // section.end += beamExt;
    }
  }
  const firstStemLeft = leftOfStemArr[0];
  // beamed.length === 1のとき右にちょい伸ばす
  const lastStemLeft =
    leftOfStemArr[leftOfStemArr.length - 1] + (shouldExt ? beamExt : 0);
  const stemLinearFunc = getBeamLinearFunc({
    dnp,
    stemDirection,
    beamed: els,
    beamedLeftOfStem: leftOfStemArr,
  });
  const beams = [];
  for (let i = 0; i < (numOfBeamsMap.get(duration) ?? 0); i++) {
    const offsetY = (UNIT * bBeamThickness + UNIT * bBeamSpacing) * i * scale;
    beams.push(
      getBeamShape({
        scale,
        stemDirection,
        firstStemLeft,
        lastStemLeft,
        stemLinearFunc,
        offsetY,
      })
    );
  }
  els.forEach(({ pitches }, idx) => {
    const left = leftOfStemArr[idx];
    const edge = stemLinearFunc(left);
    let beamed;
    if (stemDirection === "up") {
      beamed = { top: edge };
    } else {
      beamed = { bottom: edge };
    }
    drawStemFlag({
      dnp: { ...dnp, left },
      direction: stemDirection,
      lowest: pitches[0],
      highest: pitches[pitches.length - 1],
      beamed,
    });
  });
  ctx.save();
  for (const beam of beams) {
    ctx.beginPath();
    ctx.moveTo(beam.nw.x, beam.nw.y);
    ctx.lineTo(beam.sw.x, beam.sw.y);
    ctx.lineTo(beam.se.x, beam.se.y);
    ctx.lineTo(beam.ne.x, beam.ne.y);
    ctx.closePath();
    ctx.fillStyle = "#000";
    ctx.fill();
  }
  ctx.restore();
};

const sortPitch = (p: PitchAcc[], dir: "asc" | "dsc"): PitchAcc[] => {
  const comparator = (a: PitchAcc, b: PitchAcc) => {
    if (dir === "asc") {
      return a.pitch < b.pitch;
    } else {
      return b.pitch < a.pitch;
    }
  };
  return p.sort((a, b) => {
    if (comparator(a, b)) {
      return -1;
    } else if (a.pitch === b.pitch) {
      return 0;
    } else {
      return 1;
    }
  });
};

const drawNote = ({
  dnp,
  pas,
  stemDirection,
  beamed = false,
}: {
  dnp: DrawNoteParams;
  pas: PitchAcc[];
  stemDirection?: "up" | "down";
  beamed?: boolean;
}): { section: DrawnSection; leftOfStem: number } => {
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
  if (!stemDirection) {
    stemDirection = getStemDirection(pas.map((pa) => pa.pitch));
  }
  const notesLeftOfStem: PitchAcc[] = [];
  const notesRightOfStem: PitchAcc[] = [];
  const pitchAsc = sortPitch(pas, "asc");
  if (stemDirection === "up") {
    // 上向きstem
    for (let i = 0; i < pitchAsc.length; i++) {
      if (i === 0) {
        // 最低音は左側
        notesLeftOfStem.push(pitchAsc[i]);
      } else if (pitchAsc[i].pitch - pitchAsc[i - 1].pitch === 1) {
        // 2度は右側
        notesRightOfStem.push(pitchAsc[i]);
        if (i + 1 < pitchAsc.length) {
          // 右側描画となった次の音は左側
          notesLeftOfStem.push(pitchAsc[++i]);
        }
      } else {
        notesLeftOfStem.push(pitchAsc[i]);
      }
    }
  } else {
    // 下向きstem
    const 高い順 = pitchAsc.concat().reverse();
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

  if (!beamed) {
    sections.push(
      drawStemFlag({
        dnp: { ...dnp, left: leftOfStemOrNotehead },
        direction: stemDirection,
        lowest: pitchAsc[0],
        highest: pitchAsc[pitchAsc.length - 1],
      })
    );
  }
  notesRightOfStem.forEach((pa) => {
    sections.push(drawNoteHead({ ...dnp, left: leftOfStemOrNotehead }, pa));
  });
  return {
    section: maxSection(dnp.left, sections),
    leftOfStem: leftOfStemOrNotehead,
  };
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

export type Caret = { x: number; y: number; width: number; elIdx: number };

type NoteStyleElement =
  | { type: "notehead"; position: Point; duration: Duration }
  | { type: "accidental"; position: Point; accidental: Accidental }
  | { type: "ledger"; position: Point; width: number }
  | { type: "stem"; center: number; top: number; bottom: number; width: number }
  | {
      type: "flag";
      position: Point;
      duration: Duration;
      direction: "up" | "down";
    };

type NoteStyle = {
  type: "note";
  note: Note;
  elements: NoteStyleElement[];
};
type RestStyle = { type: "rest"; rest: Rest; position: Point };
type BeamedNotesStyle = {
  type: "beam";
  elements: DrawElementStyle[];
  beams: { nw: Point; ne: Point; sw: Point; se: Point }[];
};
type DrawElement =
  | NoteStyle
  | RestStyle
  | BeamedNotesStyle
  | {
      type: "clef";
      clef: Clef;
    }
  | {
      type: "bar";
      bar: Bar;
    }
  | {
      type: "gap";
    };

const determineNoteStyle = ({
  note,
  stemDirection,
  beamed = false,
}: {
  note: Note;
  stemDirection?: "up" | "down";
  beamed?: boolean;
}): { element: NoteStyle; width: number; leftOfStem: number } => {
  const elements: NoteStyleElement[] = [];
  let width = 0;

  // accidentals
  const accSections: DrawnSection[] = [];
  for (const p of note.pitches) {
    if (!p.accidental) {
      continue;
    }
    const { pitch, accidental } = p;
    const y = pitchToY(0, pitch, 1);
    accSections.push(calcSection(0, 1, accidentalPathMap.get(accidental)!));
    elements.push({
      type: "accidental",
      position: { x: 0, y },
      accidental,
    });
  }
  width += maxSection(0, accSections).end;
  console.log("acc", width);

  // ledger lines
  let leftOfLedgerLine = 0;
  if (accSections.length > 0) {
    // Accidentalが描画されていればledger line開始位置を右にずらす
    leftOfLedgerLine = accSections[0].end + gapWithAccidental(1);
  }
  const pitches = note.pitches.map((p) => p.pitch);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  const ledgerWidth = ledgerLineWidth(note.duration);
  const ledgerSections: DrawnSection[] = [];
  // min<=0 && max<=0 : minのみ描画
  // min>=12 && max>=12 : maxのみ描画
  // min===max && min<=0 : minのみ描画
  // min===max && min>=12 : minのみ描画
  // min<=0 && max>=12 : min, max描画
  if (minPitch <= 0) {
    // C4
    for (let p = 0; p >= minPitch; p -= 2) {
      elements.push({
        type: "ledger",
        width: ledgerWidth,
        position: { x: leftOfLedgerLine, y: pitchToY(0, p, 1) },
      });
      ledgerSections.push({
        start: leftOfLedgerLine,
        end: leftOfLedgerLine + ledgerWidth,
      });
    }
  }
  if (maxPitch >= 12) {
    // A5
    for (let p = 12; p < maxPitch + 1; p += 2) {
      elements.push({
        type: "ledger",
        width: ledgerWidth,
        position: { x: leftOfLedgerLine, y: pitchToY(0, p, 1) },
      });
      ledgerSections.push({
        start: leftOfLedgerLine,
        end: leftOfLedgerLine + ledgerWidth,
      });
    }
  }
  width += maxSection(leftOfLedgerLine, ledgerSections).end - leftOfLedgerLine;
  console.log("ledger", width);

  // noteheads
  let leftOfNotehead = 0;
  if (ledgerSections.length > 0) {
    // Ledger lineが描画されていればnote描画位置を右にずらす
    leftOfNotehead = ledgerSections[0].start + ledgerLineExtension(1);
  } else if (accSections.length > 0) {
    // Accidentalが描画されていればnote描画位置を右にずらす
    leftOfNotehead = accSections[0]?.end + gapWithAccidental(1) * 2; // *2とは？
  }
  // stemの左右どちらに音符を描画するか
  if (!stemDirection) {
    stemDirection = getStemDirection(pitches);
  }
  const notesLeftOfStem: PitchAcc[] = [];
  const notesRightOfStem: PitchAcc[] = [];
  const pitchAsc = sortPitch(note.pitches, "asc");
  if (stemDirection === "up") {
    // 上向きstem
    for (let i = 0; i < pitchAsc.length; i++) {
      if (i === 0) {
        // 最低音は左側
        notesLeftOfStem.push(pitchAsc[i]);
      } else if (pitchAsc[i].pitch - pitchAsc[i - 1].pitch === 1) {
        // 2度は右側
        notesRightOfStem.push(pitchAsc[i]);
        if (i + 1 < pitchAsc.length) {
          // 右側描画となった次の音は左側
          notesLeftOfStem.push(pitchAsc[++i]);
        }
      } else {
        notesLeftOfStem.push(pitchAsc[i]);
      }
    }
  } else {
    // 下向きstem
    const 高い順 = pitchAsc.concat().reverse();
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
  const noteheadStemFlagSections: DrawnSection[] = [];
  for (const p of notesLeftOfStem) {
    noteheadStemFlagSections.push(
      calcSection(leftOfNotehead, 1, noteHeadByDuration(note.duration))
    );
    elements.push({
      type: "notehead",
      position: {
        x: leftOfNotehead,
        y: pitchToY(0, p.pitch, 1),
      },
      duration: note.duration,
    });
  }
  let leftOfStemOrNotehead = leftOfNotehead;
  if (notesLeftOfStem.length > 0) {
    // Stem左側にnotehead描画していたらnotehead右端をstem開始位置に指定する
    leftOfStemOrNotehead = noteheadStemFlagSections[0].end;
  }
  if (!beamed) {
    // stem, flag
    const { elements: el, section } = determineStemFlagStyle({
      left: leftOfStemOrNotehead,
      duration: note.duration,
      direction: stemDirection,
      lowest: pitchAsc[0],
      highest: pitchAsc[pitchAsc.length - 1],
    });
    section && noteheadStemFlagSections.push(section);
    elements.push(...el);
  }
  for (const p of notesRightOfStem) {
    noteheadStemFlagSections.push(
      calcSection(leftOfNotehead, 1, noteHeadByDuration(note.duration))
    );
    elements.push({
      type: "notehead",
      position: {
        x: leftOfNotehead,
        y: pitchToY(0, p.pitch, 1),
      },
      duration: note.duration,
    });
  }
  width +=
    maxSection(leftOfNotehead, noteheadStemFlagSections).end - leftOfNotehead;
  console.log("notehead", width);

  return {
    element: {
      type: "note",
      note,
      elements,
    },
    width,
    leftOfStem: leftOfStemOrNotehead,
  };
};

const determineRestStyle = (
  rest: Rest
): { element: RestStyle; width: number } => {
  const path = restPathMap.get(rest.duration)!;
  const position = {
    x: 0,
    y: UNIT * path.top,
  };
  const width = getPathWidth(path);
  return {
    element: {
      type: "rest",
      rest,
      position,
    },
    width,
  };
};

const determineBeamedNotesStyle = (
  beamedNotes: Note[],
  duration: Duration,
  elementGap: number
): {
  element: BeamedNotesStyle;
  width: number;
  elementXArray: number[];
} => {
  const allBeamedPitches = beamedNotes
    .flatMap((n) => n.pitches)
    .map((p) => p.pitch);
  const stemDirection = getStemDirection(allBeamedPitches);
  const leftOfStemArr: number[] = [];
  const elements: DrawElementStyle[] = [];
  const elementXArray = [];
  const gapEl: DrawElementStyle = {
    element: { type: "gap" },
    width: elementGap,
  };
  let left = 0;
  let shouldExt = false;
  for (const i in beamedNotes) {
    const noteStyle = determineNoteStyle({
      note: beamedNotes[i],
      stemDirection,
      beamed: true,
    });
    elements.push(noteStyle, gapEl);
    elementXArray.push(left);
    console.log(left);
    leftOfStemArr.push(left + noteStyle.leftOfStem);
    left +=
      noteStyle.width + (i === `${beamedNotes.length - 1}` ? elementGap : 0);
  }
  const { beam: lastBeam } = beamedNotes[beamedNotes.length - 1];
  if (lastBeam === "continue" || lastBeam === "begin") {
    // ちょっとbeamを伸ばしてbeam modeであることを明示
    shouldExt = true;
    // section.end += beamExt;
  }
  const firstStemLeft = leftOfStemArr[0];
  // beamed.length === 1のとき右にちょい伸ばす
  console.log(leftOfStemArr);
  const lastStemLeft =
    leftOfStemArr[leftOfStemArr.length - 1] + (shouldExt ? UNIT : 0);
  const stemLinearFunc = getBeamLinearFunc({
    dnp: { topOfStaff: 0, scale: 1, duration },
    stemDirection,
    beamed: beamedNotes,
    beamedLeftOfStem: leftOfStemArr,
  });
  const beams = [];
  for (let i = 0; i < (numOfBeamsMap.get(duration) ?? 0); i++) {
    const offsetY = (UNIT * bBeamThickness + UNIT * bBeamSpacing) * i;
    beams.push(
      getBeamShape({
        scale: 1,
        stemDirection,
        firstStemLeft,
        lastStemLeft,
        stemLinearFunc,
        offsetY,
      })
    );
  }
  for (const i in beamedNotes) {
    const { pitches } = beamedNotes[i];
    const pitchAsc = sortPitch(pitches, "asc");
    const left = leftOfStemArr[i];
    const edge = stemLinearFunc(left);
    let beamed;
    if (stemDirection === "up") {
      beamed = { top: edge };
    } else {
      beamed = { bottom: edge };
    }
    // TODO note側のsectionとmergeしないと正しいwidthにならない
    // beam noteだけgapが狭くなりそう。
    const { elements: el, section } = determineStemFlagStyle({
      left,
      duration,
      direction: stemDirection,
      lowest: pitchAsc[0],
      highest: pitchAsc[pitchAsc.length - 1],
      beamed,
    });
    // gapを考慮したindex
    const parent = elements[Number(i) * 2].element as NoteStyle;
    parent.elements.push(...el);
  }
  return {
    element: {
      type: "beam",
      beams,
      elements,
    },
    width: left,
    elementXArray: elementXArray,
  };
};

type DrawElementStyle = {
  element: DrawElement;
  width: number;
  /**
   * DrawElement固有のmtx
   * 装飾音とか音部変更記号とかはscale < 1にする使い方
   * 装飾音はgapに食い込むようにtranslateするとか
   */
  localMtx?: Matrix;
};

type Style = {
  /**
   * staffのmtx
   * canvas上にstaffをどう配置するか
   */
  mtx: Matrix;
  /**
   * 先頭に描画するElementのx座標
   */
  offsetLeft: number;
  drawElements: DrawElementStyle[];
};

export const determineDrawElementStyle = ({
  elements,
  elementGap,
  initClef,
}: {
  elements: Element[];
  elementGap: number;
  initClef?: Clef;
}): {
  styles: DrawElementStyle[];
  elementIndexToX: Map<number, number>;
} => {
  const styles: DrawElementStyle[] = [];
  const gapEl: DrawElementStyle = {
    element: { type: "gap" },
    width: elementGap,
  };
  let left = 0;
  if (initClef?.type === "g") {
    const width = getPathWidth(bClefG);
    console.log(width);
    styles.push(
      gapEl,
      {
        element: {
          type: "clef",
          clef: initClef,
        },
        width,
      },
      gapEl
    );
    left = width + gapEl.width * 2;
  }
  const elementIndexToX = new Map();
  let elIdx = 0;
  while (elIdx < elements.length) {
    const el = elements[elIdx];
    switch (el.type) {
      case "note":
        if (el.beam === "begin") {
          // 連桁
          const startIdx = elIdx;
          const beamedNotes: Note[] = [el];
          let nextIdx = elIdx + 1;
          let nextEl = elements[nextIdx];
          while (
            nextEl?.type === "note" &&
            (nextEl.beam === "continue" || nextEl.beam === "end")
          ) {
            beamedNotes.push(nextEl);
            nextEl = elements[++nextIdx];
          }
          const s = determineBeamedNotesStyle(
            beamedNotes,
            el.duration,
            elementGap
          );
          for (const i in s.elementXArray) {
            elementIndexToX.set(i + elIdx, s.elementXArray[i]);
          }
          styles.push(s, gapEl);
          left += s.width + elementGap;
          elIdx += beamedNotes.length;
        } else {
          elementIndexToX.set(elIdx, left);
          const s = determineNoteStyle({ note: el });
          styles.push(s, gapEl);
          left += s.width + elementGap;
          elIdx++;
        }
        break;
      case "rest":
        elementIndexToX.set(elIdx, left);
        const s = determineRestStyle(el);
        styles.push(s, gapEl);
        left += s.width + elementGap;
        elIdx++;
        break;
    }
  }
  return { styles, elementIndexToX };
};

// caretもこっから生成したらええんちゃう
export const determineStyle = ({
  scale,
  offsetLeft,
  elementGap,
  initClef,
  elements,
  staffPosition,
}: {
  scale: number;
  offsetLeft: number;
  elementGap: number;
  initClef?: Clef;
  elements: Element[];
  staffPosition: Point;
}): Style => {
  const drawElements: DrawElementStyle[] = [];

  return {
    // ここでstaff mtx決めちゃったらもともとやりたかったことができない。
    // scale: 1で描画したとして、各Elementの位置を知りたいのよ
    mtx: new Matrix().scale(scale).translate(staffPosition),
    offsetLeft,
    drawElements,
  };
};

const paintNote = ({
  ctx,
  elements,
}: {
  ctx: CanvasRenderingContext2D;
  elements: NoteStyleElement[];
}) => {
  for (const noteEl of elements) {
    if (noteEl.type === "notehead") {
      const { duration, position } = noteEl;
      ctx.save();
      ctx.translate(position.x, position.y);
      const path = noteHeadByDuration(duration);
      drawBravuraPath(ctx, 0, 0, 1, path);
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
      drawBravuraPath(ctx, 0, 0, 1, path);
      ctx.restore();
    } else if (noteEl.type === "flag") {
      const { duration, direction, position } = noteEl;
      const path =
        direction === "up"
          ? upFlagMap.get(duration)
          : downFlagMap.get(duration);
      if (path) {
        drawBravuraPath(ctx, position.x, position.y, 1, path);
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
      ctx.closePath();
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
  drawBravuraPath(ctx, 0, 0, 1, path);
  ctx.restore();
};

const paintStyles = (
  ctx: CanvasRenderingContext2D,
  styles: DrawElementStyle[]
) => {
  ctx.save();
  for (const { element, width } of styles) {
    const { type } = element;
    if (type === "clef") {
      drawGClef(ctx, 0, 0, 1);
    } else if (type === "note") {
      paintNote({ ctx, elements: element.elements });
    } else if (type === "rest") {
      paintRest({ ctx, element });
    } else if (type === "beam") {
      const { elements: styles, beams } = element;
      paintStyles(ctx, styles);
      ctx.save();
      ctx.fillStyle = "#000";
      for (const beam of beams) {
        ctx.beginPath();
        ctx.moveTo(beam.nw.x, beam.nw.y);
        ctx.lineTo(beam.sw.x, beam.sw.y);
        ctx.lineTo(beam.se.x, beam.se.y);
        ctx.lineTo(beam.ne.x, beam.ne.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (type === "bar") {
      // TODO
    } else if (type === "gap") {
      // no-op
    }
    ctx.translate(width, 0);
  }
  ctx.restore();
};

export const paint = ({
  ctx,
  staffWidth,
  styles,
}: {
  ctx: CanvasRenderingContext2D;
  staffWidth: number;
  styles: DrawElementStyle[];
}) => {
  drawStaff(ctx, 0, 0, staffWidth, 1);
  paintStyles(ctx, styles);
};

export const drawElements = ({
  ctx,
  clef,
  canvasWidth,
  scale,
  leftOfStaff,
  topOfStaff,
  elementGap,
  offsetLeft = elementGap,
  elements,
}: {
  ctx: CanvasRenderingContext2D;
  clef?: "g";
  offsetLeft?: number;
  canvasWidth: number;
  scale: number;
  leftOfStaff: number;
  topOfStaff: number;
  elementGap: number;
  elements: Element[];
}): Caret[] => {
  drawStaff(ctx, leftOfStaff, topOfStaff, canvasWidth - leftOfStaff * 2, scale);
  let left = leftOfStaff + elementGap;
  left = drawGClef(ctx, left, topOfStaff, scale).end;
  if (elements.length === 0) {
    return [{ x: left + elementGap, y: topOfStaff, width: 5, elIdx: -1 }];
  }
  const elementIdxToX: Caret[] = [];
  let elIdx = 0;
  console.log(elements);
  while (elIdx < elements.length) {
    const el = elements[elIdx];
    left += elementGap;
    elementIdxToX.push({
      x: left,
      y: topOfStaff,
      width: 5,
      elIdx: elIdx - 1,
    });
    switch (el.type) {
      case "note":
        if (el.beam === "begin") {
          // 連桁
          const startIdx = elIdx;
          const beamedNotes: Note[] = [el];
          let nextIdx = elIdx + 1;
          let nextEl = elements[nextIdx];
          while (
            nextEl?.type === "note" &&
            (nextEl.beam === "continue" || nextEl.beam === "end")
          ) {
            beamedNotes.push(nextEl);
            nextEl = elements[++nextIdx];
          }
          const beams = drawBeamedNotes({
            dnp: {
              ctx,
              topOfStaff,
              left,
              duration: el.duration,
              scale,
            },
            elementGap,
            els: beamedNotes,
            startIdx,
          });
          for (let beamEl of beams) {
            const { elLeft, elEnd, elIdx } = beamEl;
            elementIdxToX.push({
              x: elLeft,
              y: topOfStaff,
              width: elEnd - elLeft,
              elIdx,
            });
            if (elIdx - startIdx + 1 < beamedNotes.length) {
              // caret
              elementIdxToX.push({
                x: elEnd + elementGap,
                y: topOfStaff,
                width: 5,
                elIdx,
              });
            }
            left = elEnd;
          }
          elIdx += beamedNotes.length;
        } else {
          const { end } = drawNote({
            dnp: {
              ctx,
              topOfStaff,
              left,
              duration: el.duration,
              scale,
            },
            pas: el.pitches,
          }).section;
          elementIdxToX.push({
            x: left,
            y: topOfStaff,
            width: end - left,
            elIdx,
          });
          left = end;
          elIdx++;
        }
        break;
      case "rest":
        const { end } = drawRest(ctx, topOfStaff, left, el, scale);
        elementIdxToX.push({
          x: left,
          y: topOfStaff,
          width: end - left,
          elIdx,
        });
        left = end;
        elIdx++;
        break;
      // case "bar":
      //   left = drawBarline(ctx, topOfStaff, left, scale).end;
      //   elementIdxToX.push({ x: left, y: topOfStaff, width: 5, elIdx });
      //   elIdx++;
      //   break;
    }
  }
  const { x: lastX } = elementIdxToX[elementIdxToX.length - 1];
  elementIdxToX.push({
    x: lastX + elementGap,
    y: topOfStaff,
    width: 5,
    elIdx: elements.length - 1,
  });
  return elementIdxToX;
};

export const drawCaret = ({
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

export const pitchByDistance = (
  scale: number,
  dy: number,
  origin: Pitch
): Pitch => {
  const unitY = (UNIT / 2) * scale;
  return Math.round(dy / unitY + origin);
};
export const durationByDistance = (
  scale: number,
  dx: number,
  origin: Duration
): Duration => {
  const unitX = UNIT * 2 * scale;
  const _di = Math.round(dx / unitX + durations.indexOf(origin));
  const di = Math.min(Math.max(_di, 0), 6);
  return durations[di];
};
