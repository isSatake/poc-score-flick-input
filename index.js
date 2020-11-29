"use strict";
/**
 * SMuFL, Bravura固有の情報
 */
const HEIGHT_STAFF_BRAVURA = 1000; // bravuraのunits-per-em
const WIDTH_STAFF_LINE = 32.5; // 1000 / 4 * 0.13
const WIDTH_STAFF_LEDGER_LINE = 40; // 1000 / 4 * 0.16
const WIDTH_STEM = 30; // 1000 / 4 * 0.12
const WIDTH_NOTE_HEAD = 295; // 1000 / 4 * 1.18
const EXTENSION_LEDGER_LINE = 0.4;
const PATH2D_GCLEF = new Path2D("M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z");
const PATH2D_NOTE_HEAD = new Path2D("M0 -42c0 86 88 167 198 167c57 0 97 -32 97 -83c0 -85 -109 -167 -198 -167c-54 0 -97 31 -97 83z");
const initCanvas = () => {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
};
const drawGClef = (ctx, left, topOfStaff, scale) => {
    const y = topOfStaff + (HEIGHT_STAFF_BRAVURA / 4 * scale) * 3;
    ctx.rotate((Math.PI / 180) * 180); // もとのパスは回転している
    ctx.translate(-left, -y); // 原点を五線上のGの高さに移動(回転しているため負の値)
    ctx.scale(-scale, scale); // もとのパスは五線の高さを1000としているのでスケールする
    ctx.fill(PATH2D_GCLEF);
    ctx.resetTransform();
};
const drawStaff = (ctx, left, top, width, scale) => {
    const heightHead = HEIGHT_STAFF_BRAVURA / 4 * scale;
    for (let i = 0; i < 5; i++) {
        const y = top + heightHead * i;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = WIDTH_STAFF_LINE * scale;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(left + width, y);
        ctx.closePath();
        ctx.stroke();
    }
};
const indexToY = (topOfStaff, index, scale) => {
    // ギターの音域に合わせ最低音をE2(=index:0)としている
    // y原点は符頭の中心(音程を示す高さ)
    const halfOfNoteHeadHeight = HEIGHT_STAFF_BRAVURA * scale / 8;
    const e2y = topOfStaff + 1750 * scale + halfOfNoteHeadHeight; // scale=1, index=0(E2)のときY=1750
    return e2y - (index * halfOfNoteHeadHeight);
};
const drawNote = (ctx, topOfStaff, left, index, scale) => {
    const top = indexToY(topOfStaff, index, scale);
    ctx.rotate((Math.PI / 180) * 180);
    ctx.translate(-left, -top);
    ctx.scale(-scale, scale);
    ctx.fill(PATH2D_NOTE_HEAD);
    ctx.resetTransform();
};
const drawLedgerLine = (ctx, top, leftOfNoteHead, scale) => {
    const widthExtension = EXTENSION_LEDGER_LINE * WIDTH_NOTE_HEAD * scale;
    const start = leftOfNoteHead - widthExtension;
    const end = start + WIDTH_NOTE_HEAD * scale + (widthExtension * 2);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = WIDTH_STAFF_LEDGER_LINE * scale;
    ctx.beginPath();
    ctx.moveTo(start, top);
    ctx.lineTo(end, top);
    ctx.closePath();
    ctx.stroke();
};
const drawLedgerLines = (ctx, topOfStaff, leftOfNoteHead, indexOfNote, scale) => {
    if (indexOfNote <= 5) { // 5=C3
        for (let i = 5; i >= indexOfNote; i -= 2) {
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, scale);
        }
    }
    else if (indexOfNote >= 17) { // 17=A4
        for (let i = 17; i < indexOfNote + 1; i += 2) {
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, scale);
        }
    }
};
window.onload = () => {
    const canvasCtx = initCanvas().getContext("2d");
    if (canvasCtx == null)
        return;
    const scale = 0.2;
    const marginHorizontal = 20;
    const topOfStaff = 500;
    const indexOfNote = 5;
    const leftOfNoteHead = 250;
    drawStaff(canvasCtx, marginHorizontal, topOfStaff, window.innerWidth - marginHorizontal * 2, scale);
    drawGClef(canvasCtx, marginHorizontal + 30, topOfStaff, scale);
    drawNote(canvasCtx, topOfStaff, leftOfNoteHead, indexOfNote, scale);
    drawLedgerLines(canvasCtx, topOfStaff, leftOfNoteHead, indexOfNote, scale);
};
