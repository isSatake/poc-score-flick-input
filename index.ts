import {
    bFlag16Down,
    bFlag16Up, bFlag32Down, bFlag32Up, bFlag8Down,
    bFlag8Up,
    EXTENSION_LEDGER_LINE, FlagDown, FlagUp,
    HEIGHT_STAFF_BRAVURA,
    PATH2D_GCLEF,
    PATH2D_NOTE_HEAD,
    PATH2D_NOTE_HEAD_HALF,
    PATH2D_NOTE_HEAD_WHOLE, UNIT,
    WIDTH_NOTE_HEAD_BLACK,
    WIDTH_NOTE_HEAD_WHOLE,
    WIDTH_STAFF_LEDGER_LINE,
    WIDTH_STAFF_LINE,
    WIDTH_STEM
} from "./bravura";

type Duration = 1 | 2 | 4 | 8 | 16 | 32

interface Note {
    pitch: number,
    duration: Duration
}

const upFlagMap = new Map<Duration, FlagUp>([
    [8, bFlag8Up],
    [16, bFlag16Up],
    [32, bFlag32Up],
])

const downFlagMap = new Map<Duration, FlagDown>([
    [8, bFlag8Down],
    [16, bFlag16Down],
    [32, bFlag32Down],
])

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

const noteHeadWidth = (duration: Duration): number => {
    if (duration === 1) {
        return WIDTH_NOTE_HEAD_WHOLE
    }
    return WIDTH_NOTE_HEAD_BLACK
}

const initCanvas = (): HTMLCanvasElement => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    return canvas
}

const drawGClef = (ctx: CanvasRenderingContext2D, left: number, topOfStaff: number, scale: number) => {
    const y = topOfStaff + (UNIT * scale) * 3
    ctx.save()
    ctx.rotate((Math.PI / 180) * 180) // もとのパスは回転している
    ctx.translate(-left, -y) // 原点を五線上のGの高さに移動(回転しているため負の値)
    ctx.scale(-scale, scale) // もとのパスは五線の高さを1000としているのでスケールする
    ctx.fill(PATH2D_GCLEF)
    ctx.restore()
}

const drawStaff = (ctx: CanvasRenderingContext2D, left: number, top: number, width: number, scale: number) => {
    const heightHead = UNIT * scale
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

const drawLedgerLine = (ctx: CanvasRenderingContext2D, top: number, leftOfNoteHead: number, note: Note, scale: number) => {
    // note headからはみ出る長さ
    const extension = noteHeadWidth(note.duration) * EXTENSION_LEDGER_LINE * scale
    const start = leftOfNoteHead - extension
    const end = start + noteHeadWidth(note.duration) * scale + (extension * 2)
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
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, note, scale)
        }
    } else if (pitch >= 17) { // 17=A4
        for (let i = 17; i < pitch + 1; i += 2) {
            drawLedgerLine(ctx, indexToY(topOfStaff, i, scale), leftOfNoteHead, note, scale)
        }
    }
}

const drawStemAndFlags = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfNoteHead: number, note: Note, scale: number) => {
    const {pitch, duration} = note
    if (duration === 1) {
        return
    }
    const heightOfB3 = topOfStaff + (HEIGHT_STAFF_BRAVURA * scale / 2)
    const lineWidth = WIDTH_STEM * scale
    let stemCenter: number
    let top: number
    let bottom: number
    if (pitch < 12) {
        // B3未満 -> 上向き (楽譜の書き方p17)
        // 符頭の右に符幹がはみ出るのを補正 (lineWidth / 2)
        stemCenter = leftOfNoteHead + WIDTH_NOTE_HEAD_BLACK * scale - lineWidth / 2
        bottom = indexToY(topOfStaff, pitch, scale) - 5
        if (pitch < 5) {
            // C3より低い -> topはB3 (楽譜の書き方p17)
            top = heightOfB3
        } else {
            // stemの長さは基本1オクターブ分 (楽譜の書き方p17)
            // 32分以降は1間ずつ長くする (楽譜の書き方p53)
            const index = duration <= 32 ? pitch + 7 : pitch + 8
            top = indexToY(topOfStaff, index, scale)
        }
        const upFlag = upFlagMap.get(duration)
        if (upFlag) {
            const {path, stemUpNW} = upFlag;
            ctx.save()
            ctx.translate(
                stemCenter - lineWidth / 2 + UNIT * stemUpNW.x * scale,
                top + UNIT * stemUpNW.y * scale
            )
            ctx.scale(scale, -scale)
            ctx.fill(path)
            ctx.restore()
        }
    } else {
        // 下向き
        stemCenter = leftOfNoteHead + lineWidth / 2
        top = indexToY(topOfStaff, pitch, scale)
        if (pitch > 17) {
            // A4より高い -> bottomはB3
            bottom = heightOfB3
        } else {
            const index = duration < 32 ? pitch - 7 : pitch - 8
            bottom = indexToY(topOfStaff, index, scale)
        }
        const downFlag = downFlagMap.get(duration)
        if (downFlag) {
            const {path, stemDownSW} = downFlag;
            ctx.save()
            ctx.translate(
                stemCenter - lineWidth / 2 + UNIT * stemDownSW.x * scale,
                bottom + UNIT * stemDownSW.y * scale
            )
            ctx.scale(scale, -scale)
            ctx.fill(path)
            ctx.restore()
        }
    }

    ctx.save()
    ctx.strokeStyle = "#000"
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(stemCenter, top)
    ctx.lineTo(stemCenter, bottom)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
}

const drawNote = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfNoteHead: number, note: Note, scale: number) => {
    drawNoteHead(ctx, topOfStaff, leftOfNoteHead, note, scale)
    drawLedgerLines(ctx, topOfStaff, leftOfNoteHead, note, scale)
    drawStemAndFlags(ctx, topOfStaff, leftOfNoteHead, note, scale)
}

window.onload = () => {
    const canvasCtx = initCanvas().getContext("2d")
    if (canvasCtx == null) return
    const scale = 0.1
    const marginHorizontal = 20
    const topOfStaff = 500
    const leftOfNoteHead = 250
    const notes: Note[] = [
        {pitch: 17, duration: 1},
        {pitch: 21, duration: 2},
        {pitch: 5, duration: 4},
        {pitch: 8, duration: 8},
        {pitch: 10, duration: 16},
        {pitch: 20, duration: 32},
        {pitch: 0, duration: 32},
        {pitch: 11, duration: 32}
    ]
    drawStaff(canvasCtx, marginHorizontal, topOfStaff, window.innerWidth - marginHorizontal * 2, scale)
    drawGClef(canvasCtx, marginHorizontal + 30, topOfStaff, scale)
    for (let i in notes) {
        drawNote(canvasCtx, topOfStaff, leftOfNoteHead * (parseInt(i) + 1), notes[i], scale)
    }
}