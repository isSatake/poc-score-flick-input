const initCanvas = (): HTMLCanvasElement => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  return canvas
}

const drawStaffLines = (ctx: CanvasRenderingContext2D) => {
  const HEIGHT_HEAD = 25
  const LEFT_STAFF = 0
  const TOP_STAFF = 0
  const WIDTH_LINE = 1
  const WIDTH_STAFF = 800
  for (let i = 0; i < 5; i++) {
    const y = TOP_STAFF + HEIGHT_HEAD * i
    ctx.strokeStyle = "#000"
    ctx.lineWidth = WIDTH_LINE
    ctx.beginPath()
    ctx.moveTo(LEFT_STAFF, y)
    ctx.lineTo(LEFT_STAFF + WIDTH_STAFF, y)
    ctx.closePath()
    ctx.stroke()
  }
}

const drawGClef = (ctx: CanvasRenderingContext2D) => {
  const GCLEF_PATH = "M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z"
  const path2d = new Path2D(GCLEF_PATH)
  ctx.rotate((Math.PI / 180) * 180) // もとのパスは回転している
  ctx.translate(0, -1 * 25 * 3) // 原点を五線上のGの高さに移動(回転しているため負の値)
  ctx.scale(-0.1, 0.1) // もとのパスは五線の高さを1000としているのでスケールする
  ctx.fill(path2d)
}

window.onload = () => {
  const canvasCtx = initCanvas().getContext("2d")
  if (canvasCtx == null) return
  drawStaffLines(canvasCtx)
  drawGClef(canvasCtx)
}