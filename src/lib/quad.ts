type Pt = readonly [number, number];

/**
 * CSS `matrix3d` mapping a w×h box (origin top-left, transform-origin 0 0) onto a screen quad [top-left, top-right, bottom-right,
 * bottom-left]: the projective square-to-quad map (Heckbert), rescaled to the box. Null when the quad is degenerate or folds.
 */
export function quadToCss(w: number, h: number, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: readonly Pt[]): string | null {
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const det = dx1 * dy2 - dx2 * dy1;
  if (!det || !(w > 0 && h > 0)) return null;
  const g = (sx * dy2 - dx2 * sy) / det, k = (dx1 * sy - sx * dy1) / det;
  // the homogeneous w at every corner must stay positive, or the box folds through infinity
  if (!(1 + g > 0 && 1 + k > 0 && 1 + g + k > 0)) return null;
  const m = [
    (x1 - x0 + g * x1) / w, (y1 - y0 + g * y1) / w, 0, g / w,
    (x3 - x0 + k * x3) / h, (y3 - y0 + k * y3) / h, 0, k / h,
    0, 0, 1, 0,
    x0, y0, 0, 1,
  ];
  return m.every(Number.isFinite) ? `matrix3d(${m.join(",")})` : null;
}
