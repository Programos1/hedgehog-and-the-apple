// Shared helpers for cutting sprites out of reference sheets with a plain (non-transparent) background.

/** Median colour of the four image corners. */
export function backgroundColor(png) {
  const { width: w, height: h, data } = png;
  const samples = [];
  for (const [cx, cy] of [[4, 4], [w - 5, 4], [4, h - 5], [w - 5, h - 5]])
    for (let dy = 0; dy < 4; dy++)
      for (let dx = 0; dx < 4; dx++) {
        const i = ((cy + dy - 2) * w + (cx + dx - 2)) * 4;
        samples.push([data[i], data[i + 1], data[i + 2]]);
      }
  const med = (k) => samples.map((s) => s[k]).sort((a, b) => a - b)[samples.length >> 1];
  return [med(0), med(1), med(2)];
}

export function colorDistance(data, i, bg) {
  const dr = data[i] - bg[0], dg = data[i + 1] - bg[1], db = data[i + 2] - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** 1 = drawing, 0 = background. */
export function foregroundMask(png, bg, threshold) {
  const { width: w, height: h, data } = png;
  const mask = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) mask[p] = colorDistance(data, p * 4, bg) > threshold ? 1 : 0;
  return mask;
}
