(() => {
  // src/geometry.ts
  var magnitude = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };
  var scalePoint = (p, scale2) => {
    return {x: p.x * scale2, y: p.y * scale2};
  };
  var offsetBBox = (bbox, offset) => {
    const x = typeof offset?.x === "number" ? offset.x : 0;
    const y = typeof offset?.y === "number" ? offset.y : 0;
    return {
      left: bbox.left + x,
      top: bbox.top + y,
      right: bbox.right + x,
      bottom: bbox.bottom + y
    };
  };
  var getPathBBox = (path, unit) => {
    return {
      left: path.bbox.sw.x * unit,
      top: -path.bbox.ne.y * unit,
      bottom: -path.bbox.sw.y * unit,
      right: path.bbox.ne.x * unit
    };
  };

  // src/ui/pointer-event.ts
  var PointerEventListener = class {
    constructor(targetClassNames, handlers) {
      this.targetClassNames = targetClassNames;
      this.handlers = handlers;
      this.kLongDownThresholdMs = 300;
      this.kDragThresholdMagnitude = 10;
      this.longDownTimer = 0;
      this.isDragging = false;
    }
    listener(ev) {
      const pointerEvent = ev;
      const {className} = pointerEvent.target;
      switch (ev.type) {
        case "pointerdown":
          if (this.targetClassNames.length > 0 && !this.targetClassNames.some((target) => className.includes(target))) {
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
          } else if (magnitude(pointerEvent, this.downPoint) > this.kDragThresholdMagnitude) {
            this.isDragging = true;
          }
          return;
        default:
          return;
      }
    }
    reset() {
      this.downClassName = void 0;
      this.downPoint = void 0;
      this.isDragging = false;
    }
    onMove(ev) {
      for (const h of this.handlers) {
        h.onMove(ev);
      }
    }
    onDown(ev) {
      for (const h of this.handlers) {
        h.onDown(ev);
      }
    }
    onUp(ev, down) {
      for (const h of this.handlers) {
        h.onUp(ev, down);
      }
    }
    onClick(ev) {
      for (const h of this.handlers) {
        h.onClick(ev);
      }
    }
    onLongDown(ev) {
      for (const h of this.handlers) {
        h.onLongDown(ev);
      }
    }
    onDrag(ev, down) {
      for (const h of this.handlers) {
        h.onDrag(ev, down);
      }
    }
  };
  var registerPointerHandlers = (classNames, handlers) => {
    const handler = new PointerEventListener(classNames, handlers);
    ["pointerdown", "pointermove", "pointerup"].forEach((type) => {
      window.addEventListener(type, (ev) => {
        handler.listener(ev);
      });
    });
  };

  // src/bravura.ts
  var bStaffHeight = 1e3;
  var UNIT = bStaffHeight / 4;
  var bStaffLineWidth = 32.5;
  var bLedgerLineThickness = 40;
  var bStemWidth = 30;
  var WIDTH_NOTE_HEAD_BLACK = 295;
  var WIDTH_NOTE_HEAD_WHOLE = 422;
  var EXTENSION_LEDGER_LINE = 0.2;
  var bBarlineSeparation = 0.4;
  var bThinBarlineThickness = 0.16;
  var bThickBarlineThickness = 0.5;
  var bRepeatBarlineDotSeparation = 0.16;
  var repeatDotRadius = UNIT / 4;
  var bBeamThickness = 0.5;
  var bBeamSpacing = 0.25;
  var bClefG = {
    path2d: new Path2D("M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z"),
    bbox: {ne: {x: 2.684, y: 4.392}, sw: {x: 0, y: -2.632}}
  };
  var bNoteHeadWhole = {
    path2d: new Path2D("M216 125c93 0 206 -52 206 -123c0 -70 -52 -127 -216 -127c-149 0 -206 60 -206 127c0 68 83 123 216 123zM111 63c-2 -8 -3 -16 -3 -24c0 -32 15 -66 35 -89c21 -28 58 -52 94 -52c10 0 21 1 31 4c33 8 46 36 46 67c0 60 -55 134 -124 134c-31 0 -68 -5 -79 -40z"),
    bbox: {
      ne: {x: 1.688, y: 0.5},
      sw: {x: 0, y: -0.5}
    }
  };
  var bNoteHeadHalf = {
    path2d: new Path2D("M97 -125c-55 0 -97 30 -97 83c0 52 47 167 196 167c58 0 99 -32 99 -83c0 -33 -33 -167 -198 -167zM75 -87c48 0 189 88 189 131c0 7 -3 13 -6 19c-7 12 -18 21 -37 21c-47 0 -192 -79 -192 -128c0 -7 3 -14 6 -20c7 -12 19 -23 40 -23z"),
    bbox: {ne: {x: 1.18, y: 0.5}, sw: {x: 0, y: -0.5}}
  };
  var bNoteHead = {
    path2d: new Path2D("M0 -42c0 86 88 167 198 167c57 0 97 -32 97 -83c0 -85 -109 -167 -198 -167c-54 0 -97 31 -97 83z"),
    bbox: {ne: {x: 1.18, y: 0.5}, sw: {x: 0, y: -0.5}}
  };
  var bFlag8Up = {
    path2d: new Path2D("M238 -790c-5 -17 -22 -23 -28 -19s-16 13 -16 29c0 4 1 9 3 15c17 45 24 92 24 137c0 59 -9 116 -24 150c-36 85 -131 221 -197 233v239c0 12 8 15 19 15c10 0 18 -6 21 -22c16 -96 58 -182 109 -261c63 -100 115 -218 115 -343c0 -78 -26 -173 -26 -173z"),
    stemUpNW: {x: 0, y: -0.04},
    bbox: {
      ne: {x: 1.056, y: 0.03521239682756091},
      sw: {x: 0, y: -3.240768470618394}
    }
  };
  var bFlag8Down = {
    path2d: new Path2D("M240 760c-10 29 7 48 22 48c7 0 13 -4 16 -15c8 -32 28 -103 28 -181c0 -125 -61 -244 -124 -343c-51 -79 -125 -166 -142 -261c-2 -16 -15 -22 -24 -22c-8 0 -16 5 -16 15v235c134 45 184 126 221 210c15 34 40 118 40 177c0 45 -7 95 -21 137z"),
    stemDownSW: {x: 0, y: 0.132},
    bbox: {ne: {x: 1.224, y: 3.232896633157715}, sw: {x: 0, y: -0.0575672}}
  };
  var bFlag16Up = {
    path2d: new Path2D("M272 -796c-6 -13 -13 -17 -20 -17c-14 0 -22 13 -22 26c0 3 0 5 1 9c5 30 8 60 8 89c0 52 -9 101 -32 149c-69 140 -140 142 -202 144h-5v388c0 7 11 10 17 10s18 -2 20 -13c17 -106 73 -122 127 -180c72 -78 98 -106 108 -174c2 -12 3 -23 3 -36 c0 -61 -22 -121 -25 -127c-1 -3 -1 -5 -1 -7c0 -4 1 -6 1 -9c18 -37 29 -78 29 -120v-22c0 -48 -3 -105 -7 -110zM209 -459c2 -3 4 -4 7 -4c5 0 12 3 13 6c5 8 5 18 7 26c1 7 1 13 1 20c0 32 -9 63 -27 89c-33 49 -87 105 -148 105h-8c-8 0 -14 -6 -14 -10c0 -1 0 -2 1 -3 c21 -82 67 -106 114 -160c21 -24 38 -44 54 -69z"),
    stemUpNW: {x: 0, y: -0.088},
    bbox: {ne: {x: 1.116, y: 8e-3}, sw: {x: 0, y: -3.252}}
  };
  var bFlag16Down = {
    path2d: new Path2D("M240 786c-3 17 5 25 17 26c12 0 19 1 24 -22c16 -80 15 -178 -21 -253c0 -3 -1 -5 -1 -9c0 -3 0 -5 1 -7c3 -6 25 -66 25 -127c0 -13 -1 -25 -3 -36c-24 -157 -221 -200 -245 -354c-2 -11 -13 -13 -20 -13c-10 0 -17 5 -17 10v387h5c62 2 143 5 212 145 c38 78 38 169 23 253zM226 456c-3 0 -5 -1 -7 -4c-16 -26 -33 -46 -54 -69c-47 -55 -103 -78 -124 -160c-1 -1 -1 -2 -1 -3c0 -5 6 -10 14 -10h8c61 0 125 56 158 105c18 26 27 56 27 89c0 6 0 13 -1 20c-2 8 -2 18 -7 25c-1 4 -8 7 -13 7z"),
    stemDownSW: {x: 0, y: 0.128},
    bbox: {
      ne: {x: 1.1635806326044895, y: 3.2480256},
      sw: {x: -19418183745617774e-21, y: -0.03601094374150052}
    }
  };
  var bFlag32Up = {
    path2d: new Path2D("M260 -673c0 -9 1 -18 1 -28c0 -43 -4 -89 -7 -95c-7 -11 -14 -16 -20 -16c-2 0 -4 1 -6 2c-7 3 -13 12 -13 24c0 2 1 4 1 7c5 29 8 57 8 85c0 48 -9 93 -31 137c-64 130 -130 132 -188 134h-5v560c0 7 8 12 14 12c10 0 17 -10 18 -19c17 -100 71 -116 121 -170 c67 -73 90 -100 101 -161c2 -9 2 -18 2 -28c0 -39 -11 -80 -20 -106c14 -29 21 -61 21 -93c0 -57 -21 -112 -23 -119c-1 -2 -1 -4 -1 -6c0 -3 0 -5 1 -7c15 -36 24 -74 26 -113zM208 -181c-55 93 -114 117 -169 117c16 -97 65 -114 114 -168c23 -25 41 -44 55 -62 c5 17 10 34 12 44c1 7 3 13 3 21c0 13 -4 28 -15 48zM219 -456c1 8 2 16 2 24c0 81 -90 177 -170 177c-9 0 -14 -9 -12 -16c22 -73 63 -95 106 -146l5 -5c17 -20 31 -37 46 -59c1 -3 4 -4 7 -4c5 0 10 3 11 6c3 7 3 15 5 23z"),
    stemUpNW: {x: 0, y: 0.376},
    bbox: {ne: {x: 1.044, y: 0.596}, sw: {x: 0, y: -3.248}}
  };
  var bFlag32Down = {
    path2d: new Path2D("M273 676v-11c-4 -64 -9 -75 -22 -100l-4 -7c-2 -3 -3 -5 -3 -9l3 -5v-2c4 -10 20 -53 20 -105c0 -34 -7 -72 -23 -101c9 -27 22 -71 22 -114c0 -10 0 -20 -2 -29c-11 -64 -35 -92 -105 -168c-52 -57 -109 -73 -126 -177c-1 -9 -9 -20 -19 -20c-8 0 -14 4 -14 13v589 c61 2 125 4 201 140c23 41 31 70 31 98c0 34 -12 65 -20 110c0 3 -1 5 -1 7c0 13 7 23 14 26c2 1 4 1 6 1c35 0 42 -116 42 -136zM39 268c0 -5 4 -13 13 -13h5c81 0 173 103 173 185c0 8 -1 17 -2 25c-2 8 -2 16 -5 23c-1 3 -7 6 -12 6c-3 0 -6 -1 -8 -4 c-16 -25 -32 -44 -52 -67c-45 -53 -91 -75 -112 -155zM229 243c-3 11 -8 32 -14 51c-14 -18 -32 -38 -56 -64c-52 -57 -103 -73 -120 -177c0 -1 0 -2 2 -3c57 0 118 26 175 122c12 21 16 37 16 50c0 8 -2 14 -3 21z"),
    stemDownSW: {x: 0, y: -0.448},
    bbox: {ne: {x: 1.092, y: 3.248}, sw: {x: 0, y: -0.687477099907407}}
  };
  var bRest1 = {
    path2d: new Path2D("M282 -109c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),
    originUnits: 1,
    bbox: {ne: {x: 1.128, y: 0.036}, sw: {x: 0, y: -0.54}}
  };
  var bRest2 = {
    path2d: new Path2D("M282 24c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),
    originUnits: 2,
    bbox: {ne: {x: 1.128, y: 0.568}, sw: {x: 0, y: -8e-3}}
  };
  var bRest4 = {
    path2d: new Path2D("M78 -38l-49 60s-10 10 -10 24c0 8 4 19 14 29c45 47 60 90 60 127c0 72 -57 123 -61 134c-3 6 -4 11 -4 16c0 14 10 21 20 21c6 0 13 -3 18 -8c17 -17 165 -193 165 -193s4 -9 4 -19c0 -5 -1 -10 -4 -15c-26 -41 -62 -89 -66 -147v-3l-1 -7v-3c0 -56 31 -93 69 -139 c11 -12 37 -45 37 -57c0 -3 -2 -4 -5 -4c-2 0 -4 0 -8 1l-1 1c-17 6 -50 17 -79 17c-42 0 -63 -32 -63 -73c0 -9 1 -18 4 -26c2 -9 13 -36 26 -36c8 -7 16 -15 16 -24c0 -2 -1 -4 -2 -7c-1 -4 -8 -6 -15 -6c-8 0 -18 3 -26 9c-73 56 -116 105 -116 155c0 49 34 96 86 96 l8 -3h4c4 -1 12 -3 16 -3c5 0 9 1 11 5c1 1 1 3 1 4c0 2 -4 10 -6 14c-13 21 -27 40 -43 60z"),
    originUnits: 2,
    bbox: {ne: {x: 1.08, y: 1.492}, sw: {x: 4e-3, y: -1.5}}
  };
  var bRest8 = {
    path2d: new Path2D("M134 107v-10c33 0 83 60 90 66c6 4 9 4 11 4c2 -1 12 -6 12 -16c-1 -5 -6 -21 -10 -39c0 0 -98 -351 -101 -353c-10 -8 -24 -10 -35 -10c-6 0 -29 1 -29 13c18 66 90 265 93 280c1 4 1 8 1 11c0 5 -1 9 -5 9c-1 0 -3 0 -5 -1c-13 -7 -22 -11 -36 -15 c-11 -4 -25 -7 -39 -7c-19 0 -38 6 -54 17c-15 12 -27 30 -27 51c0 37 30 67 67 67s67 -30 67 -67z"),
    originUnits: 2,
    bbox: {ne: {x: 0.988, y: 0.696}, sw: {x: 0, y: -1.004}}
  };
  var bRest16 = {
    path2d: new Path2D("M208 111v-10c34 1 84 61 91 67c3 2 6 4 11 4c2 -1 10 -5 10 -11c0 -1 -1 -2 -1 -4c-2 -13 -27 -101 -27 -101s-19 -67 -45 -152l-116 -381c-4 -11 -9 -23 -38 -23c-22 0 -31 10 -31 19l1 1v1l95 283v1l1 1c0 4 -2 6 -4 6c-23 -12 -49 -21 -75 -21c-38 0 -80 27 -80 68 c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -10c14 0 41 12 49 31c7 15 58 164 58 180c0 5 -2 7 -5 7c-2 0 -4 -1 -7 -2c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68c38 0 68 -30 68 -68z"),
    originUnits: 2,
    bbox: {ne: {x: 1.28, y: 0.716}, sw: {x: 0, y: -2}}
  };
  var bRest32 = {
    path2d: new Path2D("M353 419c2 0 10 -2 10 -11c0 -1 -1 -2 -1 -4c-2 -12 -26 -101 -26 -101s-172 -770 -175 -782c-4 -11 -7 -21 -39 -21c-21 0 -27 8 -27 16c0 2 0 4 1 6c2 7 71 282 71 286c0 3 -3 6 -6 6c-1 0 -2 0 -3 -1c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68 c38 0 68 -30 68 -68c0 -3 0 -6 -1 -10c15 1 46 14 51 35l40 164c0 5 -2 13 -7 13c-1 0 -2 0 -3 -1c-23 -12 -49 -22 -75 -22c-10 0 -19 2 -27 4c-10 3 -19 7 -27 14c-16 12 -28 30 -28 50c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -9c16 0 49 20 54 36l39 160v1 l1 2c0 7 -4 17 -11 17c-1 0 -3 0 -4 -1c-23 -12 -50 -22 -76 -22c-10 0 -18 2 -26 4c-10 3 -20 7 -28 14c-16 12 -28 30 -28 50c0 38 31 68 68 68c38 0 68 -30 68 -68v-9c34 0 84 61 91 66c3 2 6 4 11 4z"),
    originUnits: 2,
    bbox: {ne: {x: 1.452, y: 1.704}, sw: {x: 0, y: -2}}
  };
  var bAccidentalFlat = {
    path2d: new Path2D("M12 -170c-8 10 -12 581 -12 581c1 18 17 28 31 28c10 0 19 -6 19 -17c0 -20 -6 -260 -7 -282c0 -7 4 -14 11 -17c2 -1 3 -1 5 -1c5 0 16 9 22 14c14 9 38 17 55 17c46 -3 90 -39 90 -96c0 -46 -31 -107 -120 -169c-25 -17 -49 -44 -79 -61c0 0 -3 -2 -6 -2s-6 1 -9 5z M47 -81c0 -5 2 -15 11 -15c3 0 6 1 10 3c43 27 89 81 89 135c0 25 -12 58 -41 58c-23 0 -63 -29 -70 -49c-1 -4 -2 -16 -2 -32c0 -40 3 -100 3 -100z"),
    bbox: {
      ne: {x: 0.904, y: 1.756},
      sw: {x: 0, y: -0.7}
    }
  };
  var bAccidentalNatural = {
    path2d: new Path2D("M141 181l15 5c1 1 3 1 4 1c4 0 8 -3 8 -8v-502c0 -7 -6 -12 -12 -12h-13c-7 0 -12 5 -12 12v149c0 8 -7 11 -17 11c-29 0 -85 -24 -99 -30c-1 -1 -3 -1 -4 -1l-2 -1c-6 0 -9 3 -9 9v515c0 7 5 12 12 12h13c6 0 12 -5 12 -12v-167c0 -4 4 -5 10 -5c26 0 90 23 90 23 c1 0 2 1 4 1zM37 39v-103c0 -4 5 -6 12 -6c25 0 82 23 82 41v103c0 4 -3 5 -9 5c-24 0 -85 -26 -85 -40z"),
    bbox: {
      ne: {x: 0.672, y: 1.364},
      sw: {x: 0, y: -1.34}
    }
  };
  var bAccidentalSharp = {
    path2d: new Path2D("M237 118l-26 -10c-8 -3 -13 -22 -13 -29v-93c0 -12 7 -18 13 -18l26 10c2 1 3 1 5 1c4 0 7 -3 7 -8v-71c0 -6 -5 -14 -12 -17c0 0 -21 -8 -28 -11s-11 -15 -11 -23v-142c0 -6 -6 -11 -17 -11c-7 0 -13 5 -13 11v125c0 6 -5 18 -14 18l-2 -1h-1l-61 -25 c-5 -2 -10 -9 -10 -22v-139c0 -6 -7 -11 -17 -11c-7 0 -13 5 -13 11v123c0 5 -5 16 -12 16c-1 0 -2 0 -3 -1c-9 -3 -23 -9 -24 -9l-2 -1c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 21 9 27 11c6 3 11 12 11 23v99c0 8 -6 18 -14 18l-1 -1c-8 -4 -23 -10 -24 -10l-2 -1 c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 20 8 26 11s12 13 12 27v135c0 6 6 11 16 11c7 0 14 -5 14 -11v-120c0 -8 3 -20 12 -20c17 4 51 18 63 25c9 6 12 19 13 29v130c0 6 6 11 16 11c8 0 14 -5 14 -11v-122c0 -8 7 -13 14 -13c5 1 25 9 25 9c2 1 3 1 5 1c4 0 7 -3 7 -8 v-71c0 -6 -5 -14 -12 -17zM168 -45c2 9 4 37 4 64s-2 52 -4 57c-2 4 -8 6 -15 6c-25 0 -71 -21 -73 -38c-2 -8 -3 -43 -3 -74c0 -24 1 -46 3 -50c1 -3 6 -5 12 -5c23 0 70 20 76 40z"),
    bbox: {
      ne: {x: 0.996, y: 1.4},
      sw: {x: 0, y: -1.392}
    }
  };

  // src/notation/notation.ts
  var upFlagMap = new Map([
    [8, bFlag8Up],
    [16, bFlag16Up],
    [32, bFlag32Up]
  ]);
  var downFlagMap = new Map([
    [8, bFlag8Down],
    [16, bFlag16Down],
    [32, bFlag32Down]
  ]);
  var restPathMap = new Map([
    [1, bRest1],
    [2, bRest2],
    [4, bRest4],
    [8, bRest8],
    [16, bRest16],
    [32, bRest32]
  ]);
  var accidentalPathMap = new Map([
    ["sharp", bAccidentalSharp],
    ["natural", bAccidentalNatural],
    ["flat", bAccidentalFlat]
  ]);
  var numOfBeamsMap = new Map([
    [8, 1],
    [16, 2],
    [32, 3]
  ]);
  var noteHeadByDuration = (duration) => {
    switch (duration) {
      case 1:
        return bNoteHeadWhole;
      case 2:
        return bNoteHeadHalf;
      default:
        return bNoteHead;
    }
  };
  var noteHeadWidth = (duration) => {
    if (duration === 1) {
      return WIDTH_NOTE_HEAD_WHOLE;
    }
    return WIDTH_NOTE_HEAD_BLACK;
  };

  // src/style.ts
  var kPointingColor = "#FF0000";
  var tiePosition = (noteHeadPos, noteHeadBBox) => {
    return {
      x: noteHeadPos.x + (noteHeadBBox.right - noteHeadBBox.left) / 2,
      y: noteHeadPos.y + (noteHeadBBox.bottom - noteHeadBBox.top)
    };
  };
  var determineNoteStyle = ({
    note,
    stemDirection,
    beamed = false,
    pointing
  }) => {
    const elements = [];
    const bboxes = [];
    const accBBoxes = [];
    for (const p of note.pitches) {
      if (!p.accidental) {
        continue;
      }
      const {pitch, accidental} = p;
      const y = pitchToY(0, pitch, 1);
      accBBoxes.push(getPathBBox(accidentalPathMap.get(accidental), UNIT));
      elements.push({
        type: "accidental",
        position: {x: 0, y},
        accidental
      });
    }
    bboxes.push(...accBBoxes);
    let leftOfLedgerLine = 0;
    if (accBBoxes.length > 0) {
      leftOfLedgerLine = accBBoxes[0].right + gapWithAccidental(1);
    }
    const pitches = note.pitches.map((p) => p.pitch);
    const minPitch = Math.min(...pitches);
    const maxPitch = Math.max(...pitches);
    const ledgerWidth = ledgerLineWidth(note.duration);
    const ledgerBBoxes = [];
    if (minPitch <= 0) {
      for (let p = 0; p >= minPitch; p -= 2) {
        const y = pitchToY(0, p, 1);
        elements.push({
          type: "ledger",
          width: ledgerWidth,
          position: {x: leftOfLedgerLine, y}
        });
        ledgerBBoxes.push({
          left: leftOfLedgerLine,
          right: leftOfLedgerLine + ledgerWidth,
          top: y - bLedgerLineThickness,
          bottom: y + bLedgerLineThickness
        });
      }
    }
    if (maxPitch >= 12) {
      for (let p = 12; p < maxPitch + 1; p += 2) {
        const y = pitchToY(0, p, 1);
        elements.push({
          type: "ledger",
          width: ledgerWidth,
          position: {x: leftOfLedgerLine, y}
        });
        ledgerBBoxes.push({
          left: leftOfLedgerLine,
          right: leftOfLedgerLine + ledgerWidth,
          top: y - bLedgerLineThickness,
          bottom: y + bLedgerLineThickness
        });
      }
    }
    bboxes.push(...ledgerBBoxes);
    let leftOfNotehead = 0;
    if (ledgerBBoxes.length > 0) {
      leftOfNotehead = ledgerBBoxes[0].left + ledgerLineExtension(1);
    } else if (accBBoxes.length > 0) {
      leftOfNotehead = accBBoxes[0]?.right + gapWithAccidental(1) * 2;
    }
    if (!stemDirection) {
      stemDirection = getStemDirection(pitches);
    }
    const notesLeftOfStem = [];
    const notesRightOfStem = [];
    const pitchAsc = sortPitch(note.pitches, "asc");
    if (stemDirection === "up") {
      for (let i = 0; i < pitchAsc.length; i++) {
        if (i === 0) {
          notesLeftOfStem.push(pitchAsc[i]);
        } else if (pitchAsc[i].pitch - pitchAsc[i - 1].pitch === 1) {
          notesRightOfStem.push(pitchAsc[i]);
          if (i + 1 < pitchAsc.length) {
            notesLeftOfStem.push(pitchAsc[++i]);
          }
        } else {
          notesLeftOfStem.push(pitchAsc[i]);
        }
      }
    } else {
      const pitchDesc = pitchAsc.concat().reverse();
      for (let i = 0; i < pitchDesc.length; i++) {
        if (i === 0) {
          notesRightOfStem.push(pitchDesc[i]);
        } else if (pitchDesc[i - 1].pitch - pitchDesc[i].pitch === 1) {
          notesLeftOfStem.push(pitchDesc[i]);
          if (i + 1 < pitchDesc.length) {
            notesRightOfStem.push(pitchDesc[++i]);
          }
        } else {
          notesRightOfStem.push(pitchDesc[i]);
        }
      }
    }
    const noteheadStemFlagBBoxes = [];
    for (const p of notesLeftOfStem) {
      const position = {
        x: leftOfNotehead,
        y: pitchToY(0, p.pitch, 1)
      };
      const bbox2 = offsetBBox(getPathBBox(noteHeadByDuration(note.duration), UNIT), position);
      elements.push({
        type: "head",
        position,
        duration: note.duration,
        tie: tiePosition(position, bbox2)
      });
      noteheadStemFlagBBoxes.push(bbox2);
    }
    let leftOfStemOrNotehead = leftOfNotehead;
    if (notesLeftOfStem.length > 0) {
      leftOfStemOrNotehead = noteheadStemFlagBBoxes[0].right;
    }
    bboxes.push(...noteheadStemFlagBBoxes);
    if (!beamed) {
      const {elements: el, bboxes: stemFlagBB} = determineStemFlagStyle({
        left: leftOfStemOrNotehead,
        duration: note.duration,
        direction: stemDirection,
        lowest: pitchAsc[0],
        highest: pitchAsc[pitchAsc.length - 1]
      });
      elements.push(...el);
      bboxes.push(...stemFlagBB);
    }
    for (const p of notesRightOfStem) {
      const position = {
        x: leftOfNotehead,
        y: pitchToY(0, p.pitch, 1)
      };
      const bbox2 = offsetBBox(getPathBBox(noteHeadByDuration(note.duration), UNIT), position);
      elements.push({
        type: "head",
        position,
        duration: note.duration,
        tie: tiePosition(position, bbox2)
      });
      bboxes.push(bbox2);
    }
    console.log("note bboxes", bboxes);
    const bbox = mergeBBoxes(bboxes);
    return {
      element: {
        type: "note",
        note,
        elements,
        ...pointing ? {color: kPointingColor} : void 0
      },
      width: bbox.right - bbox.left,
      stemOffsetLeft: leftOfStemOrNotehead,
      bbox
    };
  };
  var mergeBBoxes = (bboxes) => {
    let ret;
    for (let b of bboxes) {
      if (ret) {
        if (b.left < ret.left) {
          ret.left = b.left;
        }
        if (b.top < ret.top) {
          ret.top = b.top;
        }
        if (b.right > ret.right) {
          ret.right = b.right;
        }
        if (b.bottom > ret.bottom) {
          ret.bottom = b.bottom;
        }
      } else {
        ret = b;
      }
    }
    return ret;
  };
  var ledgerLineExtension = (scale2) => {
    return UNIT * EXTENSION_LEDGER_LINE * scale2;
  };
  var ledgerLineWidth = (duration) => {
    return noteHeadWidth(duration) + ledgerLineExtension(1) * 2;
  };
  var getStemDirection = (pitches) => {
    const lowestToB4 = 6 - Math.min(...pitches);
    const highestToB4 = Math.max(...pitches) - 6;
    if (lowestToB4 > highestToB4) {
      return "up";
    } else if (highestToB4 > lowestToB4) {
      return "down";
    }
    return centerOfNotes(pitches) < 6 ? "up" : "down";
  };
  var centerOfNotes = (pitches) => {
    const average = pitches.reduce((prev, curr) => prev + curr) / pitches.length;
    return Math.round(average);
  };
  var calcStemShape = ({
    dnp,
    direction,
    lowest,
    highest,
    extension = 0
  }) => {
    const {topOfStaff: topOfStaff2, scale: scale2, duration} = dnp;
    const heightOfB4 = topOfStaff2 + bStaffHeight * scale2 / 2;
    let top;
    let bottom;
    if (direction === "up") {
      bottom = pitchToY(topOfStaff2, lowest.pitch, scale2) - 5;
      if (highest.pitch < 0) {
        top = heightOfB4;
      } else {
        const index = duration < 32 ? highest.pitch + 7 : highest.pitch + 8;
        top = pitchToY(topOfStaff2, index, scale2);
      }
      top -= extension;
    } else {
      top = pitchToY(topOfStaff2, highest.pitch, scale2);
      if (lowest.pitch > 12) {
        bottom = heightOfB4;
      } else {
        const index = duration < 32 ? lowest.pitch - 7 : lowest.pitch - 8;
        bottom = pitchToY(topOfStaff2, index, scale2);
      }
      bottom += extension;
    }
    return {top, bottom};
  };
  var gapWithAccidental = (scale2) => {
    return UNIT / 4 * scale2;
  };
  var determineStemFlagStyle = ({
    left,
    duration,
    direction,
    lowest,
    highest,
    beamed
  }) => {
    if (duration === 1) {
      return {elements: [], bboxes: []};
    }
    const elements = [];
    let {top, bottom} = calcStemShape({
      dnp: {topOfStaff: 0, scale: 1, duration},
      direction,
      lowest,
      highest
    });
    let stemCenter;
    const bboxes = [];
    if (direction === "up") {
      stemCenter = left - bStemWidth / 2;
      if (beamed) {
        top = beamed.top;
      } else {
        const path = upFlagMap.get(duration);
        const left2 = stemCenter - bStemWidth / 2;
        if (path) {
          const position = {
            x: left2 + UNIT * path.stemUpNW.x,
            y: top + UNIT * path.stemUpNW.y
          };
          elements.push({
            type: "flag",
            position,
            duration,
            direction
          });
          bboxes.push(offsetBBox(getPathBBox(path, UNIT), position));
        }
      }
    } else {
      stemCenter = left + bStemWidth / 2;
      if (beamed) {
        bottom = beamed.bottom;
      } else {
        const path = downFlagMap.get(duration);
        if (path) {
          const position = {
            x: stemCenter - bStemWidth / 2 + UNIT * path.stemDownSW.x,
            y: bottom + UNIT * path.stemDownSW.y
          };
          elements.push({
            type: "flag",
            position,
            duration,
            direction
          });
          bboxes.push(offsetBBox(getPathBBox(path, UNIT), position));
        }
      }
    }
    const stemEl = {
      type: "stem",
      position: {x: stemCenter - bStemWidth / 2, y: top},
      width: bStemWidth,
      height: bottom - top
    };
    elements.push(stemEl);
    bboxes.push({
      left: stemEl.position.x,
      top: stemEl.position.y,
      right: stemEl.position.x + stemEl.width,
      bottom: stemEl.position.y + stemEl.height
    });
    return {elements, bboxes};
  };
  var determineRestStyle = (rest, pointing) => {
    const path = restPathMap.get(rest.duration);
    const y = UNIT * path.originUnits;
    const pathOrigin = {x: 0, y};
    const bbox = offsetBBox(getPathBBox(path, UNIT), {y});
    return {
      element: {
        type: "rest",
        rest,
        position: pathOrigin,
        ...pointing ? {color: kPointingColor} : {}
      },
      bbox,
      width: bbox.right - bbox.left
    };
  };
  var determineBarStyle = (bar, pointing) => {
    const thinWidth = bThinBarlineThickness * UNIT;
    const barlineSeparation = bBarlineSeparation * UNIT;
    if (bar.subtype === "single") {
      return {
        element: {
          type: "bar",
          bar,
          ...pointing ? {color: kPointingColor} : {},
          elements: [
            {
              type: "line",
              position: {x: 0, y: 0},
              height: bStaffHeight,
              lineWidth: thinWidth
            }
          ]
        },
        width: thinWidth,
        bbox: {
          left: 0,
          top: 0,
          right: thinWidth,
          bottom: bStaffHeight
        }
      };
    } else if (bar.subtype === "double") {
      return {
        element: {
          type: "bar",
          bar,
          ...pointing ? {color: kPointingColor} : {},
          elements: [
            {
              type: "line",
              position: {x: 0, y: 0},
              height: bStaffHeight,
              lineWidth: thinWidth
            },
            {
              type: "line",
              position: {x: thinWidth + barlineSeparation, y: 0},
              height: bStaffHeight,
              lineWidth: thinWidth
            }
          ]
        },
        width: barlineSeparation + thinWidth * 2,
        bbox: {
          left: 0,
          top: 0,
          right: barlineSeparation + thinWidth * 2,
          bottom: bStaffHeight
        }
      };
    } else {
      const boldWidth = bThickBarlineThickness * UNIT;
      const dotToLineSeparation = bRepeatBarlineDotSeparation * UNIT;
      const width = repeatDotRadius * 2 + dotToLineSeparation + thinWidth + barlineSeparation + boldWidth;
      return {
        element: {
          type: "bar",
          bar,
          ...pointing ? {color: kPointingColor} : {},
          elements: [
            {
              type: "dot",
              position: {x: 0, y: UNIT + UNIT / 2}
            },
            {
              type: "line",
              position: {x: repeatDotRadius * 2 + dotToLineSeparation, y: 0},
              height: bStaffHeight,
              lineWidth: thinWidth
            },
            {
              type: "line",
              position: {
                x: repeatDotRadius * 2 + dotToLineSeparation + thinWidth + barlineSeparation,
                y: 0
              },
              height: bStaffHeight,
              lineWidth: boldWidth
            }
          ]
        },
        width,
        bbox: {
          left: 0,
          top: 0,
          right: width,
          bottom: bStaffHeight
        }
      };
    }
  };
  var pitchToY = (topOfStaff2, pitch, scale2) => {
    const halfOfNoteHeadHeight = bStaffHeight * scale2 / 8;
    const c4y = topOfStaff2 + UNIT * 4.5 * scale2 + halfOfNoteHeadHeight;
    return c4y - pitch * halfOfNoteHeadHeight;
  };
  var getBeamLinearFunc = ({
    dnp,
    stemDirection,
    beamed,
    arr
  }) => {
    const firstEl = beamed[0];
    const lastEl = beamed[beamed.length - 1];
    const yDistance4th = UNIT / 2 * 3 * dnp.scale;
    const stemDistance = arr[arr.length - 1].left + arr[arr.length - 1].stemOffsetLeft - (arr[0].left + arr[0].stemOffsetLeft);
    let beamAngle;
    let \u6700\u77EDstem\u3068beam\u306E\u4EA4\u70B9y;
    if (stemDirection === "up") {
      if (beamed.length === 1) {
        beamAngle = 0;
      } else {
        const pitchFirstHi = firstEl.pitches[firstEl.pitches.length - 1].pitch;
        const pitchLastHi = lastEl.pitches[lastEl.pitches.length - 1].pitch;
        const yFirst = pitchToY(dnp.topOfStaff, pitchFirstHi, dnp.scale);
        const yLast = pitchToY(dnp.topOfStaff, pitchLastHi, dnp.scale);
        const yDistance = yLast - yFirst;
        if (pitchFirstHi > pitchLastHi) {
          beamAngle = (yDistance >= yDistance4th ? yDistance4th : yDistance) / stemDistance;
        } else {
          beamAngle = (-yDistance >= yDistance4th ? -yDistance4th : yDistance) / stemDistance;
        }
      }
      const beamedAndLeftOfStem = beamed.map((note, i) => ({
        note,
        leftOfStem: arr[i].left + arr[i].stemOffsetLeft
      }));
      const highest = beamedAndLeftOfStem.sort((a, b) => b.note.pitches[b.note.pitches.length - 1].pitch - a.note.pitches[a.note.pitches.length - 1].pitch)[0];
      const x2 = highest.leftOfStem;
      const y2 = calcStemShape({
        dnp,
        direction: stemDirection,
        lowest: {pitch: highest.note.pitches[0].pitch},
        highest: {
          pitch: highest.note.pitches[highest.note.pitches.length - 1].pitch
        }
      }).top;
      \u6700\u77EDstem\u3068beam\u306E\u4EA4\u70B9y = {x: x2, y: y2};
    } else {
      if (beamed.length === 1) {
        beamAngle = 0;
      } else {
        const pitchFirstLo = firstEl.pitches[0].pitch;
        const pitchLastLo = lastEl.pitches[0].pitch;
        const yFirst = pitchToY(dnp.topOfStaff, pitchFirstLo, dnp.scale);
        const yLast = pitchToY(dnp.topOfStaff, pitchLastLo, dnp.scale);
        const yDistance = yLast - yFirst;
        if (pitchFirstLo > pitchLastLo) {
          beamAngle = (yDistance >= yDistance4th ? yDistance4th : yDistance) / stemDistance;
        } else {
          beamAngle = (-yDistance >= yDistance4th ? -yDistance4th : yDistance) / stemDistance;
        }
      }
      const beamedAndLeftOfStem = beamed.map((note, i) => ({
        note,
        leftOfStem: arr[i].left + arr[i].stemOffsetLeft
      }));
      const lowest = beamedAndLeftOfStem.sort((a, b) => a.note.pitches[0].pitch - b.note.pitches[0].pitch)[0];
      const x2 = lowest.leftOfStem;
      const y2 = calcStemShape({
        dnp,
        direction: stemDirection,
        lowest: {pitch: lowest.note.pitches[0].pitch},
        highest: {
          pitch: lowest.note.pitches[lowest.note.pitches.length - 1].pitch
        }
      }).bottom;
      \u6700\u77EDstem\u3068beam\u306E\u4EA4\u70B9y = {x: x2, y: y2};
    }
    const {x, y} = \u6700\u77EDstem\u3068beam\u306E\u4EA4\u70B9y;
    const \u5207\u7247 = -x * beamAngle + y;
    return (stemX) => stemX * beamAngle + \u5207\u7247;
  };
  var getBeamShape = ({
    scale: scale2,
    stemDirection,
    beamLeft,
    beamRight,
    stemLinearFunc,
    offsetY = 0
  }) => {
    const beamHeight = UNIT * bBeamThickness * scale2;
    const firstStemEdge = stemLinearFunc(beamLeft) + (stemDirection === "up" ? offsetY : -offsetY);
    const nw = {
      x: beamLeft,
      y: stemDirection === "up" ? firstStemEdge : firstStemEdge - beamHeight
    };
    const sw = {
      x: beamLeft,
      y: stemDirection === "up" ? firstStemEdge + beamHeight : firstStemEdge
    };
    const lastStemEdge = stemLinearFunc(beamRight) + (stemDirection === "up" ? offsetY : -offsetY);
    const ne = {
      x: beamRight,
      y: stemDirection === "up" ? lastStemEdge : lastStemEdge - beamHeight
    };
    const se = {
      x: beamRight,
      y: stemDirection === "up" ? lastStemEdge + beamHeight : lastStemEdge
    };
    return {nw, ne, se, sw};
  };
  var sortPitch = (p, dir) => {
    const comparator = (a, b) => {
      if (dir === "asc") {
        return a.pitch < b.pitch;
      } else {
        return b.pitch < a.pitch;
      }
    };
    return p.sort((a, b) => {
      if (comparator(a, b)) {
        return -1;
      } else if (a.pitch === b.pitch) {
        return 0;
      } else {
        return 1;
      }
    });
  };
  var determineBeamStyle = (p) => {
    const {
      beamedNotes,
      notePositions,
      linearFunc,
      stemDirection,
      duration = 8,
      headOrTail
    } = p;
    console.log("determineBeamStyle", duration);
    let shouldExt = false;
    const {beam: lastBeam} = beamedNotes[beamedNotes.length - 1];
    if (lastBeam === "continue" || lastBeam === "begin") {
      if (duration > 8) {
        shouldExt = headOrTail === "tail";
      } else {
        shouldExt = true;
      }
    }
    let beamLeft = notePositions[0].left + notePositions[0].stemOffsetLeft;
    let beamRight = notePositions[notePositions.length - 1].left + notePositions[notePositions.length - 1].stemOffsetLeft + (shouldExt ? UNIT : 0);
    if (duration > 8 && beamedNotes.length === 1) {
      if (headOrTail === "head") {
        beamRight = beamLeft + UNIT;
      } else if (headOrTail === "tail") {
        beamLeft = beamRight - UNIT;
      }
    }
    const beams = [];
    const offsetY = (UNIT * bBeamThickness + UNIT * bBeamSpacing) * (numOfBeamsMap.get(duration) - 1);
    const shape = getBeamShape({
      scale: 1,
      stemDirection,
      beamLeft,
      beamRight,
      stemLinearFunc: linearFunc,
      offsetY
    });
    beams.push({
      element: {
        type: "beam",
        ...shape
      },
      width: beamRight - beamLeft,
      bbox: {
        left: shape.sw.x,
        top: shape.ne.y,
        right: shape.ne.x,
        bottom: shape.sw.y
      }
    });
    if (duration === 32) {
      return beams;
    }
    const shorterDuration = duration * 2;
    const beamChunks = [];
    let chunkIdx = 0;
    let i = 0;
    let current;
    while (i < beamedNotes.length) {
      const note = beamedNotes[i];
      if (note.duration >= shorterDuration) {
        if (!current) {
          let headOrTail2;
          if (i === 0) {
            headOrTail2 = "head";
          } else if (i === beamedNotes.length - 1) {
            headOrTail2 = "tail";
          }
          current = {start: i, end: i, headOrTail: headOrTail2};
          beamChunks.push(current);
        }
      } else if (current) {
        beamChunks[chunkIdx].end = i;
        chunkIdx++;
        current = void 0;
      }
      i++;
    }
    if (current) {
      beamChunks[chunkIdx].end = beamedNotes.length;
      beamChunks[chunkIdx].headOrTail = "tail";
    }
    console.log(beamChunks);
    for (const {start, end, headOrTail: headOrTail2} of beamChunks) {
      beams.push(...determineBeamStyle({
        ...p,
        beamedNotes: beamedNotes.slice(start, end),
        notePositions: notePositions.slice(start, end),
        duration: shorterDuration,
        headOrTail: headOrTail2
      }));
    }
    return beams;
  };
  var determineBeamedNotesStyle = (beamedNotes, duration, elementGap, startIdx, _pointing) => {
    const allBeamedPitches = beamedNotes.flatMap((n) => n.pitches).map((p) => p.pitch);
    const stemDirection = getStemDirection(allBeamedPitches);
    const notePositions = [];
    const elements = [];
    let left = 0;
    for (const _i in beamedNotes) {
      const i = Number(_i);
      const pointing = _pointing?.type === "note" && _pointing.index === i + startIdx ? _pointing : void 0;
      const noteStyle = determineNoteStyle({
        note: beamedNotes[i],
        stemDirection,
        beamed: true,
        pointing
      });
      notePositions.push({left, stemOffsetLeft: noteStyle.stemOffsetLeft});
      const caretOption = {index: i + startIdx};
      elements.push({caretOption, index: i + startIdx, ...noteStyle});
      left += noteStyle.width;
      elements.push(gapElementStyle({
        width: elementGap,
        height: bStaffHeight,
        caretOption: {
          ...caretOption,
          index: i + startIdx,
          defaultWidth: true
        }
      }));
      left += elementGap;
    }
    const linearFunc = getBeamLinearFunc({
      dnp: {topOfStaff: 0, scale: 1, duration},
      stemDirection,
      beamed: beamedNotes,
      arr: notePositions
    });
    const beams = determineBeamStyle({
      beamedNotes,
      notePositions,
      linearFunc,
      stemDirection
    });
    for (const i in beamedNotes) {
      const {pitches} = beamedNotes[i];
      const pitchAsc = sortPitch(pitches, "asc");
      const edge = linearFunc(notePositions[i].left + notePositions[i].stemOffsetLeft);
      let beamed;
      if (stemDirection === "up") {
        beamed = {top: edge};
      } else {
        beamed = {bottom: edge};
      }
      const stemFlag = determineStemFlagStyle({
        left: notePositions[i].stemOffsetLeft,
        duration,
        direction: stemDirection,
        lowest: pitchAsc[0],
        highest: pitchAsc[pitchAsc.length - 1],
        beamed
      });
      const parent = elements[Number(i) * 2];
      const noteSyle = parent.element;
      parent.bbox = mergeBBoxes([parent.bbox, ...stemFlag.bboxes]);
      noteSyle.elements.push(...stemFlag.elements);
    }
    return [...beams, ...elements];
  };
  var determineTieStyle = (start, width) => {
    const startHead = start.element.elements.find((e) => e.type === "head");
    return {
      element: {
        type: "tie",
        position: {...startHead.tie, y: startHead.tie.y - 70},
        cpLow: {x: width / 2, y: 120},
        cpHigh: {x: width / 2, y: 180},
        end: {x: width, y: 0}
      },
      width,
      bbox: {left: 0, top: 0, right: 0, bottom: 0}
    };
  };
  var gapElementStyle = ({
    width,
    height,
    caretOption
  }) => {
    return {
      element: {type: "gap"},
      width,
      bbox: {left: 0, top: 0, right: width, bottom: height},
      caretOption
    };
  };
  var determineClefStyle = (clef, index, pointing) => {
    const path = getPathBBox(bClefG, UNIT);
    const g = pitchToY(0, 4, 1);
    return {
      element: {
        type: "clef",
        clef,
        ...pointing ? {color: kPointingColor} : {}
      },
      width: path.right - path.left,
      bbox: offsetBBox(path, {y: g}),
      index
    };
  };
  var determinePaintElementStyle = (elements, gapWidth, headOpts, pointing) => {
    const styles = [];
    const gapEl = gapElementStyle({
      width: gapWidth,
      height: bStaffHeight
    });
    let left = 0;
    console.log("left", left);
    if (headOpts) {
      styles.push(gapEl);
      left += gapWidth;
      console.log("left", left);
      if (headOpts.clef) {
        const _pointing = pointing?.index === -1 ? pointing : void 0;
        const clef = determineClefStyle(headOpts.clef, -1, _pointing);
        styles.push(clef);
        left += clef.width;
        console.log("left", left);
      }
    }
    styles.push({...gapEl, caretOption: {index: -1, defaultWidth: true}});
    left += gapWidth;
    console.log("left", left);
    let index = 0;
    while (index < elements.length) {
      const el = elements[index];
      if (el.type === "note") {
        if (el.beam === "begin") {
          const beamedNotes = [el];
          let _pointing = pointing?.index === index ? pointing : void 0;
          let nextIdx = index + 1;
          let nextEl = elements[nextIdx];
          while (nextEl?.type === "note" && (nextEl.beam === "continue" || nextEl.beam === "end")) {
            if (!_pointing) {
              _pointing = pointing?.index === nextIdx ? pointing : void 0;
            }
            beamedNotes.push(nextEl);
            nextEl = elements[++nextIdx];
          }
          const beamedStyles = determineBeamedNotesStyle(beamedNotes, el.duration, gapWidth, index, _pointing);
          styles.push(...beamedStyles);
          index += beamedNotes.length;
        } else {
          const _pointing = pointing?.index === index ? pointing : void 0;
          const note = determineNoteStyle({note: el, pointing: _pointing});
          styles.push({caretOption: {index}, index, ...note});
          left += note.width;
          styles.push({...gapEl, caretOption: {index, defaultWidth: true}});
          left += gapWidth;
          index++;
        }
      } else if (el.type === "rest") {
        const _pointing = pointing?.index === index ? pointing : void 0;
        const rest = determineRestStyle(el, _pointing);
        styles.push({caretOption: {index}, index, ...rest});
        left += rest.width;
        styles.push({...gapEl, caretOption: {index, defaultWidth: true}});
        left += gapWidth;
        index++;
      } else if (el.type === "bar") {
        const _pointing = pointing?.index === index ? pointing : void 0;
        const bar = determineBarStyle(el, _pointing);
        styles.push({caretOption: {index}, index, ...bar});
        left += bar.width;
        styles.push({...gapEl, caretOption: {index, defaultWidth: true}});
        left += gapWidth;
        index++;
      }
    }
    const ties = [];
    for (let _i in styles) {
      const i = Number(_i);
      const style = styles[i];
      if (style.element.type === "note" && style.element.note.tie === "start") {
        let distance = style.width;
        for (let j = i + 1; j < styles.length; j++) {
          const _style = styles[j];
          if (_style.element.type === "note" && _style.element.note.tie === "stop") {
            ties.push({
              index: i,
              style: determineTieStyle(style, distance)
            });
            distance = 0;
          } else {
            distance += _style.width;
          }
        }
      }
    }
    for (let {index: index2, style} of ties) {
      styles.splice(index2, 0, style);
    }
    return styles;
  };

  // src/paint.ts
  var initCanvas = ({
    dpr: dpr2,
    leftPx,
    topPx,
    width,
    height,
    _canvas
  }) => {
    const canvas = _canvas ?? document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = `${topPx}px`;
    canvas.style.left = `${leftPx}px`;
    canvas.style.width = `${width}px`;
    canvas.width = width * dpr2;
    canvas.height = height * dpr2;
    canvas.style.height = `${height}px`;
    canvas.getContext("2d")?.scale(dpr2, dpr2);
  };
  var paintBravuraPath = (ctx, left, top, scale2, path, color) => {
    ctx.save();
    ctx.rotate(Math.PI / 180 * 180);
    ctx.translate(-left, -top);
    ctx.scale(-scale2, scale2);
    ctx.fillStyle = color ? color : "#000";
    ctx.fill(path.path2d);
    ctx.restore();
  };
  var paintGClef = (ctx, element, left, topOfStaff2) => {
    const g = pitchToY(topOfStaff2, 4, 1);
    paintBravuraPath(ctx, left, g, 1, bClefG, element.color);
  };
  var paintStaff = (ctx, left, top, width, scale2) => {
    const heightHead = UNIT * scale2;
    for (let i = 0; i < 5; i++) {
      const y = top + heightHead * i;
      ctx.save();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = bStaffLineWidth * scale2;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  };
  var paintBarline = (ctx, element) => {
    const color = element.color ?? "#000";
    for (const el of element.elements) {
      ctx.save();
      if (el.type === "line") {
        ctx.translate(el.position.x + el.lineWidth / 2, el.position.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = el.lineWidth;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, el.height);
        ctx.closePath();
        ctx.stroke();
      } else {
        const rad = repeatDotRadius;
        ctx.translate(el.position.x + rad, el.position.y);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, UNIT, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };
  var paintNote = ({
    ctx,
    element
  }) => {
    const color = element.color ?? "#000";
    for (const noteEl of element.elements) {
      if (noteEl.type === "head") {
        const {duration, position} = noteEl;
        ctx.save();
        ctx.translate(position.x, position.y);
        const path = noteHeadByDuration(duration);
        paintBravuraPath(ctx, 0, 0, 1, path, color);
        ctx.restore();
      } else if (noteEl.type === "ledger") {
        const {width, position} = noteEl;
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = bLedgerLineThickness;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      } else if (noteEl.type === "accidental") {
        const {position, accidental} = noteEl;
        const path = accidentalPathMap.get(accidental);
        ctx.save();
        ctx.translate(position.x, position.y);
        paintBravuraPath(ctx, 0, 0, 1, path, color);
        ctx.restore();
      } else if (noteEl.type === "flag") {
        const {duration, direction, position} = noteEl;
        const path = direction === "up" ? upFlagMap.get(duration) : downFlagMap.get(duration);
        if (path) {
          paintBravuraPath(ctx, position.x, position.y, 1, path, color);
        }
      } else if (noteEl.type === "stem") {
        const {position, width, height} = noteEl;
        ctx.save();
        ctx.translate(position.x + width / 2, position.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
        ctx.restore();
      }
    }
  };
  var paintRest = ({
    ctx,
    element
  }) => {
    const {rest, position, color} = element;
    const path = restPathMap.get(rest.duration);
    ctx.save();
    ctx.translate(position.x, position.y);
    paintBravuraPath(ctx, 0, 0, 1, path, color);
    ctx.restore();
  };
  var paintBeam = (ctx, beam) => {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(beam.nw.x, beam.nw.y);
    ctx.lineTo(beam.sw.x, beam.sw.y);
    ctx.lineTo(beam.se.x, beam.se.y);
    ctx.lineTo(beam.ne.x, beam.ne.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  var paintTie = (ctx, tie) => {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.translate(tie.position.x, tie.position.y);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(tie.cpLow.x, tie.cpLow.y, tie.end.x, tie.end.y);
    ctx.quadraticCurveTo(tie.cpHigh.x, tie.cpHigh.y, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  var paintStyle = (ctx, {element}) => {
    const {type} = element;
    if (type === "clef") {
      paintGClef(ctx, element, 0, 0);
    } else if (type === "note") {
      paintNote({ctx, element});
    } else if (type === "rest") {
      paintRest({ctx, element});
    } else if (type === "beam") {
      paintBeam(ctx, element);
    } else if (type === "tie") {
      paintTie(ctx, element);
    } else if (type === "bar") {
      paintBarline(ctx, element);
    } else if (type === "gap") {
    }
  };
  var paintCaret = ({
    ctx,
    scale: scale2,
    caret
  }) => {
    const {x, y, width} = caret;
    const height = bStaffHeight * scale2;
    ctx.save();
    ctx.fillStyle = "#FF000055";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  };
  var resetCanvas = ({
    ctx,
    width,
    height,
    fillStyle
  }) => {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  // src/ui/pointer-handlers.ts
  var EmptyPointerHandler = class {
    constructor() {
    }
    onMove(ev) {
    }
    onDown(ev) {
    }
    onUp(ev, downPoint) {
    }
    onClick(ev) {
    }
    onLongDown(ev) {
    }
    onDrag(ev, downPoint) {
    }
    onDoubleClick(ev) {
    }
  };
  var KeyboardDragHandler = class extends EmptyPointerHandler {
    constructor() {
      super();
      this.translated = {x: 0, y: 0};
      this.keyboardEl = document.getElementById("keyboard");
    }
    onUp(ev, down) {
      this.translated.x += ev.x - down.x;
      this.translated.y += ev.y - down.y;
    }
    onDrag(ev, down) {
      const nextX = this.translated.x + ev.x - down.x;
      const nextY = this.translated.y + ev.y - down.y;
      this.keyboardEl.style.transform = `translate(${nextX}px, ${nextY}px)`;
    }
  };
  var GrayPointerHandler = class extends EmptyPointerHandler {
    constructor() {
      super();
      this.translated = {x: 0, y: 0};
      this.pointerEl = document.getElementById("pointer");
    }
    onDown(ev) {
      this.pointerEl.style.opacity = "0.8";
      this.pointerEl.style.top = `${ev.y - 50 / 2}px`;
      this.pointerEl.style.left = `${ev.x - 50 / 2}px`;
    }
    onUp(ev, down) {
      this.pointerEl.style.opacity = "0";
    }
    onDrag(ev, down) {
      this.pointerEl.style.top = `${ev.y - 50 / 2}px`;
      this.pointerEl.style.left = `${ev.x - 50 / 2}px`;
    }
  };
  var ChangeNoteRestHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.changeButton = document.getElementsByClassName("changeNoteRest")[0];
    }
    onUp() {
      const isNote = this.callback.isNoteInputMode();
      const next = isNote ? "rest" : "note";
      this.changeButton.className = this.changeButton.className.replace(isNote ? "note" : "rest", next);
      this.callback.change();
    }
  };
  var ChangeBeamHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.changeButton = document.getElementsByClassName("changeBeam")[0];
    }
    onUp() {
      const mode = this.callback.getMode();
      const next = mode === "nobeam" ? "beam" : "nobeam";
      this.changeButton.className = this.changeButton.className.replace(mode, next);
      this.callback.change(next);
    }
    onDoubleClick(ev) {
      console.log("double");
    }
  };
  var KeyPressHandler = class extends EmptyPointerHandler {
    constructor() {
      super();
    }
    onDown(ev) {
      this.target = ev.target;
      this.target.className += " pressed";
    }
    onUp() {
      if (!this.target) {
        return;
      }
      this.target.className = this.target.className.replace(" pressed", "");
    }
  };
  var BarInputHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.candidateContainer = document.querySelector(".bars .candidateContainer");
    }
    onClick(ev) {
      this.callback.commit({type: "bar", subtype: "single"});
    }
    onLongDown(ev) {
      this.candidateContainer.style.visibility = "visible";
    }
    onUp(ev, downPoint) {
      const [subtype] = ev.target.className.split(" ").filter((v) => v.match(/single|double|repeat/));
      if (subtype) {
        this.callback.commit({type: "bar", subtype});
      }
      this.candidateContainer.style.visibility = "hidden";
    }
  };
  var ChangeAccidentalHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.elMap = new Map([
        ["sharp", document.querySelector(".sharp")],
        ["natural", document.querySelector(".natural")],
        ["flat", document.querySelector(".flat")]
      ]);
    }
    onClick(ev) {
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
  };
  var NoteInputHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.posToDurationMap = new Map([
        ["12", 1],
        ["13", 2],
        ["14", 4],
        ["22", 8],
        ["23", 16],
        ["24", 32]
      ]);
      this.targetClassNames = [];
    }
    get duration() {
      const pos = this.targetClassNames.find((cn) => cn.match(/k[0-9][0-9]/))?.replace("k", "");
      if (!pos) {
        return;
      }
      return this.posToDurationMap.get(pos);
    }
    isBackspace() {
      return this.targetClassNames.some((cn) => cn === "backspace");
    }
    onDown(ev) {
      const target = ev.target;
      this.targetClassNames = target.className.split(" ");
    }
    onClick(ev) {
      if (this.duration) {
        this.callback.commit(this.duration);
      }
      this.finish();
    }
    onLongDown(ev) {
      if (this.isBackspace()) {
        return;
      }
      this.callback.startPreview(this.duration, ev.x, ev.y);
    }
    onDrag(ev, downPoint) {
      this.dragDy = downPoint.y - ev.y;
      this.callback.updatePreview(this.duration, this.dragDy);
    }
    onUp(ev, downPoint) {
      if (this.isBackspace()) {
        this.callback.backspace();
      } else if (this.duration) {
        this.callback.commit(this.duration, this.dragDy ?? 0);
      }
      this.finish();
    }
    finish() {
      this.targetClassNames = [];
      this.dragDy = void 0;
      this.callback.finish();
    }
  };
  var ArrowHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
    }
    onClick(ev) {
      const {className} = ev.target;
      if (className.match(/.*toLeft.*/)) {
        this.callback.back();
      } else if (className.match(/.*toRight.*/)) {
        this.callback.forward();
      }
    }
  };
  var CanvasPointerHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
    }
    onMove(ev) {
      this.callback.onMove({x: ev.offsetX, y: ev.offsetY});
    }
  };
  var TieHandler = class extends EmptyPointerHandler {
    constructor(callback) {
      super();
      this.callback = callback;
      this.tieEl = document.querySelector(".changeTie");
    }
    onClick(ev) {
      const current = this.callback.getMode();
      const next = !current ? "tie" : void 0;
      this.callback.change(next);
      this.tieEl.className = this.tieEl.className.replace(next ? "notie" : "tie", next ? "tie" : "notie");
    }
  };

  // src/notation/types.ts
  var accidentals = ["sharp", "natural", "flat"];

  // src/pitch.ts
  var sortPitches = (pitches) => {
    return pitches.sort((pa0, pa1) => {
      if (pa0.pitch === pa1.pitch) {
        if (pa0.accidental === pa1.accidental || !pa0.accidental && pa1.accidental === "natural" || pa0.accidental === "natural" && !pa1.accidental) {
          return 0;
        } else if (pa0.accidental === "flat" && pa1.accidental !== "flat" || (pa0.accidental === "natural" || !pa0.accidental) && pa1.accidental === "sharp") {
          return -1;
        } else {
          return 1;
        }
      } else {
        if (pa0.pitch < pa1.pitch) {
          return -1;
        } else {
          return 1;
        }
      }
    });
  };

  // src/index.ts
  var accidentalModes = [void 0, ...accidentals];
  var dpr = window.devicePixelRatio;
  var scale = 0.08;
  var previewScale = 0.08;
  var leftOfStaff = 250;
  var topOfStaff = 2e3;
  var defaultCaretWidth = 50;
  window.onload = () => {
    const mainWidth = window.innerWidth;
    const mainHeight = window.innerHeight;
    const previewWidth = 300;
    const previewHeight = 400;
    const mainCanvas = document.getElementById("mainCanvas");
    const previewCanvas = document.getElementById("previewCanvas");
    const mainCtx = mainCanvas.getContext("2d");
    const previewCtx = previewCanvas.getContext("2d");
    const noteKeyEls = Array.from(document.getElementsByClassName("note"));
    const changeNoteRestKey = document.getElementsByClassName("changeNoteRest")[0];
    let mainElements = [
      {type: "note", duration: 4, pitches: [{pitch: 1}], tie: "start"},
      {type: "note", duration: 4, pitches: [{pitch: 1}], tie: "stop"}
    ];
    let caretPositions = [];
    let caretIndex = 0;
    let isNoteInputMode = true;
    let beamMode = "nobeam";
    let tieMode;
    let accidentalModeIdx = 0;
    let lastEditedIdx;
    let styles = [];
    let elementBBoxes = [];
    let pointing;
    const updateMain = () => {
      console.log("main", "start");
      resetCanvas({
        ctx: mainCtx,
        width: mainWidth,
        height: mainHeight,
        fillStyle: "#fff"
      });
      caretPositions = [];
      elementBBoxes = [];
      mainCtx.save();
      mainCtx.scale(scale, scale);
      mainCtx.translate(leftOfStaff, topOfStaff);
      paintStaff(mainCtx, 0, 0, UNIT * 100, 1);
      const clef = {type: "g"};
      styles = determinePaintElementStyle(mainElements, UNIT, {clef}, pointing);
      let cursor = 0;
      for (const style of styles) {
        console.log("style", style);
        const {width, element, caretOption, bbox, index: elIdx} = style;
        paintStyle(mainCtx, style);
        const _bbox = offsetBBox(bbox, {x: cursor});
        elementBBoxes.push({bbox: _bbox, elIdx});
        if (caretOption) {
          const {index: elIdx2, defaultWidth} = caretOption;
          const caretWidth = defaultWidth ? defaultCaretWidth : width;
          caretPositions.push({
            x: cursor + (defaultWidth ? width / 2 - caretWidth / 2 : 0),
            y: 0,
            width: caretWidth,
            elIdx: elIdx2
          });
        }
        if (element.type !== "beam" && element.type !== "tie") {
          cursor += width;
          mainCtx.translate(width, 0);
        }
      }
      mainCtx.restore();
      console.log("carets", caretPositions);
      console.log("current caret", caretPositions[caretIndex]);
      mainCtx.save();
      mainCtx.scale(scale, scale);
      mainCtx.translate(leftOfStaff, topOfStaff);
      if (caretPositions[caretIndex]) {
        paintCaret({
          ctx: mainCtx,
          scale: 1,
          caret: caretPositions[caretIndex]
        });
      }
      mainCtx.restore();
      console.log("main", "end");
    };
    const updatePreview = (baseElements, beamMode2, newElement) => {
      console.log("preview", "start");
      resetCanvas({
        ctx: previewCtx,
        width: previewWidth,
        height: previewHeight,
        fillStyle: "#fff"
      });
      const {elements: preview, insertedIndex} = inputMusicalElement({
        caretIndex,
        elements: baseElements,
        newElement,
        beamMode: beamMode2
      });
      console.log("insertedIdx", insertedIndex);
      console.log("preview", preview);
      const _topOfStaff = previewHeight / 2 - bStaffHeight * previewScale / 2;
      const styles2 = [...determinePaintElementStyle(preview, UNIT)];
      const elIdxToX = new Map();
      let cursor = 0;
      for (const style of styles2) {
        const {width, element, index} = style;
        console.log("style", style);
        if (index !== void 0) {
          elIdxToX.set(index, cursor + width / 2);
        }
        if (element.type !== "beam" && element.type !== "tie") {
          cursor += width;
        }
      }
      console.log("elIdxToX", elIdxToX);
      previewCtx.save();
      previewCtx.translate(0, _topOfStaff);
      previewCtx.scale(previewScale, previewScale);
      paintStaff(previewCtx, 0, 0, UNIT * 100, 1);
      previewCtx.restore();
      previewCtx.save();
      previewCtx.translate(previewWidth / 2, _topOfStaff);
      previewCtx.scale(previewScale, previewScale);
      const centerX = elIdxToX.get(insertedIndex);
      console.log("centerX", centerX);
      previewCtx.translate(-centerX, 0);
      for (const style of styles2) {
        const {width, element, bbox, index} = style;
        paintStyle(previewCtx, style);
        const _bbox = offsetBBox(bbox, {x: cursor});
        elementBBoxes.push({bbox: _bbox, elIdx: index});
        if (element.type !== "beam" && element.type !== "tie") {
          previewCtx.translate(width, 0);
        }
      }
      previewCtx.restore();
      console.log("preview", "end");
    };
    const changeNoteRestCallback = {
      isNoteInputMode() {
        return isNoteInputMode;
      },
      change() {
        noteKeyEls.forEach((el) => {
          el.className = el.className.replace(this.isNoteInputMode() ? "note" : "rest", this.isNoteInputMode() ? "rest" : "note");
        });
        changeNoteRestKey.className = changeNoteRestKey.className.replace(this.isNoteInputMode() ? "rest" : "note", this.isNoteInputMode() ? "note" : "rest");
        isNoteInputMode = !isNoteInputMode;
      }
    };
    const changeBeamCallback = {
      getMode() {
        return beamMode;
      },
      change(mode) {
        noteKeyEls.forEach((el) => {
          el.className = el.className.replace(mode === "nobeam" ? "beamed" : "nobeam", mode === "nobeam" ? "nobeam" : "beamed");
        });
        beamMode = mode;
        const lastEl = mainElements[lastEditedIdx];
        if (lastEl) {
          const left = mainElements[lastEditedIdx - 1];
          const right = mainElements[lastEditedIdx + 1];
          applyBeamForLastEdited(lastEl, left, right);
          updateMain();
        }
      }
    };
    const changeAccidentalCallback = {
      getMode() {
        return accidentalModes[accidentalModeIdx];
      },
      next() {
        accidentalModeIdx = accidentalModeIdx === accidentalModes.length - 1 ? 0 : accidentalModeIdx + 1;
      }
    };
    const changeTieCallback = {
      getMode() {
        return tieMode;
      },
      change(next) {
        tieMode = next;
      }
    };
    let copiedElements;
    const noteInputCallback = {
      startPreview(duration, downX, downY) {
        const left = downX - previewWidth / 2;
        const top = downY - previewHeight / 2;
        initCanvas({
          dpr,
          leftPx: left,
          topPx: top,
          width: previewWidth,
          height: previewHeight,
          _canvas: previewCanvas
        });
        copiedElements = [...mainElements];
        const newPitch = {
          pitch: pitchByDistance(previewScale, 0, 6),
          accidental: accidentalModes[accidentalModeIdx]
        };
        let tie;
        if (tieMode && caretIndex > 0 && caretIndex % 2 === 0) {
          const prevEl = copiedElements[caretIndex / 2 - 1];
          if (prevEl?.type === "note" && prevEl.pitches[0].pitch === newPitch.pitch && prevEl.pitches[0].accidental === newPitch.accidental) {
            prevEl.tie = "start";
            tie = "stop";
          }
        }
        const element = isNoteInputMode ? {
          type: "note",
          duration,
          pitches: [newPitch],
          tie
        } : {
          type: "rest",
          duration
        };
        if (caretIndex > 0 && caretIndex % 2 !== 0) {
          const oldIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
          const oldEl = copiedElements[oldIdx];
          if (element.type === "note" && oldEl.type === "note" && element.duration === oldEl.duration) {
            element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
          }
        }
        updatePreview(copiedElements, beamMode, element);
        previewCanvas.style.visibility = "visible";
      },
      updatePreview(duration, dy) {
        copiedElements = [...mainElements];
        const newPitch = {
          pitch: pitchByDistance(previewScale, dy, 6),
          accidental: accidentalModes[accidentalModeIdx]
        };
        let tie;
        if (tieMode && caretIndex > 0 && caretIndex % 2 === 0) {
          const prevEl = copiedElements[caretIndex / 2 - 1];
          if (prevEl?.type === "note" && prevEl.pitches[0].pitch === newPitch.pitch && prevEl.pitches[0].accidental === newPitch.accidental) {
            prevEl.tie = "start";
            tie = "stop";
          }
        }
        const element = isNoteInputMode ? {
          type: "note",
          duration,
          pitches: [newPitch],
          tie
        } : {
          type: "rest",
          duration
        };
        if (caretIndex > 0 && caretIndex % 2 !== 0) {
          const oldIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
          const oldEl = copiedElements[oldIdx];
          if (element.type === "note" && oldEl.type === "note" && element.duration === oldEl.duration) {
            element.pitches = sortPitches([...oldEl.pitches, ...element.pitches]);
          }
        }
        updatePreview(copiedElements, beamMode, element);
      },
      commit(duration, dy) {
        let newElement;
        const newPitch = {
          pitch: pitchByDistance(previewScale, dy ?? 0, 6),
          accidental: accidentalModes[accidentalModeIdx]
        };
        let tie;
        if (tieMode && caretIndex > 0 && caretIndex % 2 === 0) {
          const prevEl = mainElements[caretIndex / 2 - 1];
          if (prevEl?.type === "note" && prevEl.pitches[0].pitch === newPitch.pitch && prevEl.pitches[0].accidental === newPitch.accidental) {
            prevEl.tie = "start";
            tie = "stop";
          }
        }
        if (isNoteInputMode) {
          newElement = {
            type: "note",
            duration,
            pitches: [newPitch],
            tie
          };
        } else {
          newElement = {
            type: "rest",
            duration
          };
        }
        const {elements, insertedIndex, caretAdvance} = inputMusicalElement({
          caretIndex,
          elements: mainElements,
          newElement,
          beamMode
        });
        lastEditedIdx = insertedIndex;
        caretIndex += caretAdvance;
        mainElements = elements;
        updateMain();
        copiedElements = [];
      },
      backspace() {
        const targetElIdx = caretPositions[caretIndex].elIdx;
        if (targetElIdx < 0) {
          return;
        }
        const deleted = mainElements.splice(targetElIdx, 1)[0];
        if (deleted.type === "note") {
          const left = mainElements[targetElIdx - 1];
          const right = mainElements[targetElIdx];
          if (deleted.beam === "begin" && right) {
            right.beam = "begin";
          } else if (deleted.beam === "end" && left) {
            left.beam = "end";
          }
        }
        let t = caretIndex - 1;
        while (t > -1) {
          if (t === 0) {
            caretIndex = 0;
            t = -1;
          } else if (caretPositions[t].elIdx !== targetElIdx) {
            caretIndex = t;
            t = -1;
          } else {
            t--;
          }
        }
        updateMain();
      },
      finish() {
        previewCanvas.style.visibility = "hidden";
      }
    };
    const caretMoveCallback = {
      back() {
        if (caretIndex % 2 !== 0) {
          const idx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
          if (idx === lastEditedIdx) {
            const lastEl = mainElements[lastEditedIdx];
            const left = mainElements[idx - 1];
            const right = mainElements[idx + 1];
            applyBeamForLastEdited(lastEl, left, right);
          }
        }
        caretIndex = Math.max(caretIndex - 1, 0);
        updateMain();
      },
      forward() {
        if (caretIndex % 2 === 0) {
          const idx = caretIndex / 2 - 1;
          if (idx === lastEditedIdx) {
            const lastEl = mainElements[lastEditedIdx];
            const left = mainElements[idx - 1];
            const right = mainElements[idx + 1];
            applyBeamForLastEdited(lastEl, left, right);
          }
        }
        caretIndex = Math.min(caretIndex + 1, caretPositions.length - 1);
        updateMain();
      }
    };
    const barInputCallback = {
      commit(bar) {
        const {elements, insertedIndex, caretAdvance} = inputMusicalElement({
          caretIndex,
          elements: mainElements,
          newElement: bar,
          beamMode
        });
        lastEditedIdx = insertedIndex;
        caretIndex += caretAdvance;
        mainElements = elements;
        updateMain();
      }
    };
    const canvasCallback = {
      onMove(htmlPoint) {
        let nextPointing = void 0;
        for (let i in elementBBoxes) {
          const {type} = styles[i].element;
          if (type === "gap" || type === "beam" || type === "tie") {
            continue;
          }
          if (isPointInBBox(scalePoint(htmlPoint, 1 / scale), offsetBBox(elementBBoxes[i].bbox, {x: leftOfStaff, y: topOfStaff}))) {
            const {elIdx} = elementBBoxes[i];
            if (elIdx !== void 0) {
              nextPointing = {index: elIdx, type};
            }
          }
        }
        if (pointing !== nextPointing) {
          pointing = nextPointing;
          updateMain();
        }
      }
    };
    registerPointerHandlers(["keyboardBottom", "keyboardHandle"], [new KeyboardDragHandler()]);
    registerPointerHandlers(["changeNoteRest"], [new ChangeNoteRestHandler(changeNoteRestCallback)]);
    registerPointerHandlers(["changeBeam"], [new ChangeBeamHandler(changeBeamCallback)]);
    registerPointerHandlers(["grayKey", "whiteKey"], [new KeyPressHandler()]);
    registerPointerHandlers(["note", "rest", "backspace"], [new NoteInputHandler(noteInputCallback)]);
    registerPointerHandlers(["toLeft", "toRight"], [new ArrowHandler(caretMoveCallback)]);
    registerPointerHandlers(["bars", "candidate"], [new BarInputHandler(barInputCallback)]);
    registerPointerHandlers(["accidentals"], [new ChangeAccidentalHandler(changeAccidentalCallback)]);
    registerPointerHandlers([], [new GrayPointerHandler()]);
    registerPointerHandlers(["mainCanvas"], [new CanvasPointerHandler(canvasCallback)]);
    registerPointerHandlers(["changeTie"], [new TieHandler(changeTieCallback)]);
    initCanvas({
      dpr,
      leftPx: 0,
      topPx: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      _canvas: mainCanvas
    });
    initCanvas({
      dpr,
      leftPx: 0,
      topPx: 0,
      width: previewWidth,
      height: previewHeight,
      _canvas: previewCanvas
    });
    updateMain();
  };
  function applyBeam(beamMode, insert, left, right) {
    if (insert.type === "note" && beamMode !== "nobeam") {
      if (left?.type === "note" && right?.type === "note" && left.beam && right.beam) {
        if (left.beam === "begin") {
          if (right.beam === "begin") {
            insert.beam = "continue";
            right.beam = "continue";
          } else {
            insert.beam = "continue";
          }
        } else if (left.beam === "continue") {
          if (right.beam === "begin") {
            insert.beam = "end";
          } else {
            insert.beam = "continue";
          }
        }
      } else {
        insert.beam = "begin";
        if (left?.type === "note" && (left?.beam === "begin" || left?.beam === "continue")) {
          insert.beam = "continue";
        }
        if (right?.type === "note" && right?.beam === "begin") {
          right.beam = "continue";
        }
      }
    } else {
      if (right?.type === "note") {
        if (right?.beam === "continue") {
          right.beam = "begin";
        } else if (right?.beam === "end") {
          delete right.beam;
        }
      }
      if (left?.type === "note") {
        if (left?.beam === "begin") {
          delete left.beam;
        } else if (left?.beam === "continue") {
          left.beam = "end";
        }
      }
    }
  }
  function applyBeamForLastEdited(last, left, right) {
    if (last.type === "note" && (last.beam === "begin" || last.beam === "continue")) {
      if (!right || right?.type === "note" && (!right?.beam || right?.beam === "begin")) {
        if (left?.type === "note" && (left?.beam === "begin" || left?.beam === "continue")) {
          last.beam = "end";
        } else {
          delete last.beam;
        }
      }
    }
  }
  function inputMusicalElement({
    caretIndex,
    elements,
    newElement,
    beamMode
  }) {
    const _elements = [...elements];
    let insertedIndex = 0;
    let caretAdvance = 0;
    if (caretIndex === 0) {
      const right = _elements[caretIndex];
      applyBeam(beamMode, newElement, void 0, right);
      _elements.splice(caretIndex, 0, newElement);
      caretAdvance = 2;
    } else {
      if (caretIndex % 2 === 0) {
        const insertIdx = caretIndex / 2;
        const left = _elements[insertIdx - 1];
        const right = _elements[insertIdx];
        console.log("insertIdx", insertIdx, "left", left, "right", right);
        applyBeam(beamMode, newElement, left, right);
        _elements.splice(insertIdx, 0, newElement);
        caretAdvance = 2;
        insertedIndex = insertIdx;
      } else {
        const overrideIdx = caretIndex === 1 ? 0 : (caretIndex - 1) / 2;
        const overrideEl = _elements[overrideIdx];
        if (newElement.type === "note" && overrideEl.type === "note" && newElement.duration === overrideEl.duration) {
          newElement.pitches = sortPitches([
            ...overrideEl.pitches,
            ...newElement.pitches
          ]);
        }
        const left = _elements[overrideIdx - 1];
        const right = _elements[overrideIdx + 1];
        applyBeam(beamMode, newElement, left, right);
        _elements.splice(overrideIdx, 1, newElement);
        insertedIndex = overrideIdx;
      }
    }
    return {elements: _elements, insertedIndex, caretAdvance};
  }
  var pitchByDistance = (scale2, dy, origin) => {
    const unitY = UNIT / 2 * scale2;
    return Math.round(dy / unitY + origin);
  };
  var isPointInBBox = ({x, y}, {left, top, right, bottom}) => {
    return left <= x && x <= right && top <= y && y <= bottom;
  };
})();
