import { changeAccidentalMode, getAccidentalMode } from "../../score-states";
import { AccidentalModes } from "../types";

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
