import { Bar } from "../../notation/types";
import { updateMain } from "../../score-renderer";
import {
  getCaretIndex,
  getMainElements,
  getBeamMode,
  addCaretIndex,
  setLastEditedIndex,
  setMainElements,
} from "../../score-states";
import { inputMusicalElement } from "../../score-updater";

export interface IBarInputCallback {
  commit(bar: Bar): void;
}

export class BarInputCallback implements IBarInputCallback {
  constructor() {}

  commit(bar: Bar) {
    const { elements, insertedIndex, caretAdvance } = inputMusicalElement({
      caretIndex: getCaretIndex(),
      elements: getMainElements(),
      newElement: bar,
      beamMode: getBeamMode(),
    });
    setLastEditedIndex(insertedIndex);
    addCaretIndex(caretAdvance);
    setMainElements(elements);
    updateMain();
  }
}
