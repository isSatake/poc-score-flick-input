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
  dnp: DrawNoteParams;
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
  dnp: DrawNoteParams;
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

export const drawElements = ({
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
      case "bar":
        left = drawBarline(ctx, topOfStaff, left, scale).end;
        elementIdxToX.push({ x: left, y: topOfStaff, width: 5, elIdx });
        elIdx++;
        break;
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
