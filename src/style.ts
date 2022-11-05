import {
  Accidental,
  Bar,
  Clef,
  Duration,
  MusicalElement,
  Note,
  Pitch,
  PitchAcc,
  Rest,
} from "./notation/types";
import {
  bBarlineSeparation,
  bBeamSpacing,
  bBeamThickness,
  bClefG,
  bRepeatBarlineDotSeparation,
  bStaffHeight,
  bStemWidth,
  bThickBarlineThickness,
  bThinBarlineThickness,
  EXTENSION_LEDGER_LINE,
  Path,
  repeatDotRadius,
  UNIT,
} from "./bravura";
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

export type CaretStyle = { x: number; y: number; width: number; elIdx: number };

// 1音
type NoteStyle = {
  type: "note";
  note: Note;
  elements: NoteStyleElement[];
};
// 1音に含まれる描画パーツ
export type NoteStyleElement =
  | { type: "head"; position: Point; duration: Duration }
  | { type: "accidental"; position: Point; accidental: Accidental }
  | { type: "ledger"; position: Point; width: number }
  | {
      type: "flag";
      position: Point;
      duration: Duration;
      direction: "up" | "down";
    }
  | {
      type: "stem";
      center: number;
      top: number;
      bottom: number;
      width: number;
    };
export type RestStyle = {
  type: "rest";
  rest: Rest;
  position: Point;
};
export type BarStyle = {
  type: "bar";
  bar: Bar;
  elements: BarStyleElement[];
};
export type BarStyleElement =
  | { type: "line"; position: Point; height: number; lineWidth: number }
  | { type: "dot"; position: Point };
export type BeamStyle = {
  type: "beam";
  nw: Point;
  ne: Point;
  sw: Point;
  se: Point;
};
type ClefStyle = {
  type: "clef";
  clef: Clef;
};
type GapStyle = { type: "gap" };
type PaintElement =
  | NoteStyle
  | RestStyle
  | BeamStyle
  | BarStyle
  | ClefStyle
  | GapStyle;

type Section = {
  start: number;
  end: number;
};

export const createSection = (start: number, end?: number): Section => {
  return { start, end: end ?? start };
};
export const calcSection = (
  start: number,
  scale: number,
  path: Path
): Section => {
  const width = getPathWidth(path) * scale;
  return createSection(start, start + width);
};
const determineNoteStyle = ({
  note,
  stemDirection,
  beamed = false,
}: {
  note: Note;
  stemDirection?: "up" | "down";
  beamed?: boolean;
}): {
  element: NoteStyle;
  width: number;
  // top: number;
  // height: number;
  stemOffsetLeft: number;
} => {
  const elements: NoteStyleElement[] = [];
  const sections: Section[] = [];

  // accidentals
  const accSections: Section[] = [];
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
  sections.push(...accSections);

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
  const ledgerSections: Section[] = [];
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
  sections.push(...ledgerSections);

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
    const pitchDesc = pitchAsc.concat().reverse();
    for (let i = 0; i < pitchDesc.length; i++) {
      if (i === 0) {
        // 最低音は右側
        notesRightOfStem.push(pitchDesc[i]);
      } else if (pitchDesc[i - 1].pitch - pitchDesc[i].pitch === 1) {
        // 2度は左側
        notesLeftOfStem.push(pitchDesc[i]);
        if (i + 1 < pitchDesc.length) {
          // 左側描画となった次の音は右側
          notesRightOfStem.push(pitchDesc[++i]);
        }
      } else {
        notesRightOfStem.push(pitchDesc[i]);
      }
    }
  }
  const noteheadStemFlagSections: Section[] = [];
  for (const p of notesLeftOfStem) {
    noteheadStemFlagSections.push(
      calcSection(leftOfNotehead, 1, noteHeadByDuration(note.duration))
    );
    elements.push({
      type: "head",
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
      type: "head",
      position: {
        x: leftOfNotehead,
        y: pitchToY(0, p.pitch, 1),
      },
      duration: note.duration,
    });
  }
  sections.push(...noteheadStemFlagSections);

  return {
    element: {
      type: "note",
      note,
      elements,
    },
    width: maxSection(0, sections).end,
    stemOffsetLeft: leftOfStemOrNotehead,
  };
};

