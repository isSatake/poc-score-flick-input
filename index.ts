/**
 * SMuFL, Bravura固有の情報
 */
const HEIGHT_STAFF_BRAVURA = 1000 // bravuraのunits-per-em
const WIDTH_STAFF_LINE = 32.5 // 1000 / 4 * 0.13
const WIDTH_STAFF_LEDGER_LINE = 40 // 1000 / 4 * 0.16
const WIDTH_STEM = 30 // 1000 / 4 * 0.12
const WIDTH_NOTE_HEAD = 295 // 1000 / 4 * 1.18
const EXTENSION_LEDGER_LINE = 0.4
const PATH2D_GCLEF = new Path2D(
    "M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z"
)
const PATH2D_NOTE_HEAD_WHOLE = new Path2D(
    "M216 125c93 0 206 -52 206 -123c0 -70 -52 -127 -216 -127c-149 0 -206 60 -206 127c0 68 83 123 216 123zM111 63c-2 -8 -3 -16 -3 -24c0 -32 15 -66 35 -89c21 -28 58 -52 94 -52c10 0 21 1 31 4c33 8 46 36 46 67c0 60 -55 134 -124 134c-31 0 -68 -5 -79 -40z"
)
const PATH2D_NOTE_HEAD_HALF = new Path2D(
    "M97 -125c-55 0 -97 30 -97 83c0 52 47 167 196 167c58 0 99 -32 99 -83c0 -33 -33 -167 -198 -167zM75 -87c48 0 189 88 189 131c0 7 -3 13 -6 19c-7 12 -18 21 -37 21c-47 0 -192 -79 -192 -128c0 -7 3 -14 6 -20c7 -12 19 -23 40 -23z"
)
const PATH2D_NOTE_HEAD = new Path2D(
    "M0 -42c0 86 88 167 198 167c57 0 97 -32 97 -83c0 -85 -109 -167 -198 -167c-54 0 -97 31 -97 83z"
)
const PATH2D_FLAG_8_UP = new Path2D(
    "M238 -790c-5 -17 -22 -23 -28 -19s-16 13 -16 29c0 4 1 9 3 15c17 45 24 92 24 137c0 59 -9 116 -24 150c-36 85 -131 221 -197 233v239c0 12 8 15 19 15c10 0 18 -6 21 -22c16 -96 58 -182 109 -261c63 -100 115 -218 115 -343c0 -78 -26 -173 -26 -173z"
)
const PATH2D_FLAG_8_DOWN = new Path2D(
    "M240 760c-10 29 7 48 22 48c7 0 13 -4 16 -15c8 -32 28 -103 28 -181c0 -125 -61 -244 -124 -343c-51 -79 -125 -166 -142 -261c-2 -16 -15 -22 -24 -22c-8 0 -16 5 -16 15v235c134 45 184 126 221 210c15 34 40 118 40 177c0 45 -7 95 -21 137z"
)
const PATH2D_FLAG_16_UP = new Path2D(
    "M272 -796c-6 -13 -13 -17 -20 -17c-14 0 -22 13 -22 26c0 3 0 5 1 9c5 30 8 60 8 89c0 52 -9 101 -32 149c-69 140 -140 142 -202 144h-5v388c0 7 11 10 17 10s18 -2 20 -13c17 -106 73 -122 127 -180c72 -78 98 -106 108 -174c2 -12 3 -23 3 -36 c0 -61 -22 -121 -25 -127c-1 -3 -1 -5 -1 -7c0 -4 1 -6 1 -9c18 -37 29 -78 29 -120v-22c0 -48 -3 -105 -7 -110zM209 -459c2 -3 4 -4 7 -4c5 0 12 3 13 6c5 8 5 18 7 26c1 7 1 13 1 20c0 32 -9 63 -27 89c-33 49 -87 105 -148 105h-8c-8 0 -14 -6 -14 -10c0 -1 0 -2 1 -3 c21 -82 67 -106 114 -160c21 -24 38 -44 54 -69z"
)
const PATH2D_FLAG_16_DOWN = new Path2D(
    "M240 786c-3 17 5 25 17 26c12 0 19 1 24 -22c16 -80 15 -178 -21 -253c0 -3 -1 -5 -1 -9c0 -3 0 -5 1 -7c3 -6 25 -66 25 -127c0 -13 -1 -25 -3 -36c-24 -157 -221 -200 -245 -354c-2 -11 -13 -13 -20 -13c-10 0 -17 5 -17 10v387h5c62 2 143 5 212 145 c38 78 38 169 23 253zM226 456c-3 0 -5 -1 -7 -4c-16 -26 -33 -46 -54 -69c-47 -55 -103 -78 -124 -160c-1 -1 -1 -2 -1 -3c0 -5 6 -10 14 -10h8c61 0 125 56 158 105c18 26 27 56 27 89c0 6 0 13 -1 20c-2 8 -2 18 -7 25c-1 4 -8 7 -13 7z"
)
const PATH2D_FLAG_32_UP = new Path2D(
    "M260 -673c0 -9 1 -18 1 -28c0 -43 -4 -89 -7 -95c-7 -11 -14 -16 -20 -16c-2 0 -4 1 -6 2c-7 3 -13 12 -13 24c0 2 1 4 1 7c5 29 8 57 8 85c0 48 -9 93 -31 137c-64 130 -130 132 -188 134h-5v560c0 7 8 12 14 12c10 0 17 -10 18 -19c17 -100 71 -116 121 -170 c67 -73 90 -100 101 -161c2 -9 2 -18 2 -28c0 -39 -11 -80 -20 -106c14 -29 21 -61 21 -93c0 -57 -21 -112 -23 -119c-1 -2 -1 -4 -1 -6c0 -3 0 -5 1 -7c15 -36 24 -74 26 -113zM208 -181c-55 93 -114 117 -169 117c16 -97 65 -114 114 -168c23 -25 41 -44 55 -62 c5 17 10 34 12 44c1 7 3 13 3 21c0 13 -4 28 -15 48zM219 -456c1 8 2 16 2 24c0 81 -90 177 -170 177c-9 0 -14 -9 -12 -16c22 -73 63 -95 106 -146l5 -5c17 -20 31 -37 46 -59c1 -3 4 -4 7 -4c5 0 10 3 11 6c3 7 3 15 5 23z"
)
const PATH2D_FLAG_32_DOWN = new Path2D(
    "M273 676v-11c-4 -64 -9 -75 -22 -100l-4 -7c-2 -3 -3 -5 -3 -9l3 -5v-2c4 -10 20 -53 20 -105c0 -34 -7 -72 -23 -101c9 -27 22 -71 22 -114c0 -10 0 -20 -2 -29c-11 -64 -35 -92 -105 -168c-52 -57 -109 -73 -126 -177c-1 -9 -9 -20 -19 -20c-8 0 -14 4 -14 13v589 c61 2 125 4 201 140c23 41 31 70 31 98c0 34 -12 65 -20 110c0 3 -1 5 -1 7c0 13 7 23 14 26c2 1 4 1 6 1c35 0 42 -116 42 -136zM39 268c0 -5 4 -13 13 -13h5c81 0 173 103 173 185c0 8 -1 17 -2 25c-2 8 -2 16 -5 23c-1 3 -7 6 -12 6c-3 0 -6 -1 -8 -4 c-16 -25 -32 -44 -52 -67c-45 -53 -91 -75 -112 -155zM229 243c-3 11 -8 32 -14 51c-14 -18 -32 -38 -56 -64c-52 -57 -103 -73 -120 -177c0 -1 0 -2 2 -3c57 0 118 26 175 122c12 21 16 37 16 50c0 8 -2 14 -3 21z"
)

