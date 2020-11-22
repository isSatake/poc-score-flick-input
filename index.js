"use strict";
const initCanvas = () => {
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.onload = (e) => {
    initCanvas();
};
