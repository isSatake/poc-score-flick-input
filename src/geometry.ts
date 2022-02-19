export type Geometry = { x: number; y: number };

export const magnitude = (p1: Geometry, p2: Geometry): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};
