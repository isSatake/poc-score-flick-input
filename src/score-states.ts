import { BBox } from "./geometry";
import { MusicalElement } from "./notation/types";
import { PaintElementStyle, PaintElement, Pointing } from "./style";
import { BeamModes, kAccidentalModes, TieModes } from "./ui/types";
export * from "./caret-states";

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
let styles: PaintElementStyle<PaintElement>[] = [];
let elementBBoxes: { bbox: BBox; elIdx?: number }[] = [];
let pointing: Pointing | undefined;