// note headからはみ出る長さ(片方)
const ledgerLineExtension = (scale: number): number => {
  return UNIT * EXTENSION_LEDGER_LINE * scale;
};

const ledgerLineWidth = (duration: Duration): number => {
  return noteHeadWidth(duration) + ledgerLineExtension(1) * 2;
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

const centerOfNotes = (pitches: Pitch[]): Pitch => {
  const average = pitches.reduce((prev, curr) => prev + curr) / pitches.length;
  return Math.round(average);
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

const maxSection = (left: number, sections: Section[]): Section => {
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
}): { elements: NoteStyleElement[]; section?: Section } => {
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
  let flagSection: Section | undefined;
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

const determineRestStyle = (
  rest: Rest,
  elOrigin: Point // paint時のtranslation
): { element: RestStyle; width: number; top: number; height: number } => {
  const path = restPathMap.get(rest.duration)!;
  const y = UNIT * path.top;
  const pathOrigin = { x: 0, y };
  const bbox = getPathBBox(path);
  return {
    element: {
      type: "rest",
      rest,
      position: pathOrigin,
    },
    ...bbox,
    top: bbox.top + elOrigin.y, // 間違ってそう
  };
};

const determineBarStyle = (
  bar: Bar
): { element: BarStyle; width: number; height: number } => {
  const thinWidth = bThinBarlineThickness * UNIT;
  const barlineSeparation = bBarlineSeparation * UNIT;
  const elements: BarStyleElement[] = [];
  let width = 0;
  let height = 0;
  if (bar.subtype === "single") {
    elements.push({
      type: "line",
      position: { x: 0, y: 0 },
      height: bStaffHeight,
      lineWidth: thinWidth,
    });
    width = thinWidth;
    height = bStaffHeight;
  } else if (bar.subtype === "double") {
    elements.push(
      {
        type: "line",
        position: { x: 0, y: 0 },
        height: bStaffHeight,
        lineWidth: thinWidth,
      },
      {
        type: "line",
        position: { x: thinWidth + barlineSeparation, y: 0 }, // TODO x
        height: bStaffHeight,
        lineWidth: thinWidth,
      }
    );
    width = barlineSeparation + thinWidth * 2;
    height = bStaffHeight;
  } else {
    const boldWidth = bThickBarlineThickness * UNIT;
    const dotToLineSeparation = bRepeatBarlineDotSeparation * UNIT;
    elements.push(
      {
        type: "dot",
        position: { x: 0, y: UNIT + UNIT / 2 }, // 第2間
      },
      {
        type: "line",
        position: { x: repeatDotRadius * 2 + dotToLineSeparation, y: 0 },
        height: bStaffHeight,
        lineWidth: thinWidth,
      },
      {
        type: "line",
        position: {
          x:
            repeatDotRadius * 2 +
            dotToLineSeparation +
            thinWidth +
            barlineSeparation,
          y: 0,
        },
        height: bStaffHeight,
        lineWidth: boldWidth,
      }
    );
    width =
      repeatDotRadius * 2 +
      dotToLineSeparation +
      thinWidth +
      barlineSeparation +
      boldWidth;
    height = bStaffHeight;
  }
  return {
    element: { type: "bar", bar, elements },
    width,
    height,
  };
};

export const pitchToY = (
  topOfStaff: number,
  pitch: Pitch,
  scale: number
): number => {
  // middleC(C4)=0とする
  // y原点は符頭の中心(音程を示す高さ)
  const halfOfNoteHeadHeight = (bStaffHeight * scale) / 8;
  const c4y = topOfStaff + UNIT * 4.5 * scale + halfOfNoteHeadHeight;
  return c4y - pitch * halfOfNoteHeadHeight;
};
const getBeamLinearFunc = ({
  dnp,
  stemDirection,
  beamed,
  arr,
}: {
  dnp: { topOfStaff: number; scale: number; duration: Duration };
  stemDirection: "up" | "down";
  beamed: Note[];
  arr: { left: number; stemOffsetLeft: number }[];
}): ((x: number) => number) => {
  const firstEl = beamed[0];
  const lastEl = beamed[beamed.length - 1];
  const yDistance4th = (UNIT / 2) * 3 * dnp.scale;
  const stemDistance =
    arr[arr.length - 1].left +
    arr[arr.length - 1].stemOffsetLeft -
    (arr[0].left + arr[0].stemOffsetLeft);
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
      if (pitchFirstHi > pitchLastHi) {
        // 右肩下がり
        beamAngle =
          (yDistance >= yDistance4th ? yDistance4th : yDistance) / stemDistance;
      } else {
        // 右肩上がり
        beamAngle =
          (-yDistance >= yDistance4th ? -yDistance4th : yDistance) /
          stemDistance;
      }
    }
    // calc 交点
    const beamedAndLeftOfStem = beamed.map((note, i) => ({
      note,
      leftOfStem: arr[i].left + arr[i].stemOffsetLeft,
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
      if (pitchFirstLo > pitchLastLo) {
        // 右肩下がり
        beamAngle =
          (yDistance >= yDistance4th ? yDistance4th : yDistance) / stemDistance;
      } else {
        // 右肩上がり
        beamAngle =
          (-yDistance >= yDistance4th ? -yDistance4th : yDistance) /
          stemDistance;
      }
    }
    // calc 交点
    const beamedAndLeftOfStem = beamed.map((note, i) => ({
      note,
      leftOfStem: arr[i].left + arr[i].stemOffsetLeft,
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
  beamLeft,
  beamRight,
  stemLinearFunc,
  offsetY = 0,
}: {
  scale: number;
  stemDirection: "up" | "down";
  beamLeft: number;
  beamRight: number;
  stemLinearFunc: (stemX: number) => number;
  offsetY?: number;
}): { nw: Point; ne: Point; sw: Point; se: Point } => {
  const beamHeight = UNIT * bBeamThickness * scale;
  // first note
  const firstStemEdge =
    stemLinearFunc(beamLeft) + (stemDirection === "up" ? offsetY : -offsetY);
  const nw = {
    x: beamLeft,
    y: stemDirection === "up" ? firstStemEdge : firstStemEdge - beamHeight,
  };
  const sw = {
    x: beamLeft,
    y: stemDirection === "up" ? firstStemEdge + beamHeight : firstStemEdge,
  };
  // last note
  const lastStemEdge =
    stemLinearFunc(beamRight) + (stemDirection === "up" ? offsetY : -offsetY);
  const ne = {
    x: beamRight,
    y: stemDirection === "up" ? lastStemEdge : lastStemEdge - beamHeight,
  };
  const se = {
    x: beamRight,
    y: stemDirection === "up" ? lastStemEdge + beamHeight : lastStemEdge,
  };
  return { nw, ne, se, sw };
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

const determineBeamStyle = (p: {
  beamedNotes: Note[];
  notePositions: { left: number; stemOffsetLeft: number }[];
  linearFunc: (x: number) => number;
  stemDirection: "up" | "down";
  duration?: Duration;
  headOrTail?: "head" | "tail";
}): PaintElementStyle[] => {
  const {
    beamedNotes,
    notePositions,
    linearFunc,
    stemDirection,
    duration = 8,
    headOrTail,
  } = p;
  console.log("determineBeamStyle", duration);
  let shouldExt = false;
  const { beam: lastBeam } = beamedNotes[beamedNotes.length - 1];
  if (lastBeam === "continue" || lastBeam === "begin") {
    // ちょっとbeamを伸ばしてbeam modeであることを明示
    if (duration > 8) {
      shouldExt = headOrTail === "tail";
    } else {
      shouldExt = true;
    }
  }
  let beamLeft = notePositions[0].left + notePositions[0].stemOffsetLeft;
  let beamRight =
    notePositions[notePositions.length - 1].left +
    notePositions[notePositions.length - 1].stemOffsetLeft +
    (shouldExt ? UNIT : 0);
  if (duration > 8 && beamedNotes.length === 1) {
    if (headOrTail === "head") {
      beamRight = beamLeft + UNIT;
    } else if (headOrTail === "tail") {
      beamLeft = beamRight - UNIT;
    }
  }
  const beams: PaintElementStyle[] = [];
  const offsetY =
    (UNIT * bBeamThickness + UNIT * bBeamSpacing) *
    (numOfBeamsMap.get(duration)! - 1);
  beams.push({
    element: {
      type: "beam",
      ...getBeamShape({
        scale: 1,
        stemDirection,
        beamLeft,
        beamRight,
        stemLinearFunc: linearFunc,
        offsetY,
      }),
    },
    width: beamRight - beamLeft,
  });
  if (duration === 32) {
    return beams;
  }
  const shorterDuration = (duration * 2) as Duration;
  const beamChunks: {
    start: number;
    end: number;
    headOrTail?: "head" | "tail";
  }[] = [];
  let chunkIdx = 0;
  let i = 0;
  let current;
  while (i < beamedNotes.length) {
    const note = beamedNotes[i];
    if (note.duration >= shorterDuration) {
      if (!current) {
        let headOrTail: "head" | "tail" | undefined;
        if (i === 0) {
          headOrTail = "head";
        } else if (i === beamedNotes.length - 1) {
          headOrTail = "tail";
        }
        // 1音だけのbeamも考慮してendにも同じidxを格納
        current = { start: i, end: i, headOrTail };
        beamChunks.push(current);
      }
    } else if (current) {
      beamChunks[chunkIdx].end = i;
      chunkIdx++;
      current = undefined;
    }
    i++;
  }
  if (current) {
    // beamedNotes末尾がshorterDurationの場合を考慮
    beamChunks[chunkIdx].end = beamedNotes.length;
    beamChunks[chunkIdx].headOrTail = "tail";
  }
  console.log(beamChunks);
  for (const { start, end, headOrTail } of beamChunks) {
    beams.push(
      ...determineBeamStyle({
        ...p,
        beamedNotes: beamedNotes.slice(start, end),
        notePositions: notePositions.slice(start, end),
        duration: shorterDuration,
        headOrTail,
      })
    );
  }
  return beams;
};

const determineBeamedNotesStyle = (
  beamedNotes: Note[],
  duration: Duration,
  elementGap: number,
  startIdx: number
): PaintElementStyle[] => {
  const allBeamedPitches = beamedNotes
    .flatMap((n) => n.pitches)
    .map((p) => p.pitch);
  const stemDirection = getStemDirection(allBeamedPitches);
  const notePositions: { left: number; stemOffsetLeft: number }[] = [];
  const elements: PaintElementStyle[] = [];
  const gapEl: PaintElementStyle = {
    element: { type: "gap" },
    width: elementGap,
  };
  let left = 0;
  for (const _i in beamedNotes) {
    const i = Number(_i);
    const noteStyle = determineNoteStyle({
      note: beamedNotes[i],
      stemDirection,
      beamed: true,
    });
    notePositions.push({ left, stemOffsetLeft: noteStyle.stemOffsetLeft });
    const caretOption = { index: i + startIdx };
    elements.push({ caretOption, index: i + startIdx, ...noteStyle });
    left += noteStyle.width;
    elements.push({
      caretOption: { ...caretOption, index: i + startIdx, defaultWidth: true },
      ...gapEl,
    });
    left += elementGap;
  }
  // durationが変わろうが、始点・終点が変わろうが共通
  const linearFunc = getBeamLinearFunc({
    dnp: { topOfStaff: 0, scale: 1, duration },
    stemDirection,
    beamed: beamedNotes,
    arr: notePositions,
  });
  const beams = determineBeamStyle({
    beamedNotes,
    notePositions,
    linearFunc,
    stemDirection,
  });
  for (const i in beamedNotes) {
    const { pitches } = beamedNotes[i];
    const pitchAsc = sortPitch(pitches, "asc");
    const edge = linearFunc(
      notePositions[i].left + notePositions[i].stemOffsetLeft
    );
    let beamed;
    if (stemDirection === "up") {
      beamed = { top: edge };
    } else {
      beamed = { bottom: edge };
    }
    // TODO note側のsectionとmergeしないと正しいwidthにならない
    // beam noteだけgapが狭くなりそう。
    const { elements: el } = determineStemFlagStyle({
      left: notePositions[i].stemOffsetLeft,
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
  return [...beams, ...elements];
};

type 当たり判定 = (point: Point) => boolean;

export type PaintElementStyle = {
  element: PaintElement;
  width: number;
  left?: number;
  top?: number;
  height?: number;
  index?: number;
  caretOption?: {
    index: number;
    defaultWidth?: boolean;
  };
};

export const determinePaintElementStyle = function* (
  elements: MusicalElement[],
  gapWidth: number,
  origin: Point,
  headOpts?: { clef: Clef }
): Generator<PaintElementStyle> {
  const gapEl: PaintElementStyle = {
    element: { type: "gap" },
    width: gapWidth,
  };
  let left = origin.x;
  console.log("left", left);
  if (headOpts) {
    yield { left, top: origin.y, ...gapEl };
    left += gapEl.width;
    console.log("left", left);
    if (headOpts.clef) {
      const clef: PaintElementStyle = {
        element: {
          type: "clef",
          clef: headOpts.clef,
        },
        width: getPathWidth(bClefG),
      };
      yield clef;
      left += clef.width;
      console.log("left", left);
    }
  }
  const caretOption = { index: -1, defaultWidth: true };
  yield { caretOption, left, top: origin.y, ...gapEl };
  left += gapEl.width;
  console.log("left", left);
  let index = 0;
  while (index < elements.length) {
    const el = elements[index];
    if (el.type === "note") {
      if (el.beam === "begin") {
        // 連桁
        const beamedNotes: Note[] = [el];
        let nextIdx = index + 1;
        let nextEl = elements[nextIdx];
        while (
          nextEl?.type === "note" &&
          (nextEl.beam === "continue" || nextEl.beam === "end")
        ) {
          beamedNotes.push(nextEl);
          nextEl = elements[++nextIdx];
        }
        const beamedStyles = determineBeamedNotesStyle(
          beamedNotes,
          el.duration,
          gapWidth,
          index
        );
        for (const beamed of beamedStyles) {
          yield beamed;
        }
        index += beamedNotes.length;
      } else {
        const note = determineNoteStyle({ note: el });
        yield { caretOption: { index }, index: index, ...note };
        left += note.width;
        yield {
          caretOption: { index, defaultWidth: true },
          left,
          top: origin.y,
          ...gapEl,
        };
        left += gapEl.width;
        index++;
      }
    } else if (el.type === "rest") {
      const rest = determineRestStyle(el, { ...origin, x: origin.x + left });
      yield {
        caretOption: { index },
        index,
        ...rest,
        left,
      };
      left += rest.width;
      yield {
        caretOption: { index, defaultWidth: true },
        left,
        top: origin.y,
        ...gapEl,
      };
      left += gapEl.width;
      index++;
    } else if (el.type === "bar") {
      const bar = determineBarStyle(el);
      yield {
        caretOption: { index },
        index,
        left,
        top: origin.y,
        ...bar,
      };
      left += bar.width;
      yield {
        caretOption: { index, defaultWidth: true },
        left,
        top: origin.y,
        ...gapEl,
      };
      left += gapEl.width;
      index++;
    }
  }
};

const getPathWidth = (path: Path): number => {
  return (path.bbox.ne.x - path.bbox.sw.x) * UNIT;
};

const getPathHeight = (path: Path): number => {
  return (path.bbox.ne.y - path.bbox.sw.y) * UNIT;
};

const getPathBBox = (
  path: Path
): { left: number; top: number; width: number; height: number } => {
  return {
    left: path.bbox.sw.x * UNIT,
    top: path.bbox.ne.y * UNIT,
    width: getPathWidth(path),
    height: getPathHeight(path),
  };
};