type Duration = 1 | 2 | 4 | 8 | 16 | 32

interface Note {
    pitch: number,
    duration: Duration
}

const noteHeadByDuration = (duration: Duration): Path2D => {
    switch (duration) {
        case 1:
            return PATH2D_NOTE_HEAD_WHOLE;
        case 2:
            return PATH2D_NOTE_HEAD_HALF;
        default:
            return PATH2D_NOTE_HEAD
    }
}

const initCanvas = (): HTMLCanvasElement => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    return canvas
}

const drawGClef = (ctx: CanvasRenderingContext2D, left: number, topOfStaff: number, scale: number) => {
    const y = topOfStaff + (HEIGHT_STAFF_BRAVURA / 4 * scale) * 3
    ctx.save()
    ctx.rotate((Math.PI / 180) * 180) // もとのパスは回転している
    ctx.translate(-left, -y) // 原点を五線上のGの高さに移動(回転しているため負の値)
    ctx.scale(-scale, scale) // もとのパスは五線の高さを1000としているのでスケールする
    ctx.fill(PATH2D_GCLEF)
    ctx.restore()
}

const drawStaff = (ctx: CanvasRenderingContext2D, left: number, top: number, width: number, scale: number) => {
    const heightHead = HEIGHT_STAFF_BRAVURA / 4 * scale
    for (let i = 0; i < 5; i++) {
        const y = top + heightHead * i
        ctx.save()
        ctx.strokeStyle = "#000"
        ctx.lineWidth = WIDTH_STAFF_LINE * scale
        ctx.beginPath()
        ctx.moveTo(left, y)
        ctx.lineTo(left + width, y)
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
    }
}

