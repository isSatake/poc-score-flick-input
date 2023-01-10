import { magnitude, Point } from "../geometry";

export interface PointerHandler {
  onMove: (ev: PointerEvent) => void;
  onDown: (ev: PointerEvent) => void;
  onUp: (ev: PointerEvent, downPoint: Point) => void;
  onClick: (ev: PointerEvent) => void;
  onLongDown: (ev: PointerEvent) => void;
  onDrag: (ev: PointerEvent, downPoint: Point) => void;
  onDoubleClick: (ev: PointerEvent) => void;
}

export class PointerEventListener {
  private kLongDownThresholdMs = 300;
  private kDragThresholdMagnitude = 10;
  private longDownTimer = 0;
  private downClassName: string | undefined;
  private downPoint: Point | undefined;
  private isDragging = false;

  constructor(
    readonly targetClassNames: string[],
    readonly handlers: PointerHandler[]
  ) {}

  listener(ev: Event) {
    const pointerEvent = ev as PointerEvent;
    const { className } = pointerEvent.target as HTMLElement;
    switch (ev.type) {
      case "pointerdown":
        if (
          this.targetClassNames.length > 0 &&
          !this.targetClassNames.some((target) => className.includes(target))
        ) {
          return;
        }
        this.downClassName = className;
        this.downPoint = pointerEvent;
        this.onDown(pointerEvent);
        this.longDownTimer = setTimeout(() => {
          this.onLongDown(pointerEvent);
          this.longDownTimer = 0;
        }, this.kLongDownThresholdMs);
        return;
      case "pointerup":
        if (!this.downPoint) {
          return;
        }
        this.onUp(pointerEvent, this.downPoint);
        if (this.longDownTimer > 0) {
          clearTimeout(this.longDownTimer);
          this.onClick(pointerEvent);
        }
        this.reset();
        return;
      case "pointermove":
        this.onMove(pointerEvent);
        if (!this.downPoint) {
          return;
        }
        if (this.isDragging) {
          this.onDrag(pointerEvent, this.downPoint);
        } else if (
          magnitude(pointerEvent, this.downPoint!) >
          this.kDragThresholdMagnitude
        ) {
          this.isDragging = true;
        }
        return;
      default:
        return;
    }
  }

  private reset() {
    this.downClassName = undefined;
    this.downPoint = undefined;
    this.isDragging = false;
  }

  private onMove(ev: PointerEvent) {
    for (const h of this.handlers) {
      h.onMove(ev);
    }
  }

  private onDown(ev: PointerEvent) {
    for (const h of this.handlers) {
      h.onDown(ev);
    }
  }

  private onUp(ev: PointerEvent, down: Point) {
    for (const h of this.handlers) {
      h.onUp(ev, down);
    }
  }

  private onClick(ev: PointerEvent) {
    for (const h of this.handlers) {
      h.onClick(ev);
    }
  }

  private onLongDown(ev: PointerEvent) {
    for (const h of this.handlers) {
      h.onLongDown(ev);
    }
  }

  private onDrag(ev: PointerEvent, down: Point) {
    for (const h of this.handlers) {
      h.onDrag(ev, down);
    }
  }
}

export const registerPointerHandlers = (
  classNames: string[],
  handlers: PointerHandler[]
) => {
  const handler = new PointerEventListener(classNames, handlers);
  ["pointerdown", "pointermove", "pointerup"].forEach((type) => {
    window.addEventListener(type, (ev) => {
      handler.listener(ev);
    });
  });
};
