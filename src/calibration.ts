import type { Checkpoint, Signature } from './types';

export const FRAME_WIDTH = 24;
export const FRAME_HEIGHT = 18;

export function extractSignature(
  source: CanvasImageSource,
  canvas: HTMLCanvasElement,
): Signature {
  canvas.width = FRAME_WIDTH;
  canvas.height = FRAME_HEIGHT;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas processing is unavailable in this browser.');
  context.save();
  context.scale(-1, 1);
  context.drawImage(source, -FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT);
  context.restore();
  const pixels = context.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT).data;
  const luminance = new Float32Array(FRAME_WIDTH * FRAME_HEIGHT);

  let mean = 0;
  for (let i = 0; i < luminance.length; i += 1) {
    const offset = i * 4;
    const value = ((pixels[offset] ?? 0) * 0.2126 + (pixels[offset + 1] ?? 0) * 0.7152 + (pixels[offset + 2] ?? 0) * 0.0722) / 255;
    luminance[i] = value;
    mean += value;
  }
  mean /= luminance.length;

  const signature: number[] = [];
  for (let y = 1; y < FRAME_HEIGHT - 1; y += 1) {
    for (let x = 1; x < FRAME_WIDTH - 1; x += 1) {
      const at = (xx: number, yy: number) => luminance[yy * FRAME_WIDTH + xx] ?? mean;
      const gx = at(x + 1, y) - at(x - 1, y);
      const gy = at(x, y + 1) - at(x, y - 1);
      const edge = Math.min(1, Math.hypot(gx, gy) * 1.6);
      signature.push(Math.round(edge * 1000) / 1000);
    }
  }
  return normalize(signature);
}

export function normalize(values: Signature): Signature {
  if (!values.length) return [];
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const deviation = Math.sqrt(variance) || 1;
  return values.map((value) => Math.round(((value - mean) / deviation) * 1000) / 1000);
}

export function distance(a: Signature, b: Signature): number {
  if (a.length !== b.length || !a.length) return Number.POSITIVE_INFINITY;
  let squared = 0;
  for (let i = 0; i < a.length; i += 1) squared += ((a[i] ?? 0) - (b[i] ?? 0)) ** 2;
  return Math.sqrt(squared / a.length);
}

export function centroid(examples: Signature[]): Signature {
  if (!examples.length) return [];
  const length = examples[0]?.length ?? 0;
  return Array.from({ length }, (_, index) => {
    const value = examples.reduce((sum, example) => sum + (example[index] ?? 0), 0) / examples.length;
    return Math.round(value * 1000) / 1000;
  });
}

export function finishCheckpoint(checkpoint: Checkpoint): Checkpoint {
  const center = centroid(checkpoint.examples);
  const distances = checkpoint.examples.map((example) => distance(example, center));
  const meanDistance = distances.reduce((sum, value) => sum + value, 0) / Math.max(1, distances.length);
  const maxDistance = Math.max(...distances, meanDistance);
  return {
    ...checkpoint,
    centroid: center,
    threshold: Math.min(1.7, Math.max(0.36, maxDistance * 1.22)),
  };
}

export function confidenceFor(signature: Signature, checkpoint: Checkpoint): number {
  if (!checkpoint.centroid || !checkpoint.threshold) return 0;
  const ratio = distance(signature, checkpoint.centroid) / checkpoint.threshold;
  return Math.max(0, Math.min(1, 1.35 - ratio * 0.68));
}

export function classify(signature: Signature, checkpoints: Checkpoint[]) {
  const ranked = checkpoints
    .map((checkpoint) => ({ checkpoint, confidence: confidenceFor(signature, checkpoint) }))
    .sort((a, b) => b.confidence - a.confidence);
  const best = ranked[0];
  const second = ranked[1];
  const margin = best ? best.confidence - (second?.confidence ?? 0) : 0;
  const passes = Boolean(best && best.confidence >= 0.72 && (ranked.length === 1 || margin >= 0.06));
  return { best, ranked, margin, passes };
}