const indexToY = (topOfStaff: number, index: number, scale: number): number => {
    // ギターの音域に合わせ最低音をE2(=index:0)としている
    // y原点は符頭の中心(音程を示す高さ)
    const halfOfNoteHeadHeight = HEIGHT_STAFF_BRAVURA * scale / 8
    const e2y = topOfStaff + 1750 * scale + halfOfNoteHeadHeight // scale=1, index=0(E2)のときY=1750
    return e2y - (index * halfOfNoteHeadHeight)
}

const drawNoteHead = (ctx: CanvasRenderingContext2D, topOfStaff: number, left: number, note: Note, scale: number) => {
    const {pitch, duration} = note
    const top = indexToY(topOfStaff, pitch, scale)
    ctx.save()
    ctx.rotate((Math.PI / 180) * 180)
    ctx.translate(-left, -top)
    ctx.scale(-scale, scale)
    ctx.fill(noteHeadByDuration(duration))
    ctx.resetTransform()
    ctx.restore()
}

const drawLedgerLine = (ctx: CanvasRenderingContext2D, top: number, leftOfNoteHead: number, scale: number) => {
    const widthExtension = EXTENSION_LEDGER_LINE * WIDTH_NOTE_HEAD * scale
    const start = leftOfNoteHead - widthExtension
    const end = start + WIDTH_NOTE_HEAD * scale + (widthExtension * 2)
    ctx.save()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = WIDTH_STAFF_LEDGER_LINE * scale
    ctx.beginPath()
    ctx.moveTo(start, top)
    ctx.lineTo(end, top)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

const drawLedgerLines = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfNoteHead: number, note: Note, scale: number) => {
    const {pitch} = note
    if (pitch <= 5) { // 5=C3
        for (let i = 5; i >= pitch; i -= 2) {
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, scale)
        }
    } else if (pitch >= 17) { // 17=A4
        for (let i = 17; i < pitch + 1; i += 2) {
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, scale)
        }
    }
}

const drawStem = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfNoteHead: number, note: Note, scale: number) => {
    const { pitch, duration } = note
    if (duration === 1) {
        return
    }
    const heightOfB3 = topOfStaff + (HEIGHT_STAFF_BRAVURA * scale / 2)
    const lineWidth = WIDTH_STEM * scale
    let left: number
    let top: number
    let bottom: number
    if (pitch < 12) {
        // B3より低い -> 上向き
        // 符頭の右に符幹がはみ出るのを補正 (+1) これもscaleしたい気もする。
        left = leftOfNoteHead + WIDTH_NOTE_HEAD * scale - lineWidth + 1
        bottom = indexToY(topOfStaff, pitch, scale) - 5
        if (pitch < 5) {
            // C3より低い -> topはB3
            top = heightOfB3
        } else {
            top = indexToY(topOfStaff, pitch + 7, scale)
        }
    } else {
        // 下向き
        // 符頭の左に符幹がはみ出るのを補正 (+2) これもscaleしたい
        left = leftOfNoteHead + 2
        top = indexToY(topOfStaff, pitch, scale)
        if (pitch > 17) {
            // A4より高い -> bottomはB3
            bottom = heightOfB3
        } else {
            bottom = indexToY(topOfStaff, pitch - 7, scale)
        }
    }

    ctx.save()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(left, top)
    ctx.lineTo(left, bottom)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

const drawNote = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfNoteHead: number, note: Note, scale: number) => {
    drawNoteHead(ctx, topOfStaff, leftOfNoteHead, note, scale)
    drawLedgerLines(ctx, topOfStaff, leftOfNoteHead, note, scale)
    drawStem(ctx, topOfStaff, leftOfNoteHead, note, scale)
}

window.onload = () => {
    const canvasCtx = initCanvas().getContext("2d")
    if (canvasCtx == null) return
    const scale = 0.1
    const marginHorizontal = 20
    const topOfStaff = 500
    const leftOfNoteHead = 250
    const notes: Note[] = [
        {pitch: 0, duration: 1},
        {pitch: 2, duration: 2},
        {pitch: 12, duration: 4}
    ]
    drawStaff(canvasCtx, marginHorizontal, topOfStaff, window.innerWidth - marginHorizontal * 2, scale)
    drawGClef(canvasCtx, marginHorizontal + 30, topOfStaff, scale)
    for (let i in notes) {
        drawNote(canvasCtx, topOfStaff, leftOfNoteHead * (parseInt(i) + 1), notes[i], scale)
    }
}