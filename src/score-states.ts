import { BBox } from "./geometry";
import { MusicalElement } from "./notation/types";
import { PaintElementStyle, PaintElement, Pointing } from "./style";
import { BeamModes, TieModes } from "./ui/types";
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
let beamMode: BeamModes = "nobeam";
let tieMode: TieModes;
let accidentalModeIdx = 0;
let lastEditedIdx: number;
let styles: PaintElementStyle<PaintElement>[] = [];
let elementBBoxes: { bbox: BBox; elIdx?: number }[] = [];
let pointing: Pointing | undefined;
