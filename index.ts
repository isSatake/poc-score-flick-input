import {
    bFlag16Down,
    bFlag16Up, bFlag32Down, bFlag32Up, bFlag8Down,
    bFlag8Up, bRest1, bRest16, bRest2, bRest32, bRest4, bRest8,
    EXTENSION_LEDGER_LINE, FlagDown, FlagUp,
    HEIGHT_STAFF_BRAVURA,
    PATH2D_GCLEF,
    PATH2D_NOTE_HEAD,
    PATH2D_NOTE_HEAD_HALF,
    PATH2D_NOTE_HEAD_WHOLE, RestPath, UNIT,
    WIDTH_NOTE_HEAD_BLACK,
    WIDTH_NOTE_HEAD_WHOLE,
    WIDTH_STAFF_LEDGER_LINE,
    WIDTH_STAFF_LINE,
    WIDTH_STEM
} from "./bravura";

type Duration = 1 | 2 | 4 | 8 | 16 | 32

type Note = {
    type: "note"
    pitch: number
    duration: Duration
}

type Rest = {
    type: "rest"
    duration: Duration
}

type Element = Note | Rest

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

const restPathMap = new Map<Duration, RestPath>([
    [1, bRest1],
    [2, bRest2],
    [4, bRest4],
    [8, bRest8],
    [16, bRest16],
    [32, bRest32]
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

const drawBravuraPath = (ctx: CanvasRenderingContext2D, left: number, top: number, scale: number, path: Path2D) => {
    ctx.save()
    ctx.rotate((Math.PI / 180) * 180) // もとのパスは回転している
    ctx.translate(-left, -top) // 回転しているため負の値
    ctx.scale(-scale, scale) // もとのパスは五線の高さを1000としているのでスケールする
    ctx.fill(path)
    ctx.restore()
}

const drawGClef = (ctx: CanvasRenderingContext2D, left: number, topOfStaff: number, scale: number) => {
    const y = topOfStaff + (UNIT * scale) * 3 // 原点を五線上のGの高さに移動
    drawBravuraPath(ctx, left, y, scale, PATH2D_GCLEF)
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
    drawBravuraPath(ctx, left, top, scale, noteHeadByDuration(duration))
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

const drawRest = (ctx: CanvasRenderingContext2D, topOfStaff: number, leftOfRest: number, rest: Rest, scale: number) => {
    const {path, top} = restPathMap.get(rest.duration)!
    drawBravuraPath(ctx, leftOfRest, topOfStaff + (UNIT * top * scale), scale, path)
}

window.onload = () => {
    const canvasCtx = initCanvas().getContext("2d")
    if (canvasCtx == null) return
    const scale = 0.08
    const marginHorizontal = 20
    const topOfStaff = 2000 * scale
    const leftOfStaff = marginHorizontal
    const leftOfClef = marginHorizontal + 500 * scale
    const elementGap = 1000 * scale
    const elements: Element[] = [
        {type: "note", pitch: 17, duration: 1},
        {type: "note", pitch: 21, duration: 2},
        {type: "note", pitch: 5, duration: 4},
        {type: "note", pitch: 8, duration: 8},
        {type: "note", pitch: 10, duration: 16},
        {type: "note", pitch: 20, duration: 32},
        {type: "note", pitch: 0, duration: 32},
        {type: "note", pitch: 11, duration: 32},
        {type: "rest", duration: 1},
        {type: "rest", duration: 2},
        {type: "rest", duration: 4},
        {type: "rest", duration: 8},
        {type: "rest", duration: 16},
        {type: "rest", duration: 32},
        {type: "rest", duration: 32},
        {type: "rest", duration: 32}
    ]
    drawStaff(canvasCtx, leftOfStaff, topOfStaff, window.innerWidth - marginHorizontal * 2, scale)
    drawGClef(canvasCtx, leftOfClef, topOfStaff, scale)
    for (let i in elements) {
        const el = elements[i]
        const left = leftOfClef + elementGap * (parseInt(i) + 1)
        if (el.type === "note") {
            drawNote(canvasCtx, topOfStaff, left, el, scale)
        } else {
            drawRest(canvasCtx, topOfStaff, left, el, scale)
        }
    }
}