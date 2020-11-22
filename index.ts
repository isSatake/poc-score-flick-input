const initCanvas = () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

window.onload = () => {
  initCanvas()
}