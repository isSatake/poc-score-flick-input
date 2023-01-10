import { changeAccidentalMode, getAccidentalMode } from "../score-states";
import { AccidentalModes } from "../ui/types"; // TODO UIには依存したくないかも

export interface IChangeAccidentalCallback {
  getMode(): AccidentalModes;
  next(): void;
}

export class ChangeAccidentalCallback implements IChangeAccidentalCallback {
  constructor() {}

  getMode() {
    return getAccidentalMode();
  }

  next() {
    changeAccidentalMode();
  }
}
