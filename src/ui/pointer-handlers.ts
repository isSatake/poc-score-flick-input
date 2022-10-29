import { PointerHandler } from "./pointer-event";
import { Point } from "../geometry";
import {
  BarInputCallback,
  CaretInputCallback,
  ChangeAccidentalCallback,
  ChangeBeamCallback,
  ChangeNoteRestCallback,
  NoteInputCallback,
} from "./callbacks";
import { BarTypes, Duration } from "../notation/types";

class EmptyPointerHandler implements PointerHandler {
  constructor() {}

  onDown(ev: PointerEvent) {}

  onUp(ev: PointerEvent, downPoint: Point) {}

  onClick(ev: PointerEvent) {}

  onLongDown(ev: PointerEvent) {}

  onDrag(ev: PointerEvent, downPoint: Point) {}

  onDoubleClick(ev: PointerEvent) {}
}

export class KeyboardDragHandler extends EmptyPointerHandler {
  private readonly translated: Point = { x: 0, y: 0 };

  private readonly keyboardEl = document.getElementById(
    "keyboard"
  ) as HTMLDivElement;

  constructor() {
    super();
  }

  onUp(ev: PointerEvent, down: Point) {
    this.translated.x += ev.x - down.x;
    this.translated.y += ev.y - down.y;
  }

  onDrag(ev: PointerEvent, down: Point) {
    const nextX = this.translated.x + ev.x - down.x;
    const nextY = this.translated.y + ev.y - down.y;
    this.keyboardEl.style.transform = `translate(${nextX}px, ${nextY}px)`;
  }
}

// for screen capture
export class GrayPointerHandler extends EmptyPointerHandler {
  private readonly translated: Point = { x: 0, y: 0 };

  private readonly pointerEl = document.getElementById(
    "pointer"
  ) as HTMLDivElement;

  constructor() {
    super();
  }

  onDown(ev: PointerEvent) {
    this.pointerEl.style.opacity = "0.8";
    this.pointerEl.style.top = `${ev.y - 50 / 2}px`;
    this.pointerEl.style.left = `${ev.x - 50 / 2}px`;
  }

  onUp(ev: PointerEvent, down: Point) {
    this.pointerEl.style.opacity = "0";
  }

  onDrag(ev: PointerEvent, down: Point) {
    this.pointerEl.style.top = `${ev.y - 50 / 2}px`;
    this.pointerEl.style.left = `${ev.x - 50 / 2}px`;
  }
}

export class ChangeNoteRestHandler extends EmptyPointerHandler {
  private changeButton = document.getElementsByClassName("changeNoteRest")[0];

  constructor(private callback: ChangeNoteRestCallback) {
    super();
  }

  onUp() {
    const isNote = this.callback.isNoteInputMode();
    const next = isNote ? "rest" : "note";
    this.changeButton.className = this.changeButton.className.replace(
      isNote ? "note" : "rest",
      next
    );
    this.callback.change();
  }
}

export class ChangeBeamHandler extends EmptyPointerHandler {
  private changeButton = document.getElementsByClassName("changeBeam")[0];

  constructor(private callback: ChangeBeamCallback) {
    super();
  }

  onUp() {
    const mode = this.callback.getMode();
    const next = mode === "nobeam" ? "beam" : "nobeam";
    this.changeButton.className = this.changeButton.className.replace(
      mode,
      next
    );
    this.callback.change(next);
  }

  onDoubleClick(ev: PointerEvent) {
    console.log("double");
  }
}

export class KeyPressHandler extends EmptyPointerHandler {
  private target: HTMLDivElement | undefined;

  constructor() {
    super();
  }

  onDown(ev: PointerEvent) {
    this.target = ev.target as HTMLDivElement;
    this.target.className += " pressed";
  }

  onUp() {
    if (!this.target) {
      return;
    }
    this.target.className = this.target.className.replace(" pressed", "");
  }
}

