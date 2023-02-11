import { applyBeamForLastEdited } from "../notation/notation";
import { updateMain } from "../score-renderer";
import {
  getCaretIndex,
  getLastEditedIndex,
  getMainElements,
  setCaretIndex,
  getCaretPositions,
} from "../score-states";

export interface IMoveCaretCallback {
  back(): void;
  forward(): void;
}

export class MoveCaretCallback implements IMoveCaretCallback {
  constructor() {}

  back() {
    if (getCaretIndex() % 2 !== 0) {
      const idx = getCaretIndex() === 1 ? 0 : (getCaretIndex() - 1) / 2;
      if (idx === getLastEditedIndex()) {
        const lastEl = getMainElements()[getLastEditedIndex()];
        const left = getMainElements()[idx - 1];
        const right = getMainElements()[idx + 1];
        applyBeamForLastEdited(lastEl, left, right);
      }
    }
    setCaretIndex(Math.max(getCaretIndex() - 1, 0));
    updateMain();
  }

  forward() {
    if (getCaretIndex() % 2 === 0) {
      const idx = getCaretIndex() / 2 - 1;
      if (idx === getLastEditedIndex()) {
        const lastEl = getMainElements()[getLastEditedIndex()];
        const left = getMainElements()[idx - 1];
        const right = getMainElements()[idx + 1];
        applyBeamForLastEdited(lastEl, left, right);
      }
    }
    setCaretIndex(
      Math.min(getCaretIndex() + 1, getCaretPositions().length - 1)
    );
    updateMain();
  }
}
