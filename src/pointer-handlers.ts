import { PointerHandler } from "./pointer-event";
import { Point } from "./point";
import { ChangeNoteRestCallback, Duration, InputCallback } from "./index";

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

export class InputHandler extends EmptyPointerHandler {
  private readonly posToDurationMap = new Map<string, Duration>([
    ["12", 1],
    ["13", 2],
    ["14", 4],
    ["22", 8],
    ["23", 16],
    ["24", 32],
  ]);
  private target: HTMLDivElement | undefined;

  constructor(private callback: InputCallback) {
    super();
  }

  onClick(ev: PointerEvent) {
    this.target = ev.target as HTMLDivElement;
    const classNames = this.target.className.split(" ");
    if (classNames.some((cn) => cn === "backspace")) {
      this.callback.backspace();
      return;
    }
    const pos = classNames
      .find((cn) => cn.match(/k[0-9][0-9]/))
      ?.replace("k", "");
    if (!pos) {
      return;
    }
    const duration = this.posToDurationMap.get(pos);
    if (!duration) {
      return;
    }
    this.callback.commit(duration, 0);
  }
}
