import { PointerHandler } from "./pointer-event";
import { Point } from "./point";
import {
  CaretMoveCallback,
  ChangeNoteRestCallback,
  Duration,
  NoteInputCallback,
} from "./index";

export class N1Handler implements PointerHandler {
  // ポインタハンドラがクラスになってるので、状態を持てる
  private evCount = 0;

  constructor() {
    // ここでコマンドストリームを取るかな
  }

  onDown() {
    console.log(`onDown count:${this.evCount++}`);
    // ここでは楽譜入力イベントを投げるだけかな
  }

  onUp() {
    console.log(`onUp count:${this.evCount++}`);
  }

  onClick() {
    console.log(`onClick count:${this.evCount++}`);
  }

  onLongDown() {
    console.log(`onLongDown count:${this.evCount++}`);
    // フリック候補表示
  }

  onDrag() {
    console.log(`onDrag count:${this.evCount++}`);
    // フリック候補表示
  }
}

class EmptyPointerHandler implements PointerHandler {
  constructor() {}

  onDown(ev: PointerEvent) {}

  onUp(ev: PointerEvent, downPoint: Point) {}

  onClick(ev: PointerEvent) {}

  onLongDown(ev: PointerEvent) {}

  onDrag(ev: PointerEvent, downPoint: Point) {}
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

export class ChangeNoteRestHandler extends EmptyPointerHandler {
  private changeButton = document.getElementsByClassName("changeNoteRest")[0];

  constructor(private callback: ChangeNoteRestCallback) {
    super();
  }

  onUp() {
    this.changeButton.className = this.changeButton.className.replace(
      this.callback.isNoteInputMode() ? "rest" : "note",
      this.callback.isNoteInputMode() ? "note" : "rest"
    );
    this.callback.change();
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
  constructor(private callback: CaretMoveCallback) {
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
