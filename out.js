(() => {
  // bravura.ts
  var bStaffHeight = 1e3;
  var UNIT = bStaffHeight / 4;
  var bStaffLineWidth = 32.5;
  var bLedgerLineWidth = 40;
  var bStemWidth = 30;
  var WIDTH_NOTE_HEAD_BLACK = 295;
  var WIDTH_NOTE_HEAD_WHOLE = 422;
  var EXTENSION_LEDGER_LINE = 0.2;
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
    top: 1,
    bbox: {ne: {x: 1.128, y: 0.036}, sw: {x: 0, y: -0.54}}
  };
  var bRest2 = {
    path2d: new Path2D("M282 24c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),
    top: 2,
    bbox: {ne: {x: 1.128, y: 0.568}, sw: {x: 0, y: -8e-3}}
  };
  var bRest4 = {
    path2d: new Path2D("M78 -38l-49 60s-10 10 -10 24c0 8 4 19 14 29c45 47 60 90 60 127c0 72 -57 123 -61 134c-3 6 -4 11 -4 16c0 14 10 21 20 21c6 0 13 -3 18 -8c17 -17 165 -193 165 -193s4 -9 4 -19c0 -5 -1 -10 -4 -15c-26 -41 -62 -89 -66 -147v-3l-1 -7v-3c0 -56 31 -93 69 -139 c11 -12 37 -45 37 -57c0 -3 -2 -4 -5 -4c-2 0 -4 0 -8 1l-1 1c-17 6 -50 17 -79 17c-42 0 -63 -32 -63 -73c0 -9 1 -18 4 -26c2 -9 13 -36 26 -36c8 -7 16 -15 16 -24c0 -2 -1 -4 -2 -7c-1 -4 -8 -6 -15 -6c-8 0 -18 3 -26 9c-73 56 -116 105 -116 155c0 49 34 96 86 96 l8 -3h4c4 -1 12 -3 16 -3c5 0 9 1 11 5c1 1 1 3 1 4c0 2 -4 10 -6 14c-13 21 -27 40 -43 60z"),
    top: 2,
    bbox: {ne: {x: 1.08, y: 1.492}, sw: {x: 4e-3, y: -1.5}}
  };
  var bRest8 = {
    path2d: new Path2D("M134 107v-10c33 0 83 60 90 66c6 4 9 4 11 4c2 -1 12 -6 12 -16c-1 -5 -6 -21 -10 -39c0 0 -98 -351 -101 -353c-10 -8 -24 -10 -35 -10c-6 0 -29 1 -29 13c18 66 90 265 93 280c1 4 1 8 1 11c0 5 -1 9 -5 9c-1 0 -3 0 -5 -1c-13 -7 -22 -11 -36 -15 c-11 -4 -25 -7 -39 -7c-19 0 -38 6 -54 17c-15 12 -27 30 -27 51c0 37 30 67 67 67s67 -30 67 -67z"),
    top: 2,
    bbox: {ne: {x: 0.988, y: 0.696}, sw: {x: 0, y: -1.004}}
  };
  var bRest16 = {
    path2d: new Path2D("M208 111v-10c34 1 84 61 91 67c3 2 6 4 11 4c2 -1 10 -5 10 -11c0 -1 -1 -2 -1 -4c-2 -13 -27 -101 -27 -101s-19 -67 -45 -152l-116 -381c-4 -11 -9 -23 -38 -23c-22 0 -31 10 -31 19l1 1v1l95 283v1l1 1c0 4 -2 6 -4 6c-23 -12 -49 -21 -75 -21c-38 0 -80 27 -80 68 c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -10c14 0 41 12 49 31c7 15 58 164 58 180c0 5 -2 7 -5 7c-2 0 -4 -1 -7 -2c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68c38 0 68 -30 68 -68z"),
    top: 2,
    bbox: {ne: {x: 1.28, y: 0.716}, sw: {x: 0, y: -2}}
  };
  var bRest32 = {
    path2d: new Path2D("M353 419c2 0 10 -2 10 -11c0 -1 -1 -2 -1 -4c-2 -12 -26 -101 -26 -101s-172 -770 -175 -782c-4 -11 -7 -21 -39 -21c-21 0 -27 8 -27 16c0 2 0 4 1 6c2 7 71 282 71 286c0 3 -3 6 -6 6c-1 0 -2 0 -3 -1c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68 c38 0 68 -30 68 -68c0 -3 0 -6 -1 -10c15 1 46 14 51 35l40 164c0 5 -2 13 -7 13c-1 0 -2 0 -3 -1c-23 -12 -49 -22 -75 -22c-10 0 -19 2 -27 4c-10 3 -19 7 -27 14c-16 12 -28 30 -28 50c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -9c16 0 49 20 54 36l39 160v1 l1 2c0 7 -4 17 -11 17c-1 0 -3 0 -4 -1c-23 -12 -50 -22 -76 -22c-10 0 -18 2 -26 4c-10 3 -20 7 -28 14c-16 12 -28 30 -28 50c0 38 31 68 68 68c38 0 68 -30 68 -68v-9c34 0 84 61 91 66c3 2 6 4 11 4z"),
    top: 2,
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

  // index.ts
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
  var initCanvas = () => {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
  };
  var drawBravuraPath = (ctx, left, top, scale, path) => {
    ctx.save();
    ctx.rotate(Math.PI / 180 * 180);
    ctx.translate(-left, -top);
    ctx.scale(-scale, scale);
    ctx.fill(path.path2d);
    ctx.restore();
  };
  var drawGClef = (ctx, left, topOfStaff, scale) => {
    const y = topOfStaff + UNIT * scale * 3;
    drawBravuraPath(ctx, left, y, scale, bClefG);
    return calcSection(left, scale, bClefG);
  };
  var drawStaff = (ctx, left, top, width, scale) => {
    const heightHead = UNIT * scale;
    for (let i = 0; i < 5; i++) {
      const y = top + heightHead * i;
      ctx.save();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = bStaffLineWidth * scale;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  };
  var pitchToY = (topOfStaff, pitch, scale) => {
    const halfOfNoteHeadHeight = bStaffHeight * scale / 8;
    const c4y = topOfStaff + UNIT * 4.5 * scale + halfOfNoteHeadHeight;
    return c4y - pitch * halfOfNoteHeadHeight;
  };
  var calcSection = (start, scale, path) => {
    const width = (path.bbox.ne.x - path.bbox.sw.x) * UNIT * scale;
    return {start, end: start + width};
  };
  var drawNoteHead = (params) => {
    const {ctx, left, topOfStaff, note, scale} = params;
    const {pitch, duration} = note;
    const top = pitchToY(topOfStaff, pitch, scale);
    const path = noteHeadByDuration(duration);
    drawBravuraPath(ctx, left, top, scale, path);
    return calcSection(left, scale, path);
  };
  var ledgerLineExtension = (scale) => {
    return UNIT * EXTENSION_LEDGER_LINE * scale;
  };
  var drawLedgerLine = (ctx, top, start, note, scale) => {
    const end = start + noteHeadWidth(note.duration) * scale + ledgerLineExtension(scale) * 2;
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = bLedgerLineWidth * scale;
    ctx.beginPath();
    ctx.moveTo(start, top);
    ctx.lineTo(end, top);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    return {start, end};
  };
  var drawLedgerLines = (params) => {
    const {ctx, note, scale, left, topOfStaff} = params;
    const {pitch} = note;
    let section;
    if (pitch <= 0) {
      for (let i = 0; i >= pitch; i -= 2) {
        section = drawLedgerLine(ctx, pitchToY(topOfStaff, i, scale), left, note, scale);
      }
    } else if (pitch >= 12) {
      for (let i = 12; i < pitch + 1; i += 2) {
        section = drawLedgerLine(ctx, pitchToY(topOfStaff, i, scale), left, note, scale);
      }
    }
    return section;
  };
  var drawStemAndFlags = (params) => {
    const {ctx, topOfStaff, left, scale, note} = params;
    const {pitch, duration} = note;
    if (duration === 1) {
      return;
    }
    const heightOfB3 = topOfStaff + bStaffHeight * scale / 2;
    const lineWidth = bStemWidth * scale;
    let stemCenter;
    let top;
    let bottom;
    let drawnSection;
    if (pitch < 6) {
      stemCenter = left + WIDTH_NOTE_HEAD_BLACK * scale - lineWidth / 2;
      bottom = pitchToY(topOfStaff, pitch, scale) - 5;
      if (pitch < 0) {
        top = heightOfB3;
      } else {
        const index = duration <= 32 ? pitch + 7 : pitch + 8;
        top = pitchToY(topOfStaff, index, scale);
      }
      const path = upFlagMap.get(duration);
      if (path) {
        drawBravuraPath(ctx, stemCenter - lineWidth / 2 + UNIT * path.stemUpNW.x * scale, top + UNIT * path.stemUpNW.y * scale, scale, path);
        drawnSection = calcSection(left, scale, path);
      }
    } else {
      stemCenter = left + lineWidth / 2;
      top = pitchToY(topOfStaff, pitch, scale);
      if (pitch > 12) {
        bottom = heightOfB3;
      } else {
        const index = duration < 32 ? pitch - 7 : pitch - 8;
        bottom = pitchToY(topOfStaff, index, scale);
      }
      const path = downFlagMap.get(duration);
      if (path) {
        drawBravuraPath(ctx, stemCenter - lineWidth / 2 + UNIT * path.stemDownSW.x * scale, bottom + UNIT * path.stemDownSW.y * scale, scale, path);
        drawnSection = calcSection(left, scale, path);
      }
    }
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(stemCenter, top);
    ctx.lineTo(stemCenter, bottom);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    if (drawnSection) {
      return drawnSection;
    } else {
      return {start: left, end: left + lineWidth};
    }
  };
  var drawAccidental = (params) => {
    const {ctx, left, topOfStaff, note, scale} = params;
    const {pitch, accidental} = note;
    if (!accidental) {
      return;
    }
    const top = pitchToY(topOfStaff, pitch, scale);
    const path = accidentalPathMap.get(accidental);
    drawBravuraPath(ctx, left, top, scale, path);
    return calcSection(left, scale, path);
  };
  var gapWithAccidental = (scale) => {
    return UNIT / 4 * scale;
  };
  var drawNote = (params) => {
    const {scale, left} = params;
    const arr = [];
    arr.push(drawAccidental(params));
    let leftOfLedgerLine = left;
    if (arr[0]?.end) {
      leftOfLedgerLine = arr[0]?.end + gapWithAccidental(scale);
    }
    arr.push(drawLedgerLines({...params, left: leftOfLedgerLine}));
    let leftOfNoteHead = left;
    if (arr[1]?.start) {
      leftOfNoteHead = arr[1].start + ledgerLineExtension(scale);
    } else if (arr[0]?.end) {
      leftOfNoteHead = arr[0]?.end + gapWithAccidental(scale) * 2;
    }
    arr.push(drawNoteHead({...params, left: leftOfNoteHead}));
    arr.push(drawStemAndFlags({...params, left: leftOfNoteHead}));
    const start = Math.min(...arr.map((section) => section?.start ?? params.left));
    const end = Math.max(...arr.map((section) => section?.end ?? params.left));
    return {start, end};
  };
  var drawRest = (ctx, topOfStaff, leftOfRest, rest, scale) => {
    const path = restPathMap.get(rest.duration);
    drawBravuraPath(ctx, leftOfRest, topOfStaff + UNIT * path.top * scale, scale, path);
    return calcSection(leftOfRest, scale, path);
  };
  window.onload = () => {
    const ctx = initCanvas().getContext("2d");
    if (ctx == null)
      return;
    const scale = 0.08;
    const staffPaddingLeft = 20;
    const topOfStaff = 2e3 * scale;
    const leftOfStaff = staffPaddingLeft;
    const elementGap = UNIT * 2 * scale;
    const elements = [
      {type: "note", pitch: 10, duration: 1},
      {type: "note", pitch: 7, duration: 4, accidental: "sharp"},
      {type: "note", pitch: -1, duration: 8, accidental: "flat"},
      {type: "note", pitch: 13, duration: 4},
      {type: "note", pitch: 0, duration: 4},
      {type: "note", pitch: 1, duration: 4, accidental: "natural"},
      {type: "note", pitch: -2, duration: 4},
      {type: "note", pitch: 14, duration: 16, accidental: "sharp"},
      {type: "note", pitch: -6, duration: 32},
      {type: "note", pitch: 20, duration: 4},
      {type: "rest", duration: 1},
      {type: "rest", duration: 2},
      {type: "rest", duration: 4},
      {type: "rest", duration: 8},
      {type: "rest", duration: 16},
      {type: "rest", duration: 32},
      {type: "rest", duration: 32},
      {type: "rest", duration: 32}
    ];
    drawStaff(ctx, leftOfStaff, topOfStaff, window.innerWidth - staffPaddingLeft * 2, scale);
    let cursor = staffPaddingLeft + elementGap;
    cursor = drawGClef(ctx, cursor, topOfStaff, scale).end;
    for (let i in elements) {
      const el = elements[i];
      const left = cursor + elementGap;
      if (el.type === "note") {
        cursor = drawNote({
          ctx,
          topOfStaff,
          left,
          note: el,
          scale
        }).end;
      } else {
        cursor = drawRest(ctx, topOfStaff, left, el, scale).end;
      }
    }
  };
})();