export class BarInputHandler extends EmptyPointerHandler {
  private candidateContainer: HTMLDivElement;
  constructor(private callback: BarInputCallback) {
    super();
    this.candidateContainer = document.querySelector(
      ".bars .candidateContainer"
    ) as HTMLDivElement;
  }
  onClick(ev: PointerEvent) {
    this.callback.commit({ type: "bar", subtype: "single" });
  }
  onLongDown(ev: PointerEvent) {
    this.candidateContainer.style.visibility = "visible";
  }
  onUp(ev: PointerEvent, downPoint: Point) {
    const [subtype] = (ev.target as HTMLDivElement).className
      .split(" ")
      .filter((v) => v.match(/single|double|repeat/));
    if (subtype) {
      this.callback.commit({ type: "bar", subtype: subtype as BarTypes });
    }
    this.candidateContainer.style.visibility = "hidden";
  }
}

export class ChangeAccidentalHandler extends EmptyPointerHandler {
  private elMap: Map<"sharp" | "natural" | "flat", HTMLDivElement>;
  constructor(private callback: ChangeAccidentalCallback) {
    super();
    this.elMap = new Map([
      ["sharp", document.querySelector(".sharp") as HTMLDivElement],
      ["natural", document.querySelector(".natural") as HTMLDivElement],
      ["flat", document.querySelector(".flat") as HTMLDivElement],
    ]);
  }
  onClick(ev: PointerEvent) {
    this.callback.next();
    const current = this.callback.getMode();
    for (const [mode, el] of this.elMap.entries()) {
      if (mode === current) {
        el.className = el.className + " selected";
      } else {
        el.className = mode;
      }
    }
  }
}

export class NoteInputHandler extends EmptyPointerHandler {
  private readonly posToDurationMap = new Map<string, Duration>([
    ["12", 1],
    ["13", 2],
    ["14", 4],
    ["22", 8],
    ["23", 16],
    ["24", 32],
  ]);
  private targetClassNames: string[] = [];
  private dragDy: number | undefined;

  constructor(private callback: NoteInputCallback) {
    super();
  }

  get duration(): Duration | undefined {
    const pos = this.targetClassNames
      .find((cn) => cn.match(/k[0-9][0-9]/))
      ?.replace("k", "");
    if (!pos) {
      return;
    }
    return this.posToDurationMap.get(pos);
  }

  private isBackspace(): boolean {
    return this.targetClassNames.some((cn) => cn === "backspace");
  }

  onDown(ev: PointerEvent) {
    const target = ev.target as HTMLDivElement;
    this.targetClassNames = target.className.split(" ");
  }

  onClick(ev: PointerEvent) {
    if (this.duration) {
      this.callback.commit(this.duration);
    }
    this.finish();
  }

  onLongDown(ev: PointerEvent) {
    if (this.isBackspace()) {
      return;
    }
    this.callback.startPreview(this.duration!, ev.x, ev.y);
  }

  onDrag(ev: PointerEvent, downPoint: Point) {
    this.dragDy = downPoint.y - ev.y;
    this.callback.updatePreview(this.duration!, this.dragDy);
  }

  onUp(ev: PointerEvent, downPoint: Point) {
    if (this.isBackspace()) {
      this.callback.backspace();
    } else if (this.duration) {
      this.callback.commit(this.duration, this.dragDy ?? 0);
    }
    this.finish();
  }

  finish() {
    this.targetClassNames = [];
    this.dragDy = undefined;
    this.callback.finish();
  }
}

export class ArrowHandler extends EmptyPointerHandler {
  constructor(private callback: CaretInputCallback) {
    super();
  }

  onClick(ev: PointerEvent) {
    const { className } = ev.target as HTMLDivElement;
    if (className.match(/.*toLeft.*/)) {
      this.callback.back();
    } else if (className.match(/.*toRight.*/)) {
      this.callback.forward();
    }
  }
}
