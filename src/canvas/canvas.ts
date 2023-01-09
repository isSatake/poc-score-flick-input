export const getCanvasById = (
  id: string
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } => {
  try {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    return { canvas, ctx };
  } catch (e) {
    throw new Error("canvas error");
  }
};
