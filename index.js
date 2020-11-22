"use strict";
const initCanvas = () => {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
};
const initStaffLines = (ctx) => {
    const HEIGHT_HEAD = 40;
    const LEFT_STAFF = 20;
    const TOP_STAFF = 300;
    const WIDTH_LINE = 1;
    const WIDTH_STAFF = 800;
    for (let i = 0; i < 5; i++) {
        const y = TOP_STAFF + HEIGHT_HEAD * i;
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(LEFT_STAFF, y);
        ctx.lineTo(LEFT_STAFF + WIDTH_STAFF, y);
        ctx.closePath();
        ctx.stroke();
    }
};
window.onload = () => {
    const canvasCtx = initCanvas().getContext("2d");
    if (canvasCtx == null)
        return;
    initStaffLines(canvasCtx);
};
