import { BBox } from "./geometry";
import { MusicalElement } from "./notation/types";
import {
  CaretStyle,
  PaintElement,
  PaintElementStyle,
  Pointing,
} from "./style/types";
import { BeamModes, kAccidentalModes, TieModes } from "./input-modes";

let mainElements: MusicalElement[] = [
  { type: "note", duration: 4, pitches: [{ pitch: 1 }], tie: "start" },
  { type: "note", duration: 4, pitches: [{ pitch: 1 }], tie: "stop" },
];
export function getMainElements() {
  return mainElements;
}
export function setMainElements(v: MusicalElement[]) {
  mainElements = v;
}

let isNoteInputMode = true;
export function getIsNoteInputMode() {
  return isNoteInputMode;
}
export function flipIsNoteInputMode() {
  isNoteInputMode = !isNoteInputMode;
}

let beamMode: BeamModes = "nobeam";
export const getBeamMode = () => beamMode;
export const setBeamMode = (v: BeamModes) => {
  beamMode = v;
};

let tieMode: TieModes;
export const getTieMode = () => tieMode;
export const setTieMode = (v: TieModes) => {
  tieMode = v;
};

let accidentalModeIdx = 0;
export const getAccidentalMode = () => kAccidentalModes[accidentalModeIdx];
export const changeAccidentalMode = () => {
  accidentalModeIdx =
    accidentalModeIdx === kAccidentalModes.length - 1
      ? 0
      : accidentalModeIdx + 1;
};

let lastEditedIdx: number;
export const getLastEditedIndex = () => lastEditedIdx;
export const setLastEditedIndex = (v: number) => {
  lastEditedIdx = v;
};

let styles: PaintElementStyle<PaintElement>[] = [];
export const getStyles = () => styles;
export const setStyles = (v: PaintElementStyle<PaintElement>[]) => {
  styles = v;
};

let elementBBoxes: { bbox: BBox; elIdx?: number }[] = [];
export const getElementBBoxes = () => elementBBoxes;
export const addElementBBoxes = (v: { bbox: BBox; elIdx?: number }) => {
  elementBBoxes.push(v);
};
export const initElementBBoxes = () => {
  elementBBoxes = [];
};

let pointing: Pointing | undefined;
export const getPointing = () => pointing;
export const setPointing = (v?: Pointing) => {
  pointing = v;
};

let caretIndex = 0;
export function getCaretIndex() {
  return caretIndex;
}
export function setCaretIndex(v: number) {
  caretIndex = v;
}
export function addCaretIndex(v: number) {
  caretIndex += v;
}

let caretPositions: CaretStyle[] = [];
export function initCaretPositions() {
  caretPositions = [];
}
export function getCaretPositions() {
  return caretPositions;
}
export function addCaret(v: CaretStyle) {
  caretPositions.push(v);
}
export const getCaretByIndex = (i: number) => caretPositions[i];
export function getCurrentCaret() {
  return caretPositions[caretIndex];
}
