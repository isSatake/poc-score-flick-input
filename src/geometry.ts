import { Path } from "./bravura";

export type Point = { x: number; y: number };
export type BBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
export const magnitude = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const scalePoint = (p: Point, scale: number): Point => {
  return { x: p.x * scale, y: p.y * scale };
};

export const offsetBBox = (bbox: BBox, offset?: Partial<Point>): BBox => {
  const x = typeof offset?.x === "number" ? offset.x : 0;
  const y = typeof offset?.y === "number" ? offset.y : 0;
  return {
    left: bbox.left + x,
    top: bbox.top + y,
    right: bbox.right + x,
    bottom: bbox.bottom + y,
  };
};

export const getPathBBox = (path: Path, unit: number): BBox => {
  // 左下原点→左上原点に変換
  return {
    left: path.bbox.sw.x * unit,
    top: -path.bbox.ne.y * unit,
    bottom: -path.bbox.sw.y * unit,
    right: path.bbox.ne.x * unit,
  };
};
