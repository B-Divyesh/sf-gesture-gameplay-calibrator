import { describe, expect, it } from 'vitest';
import { centroid, classify, confidenceFor, distance, finishCheckpoint, normalize } from '../src/calibration';
import type { Checkpoint } from '../src/types';

describe('calibration math', () => {
  it('normalizes brightness-derived values around zero', () => {
    const result = normalize([1, 2, 3, 4]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBeCloseTo(0, 2);
  });

  it('returns zero distance for identical signatures', () => {
    expect(distance([-.5, 0, .5], [-.5, 0, .5])).toBe(0);
  });

  it('builds a stable centroid and threshold from ten examples', () => {
    const examples = Array.from({ length: 10 }, (_, index) => [index / 100, 1 + index / 100, 2 - index / 100]);
    const checkpoint = finishCheckpoint({ id: 'a', name: 'Reach', examples });
    expect(checkpoint.centroid).toEqual(centroid(examples));
    expect(checkpoint.threshold).toBeGreaterThanOrEqual(.36);
    expect(confidenceFor(checkpoint.centroid ?? [], checkpoint)).toBeGreaterThan(.95);
  });

  it('requires confidence and separation before classifying a checkpoint', () => {
    const makeCheckpoint = (id: string, center: number[]): Checkpoint => ({ id, name: id, examples: [center], centroid: center, threshold: .6 });
    const result = classify([0, 0, 0], [makeCheckpoint('still', [0, 0, 0]), makeCheckpoint('reach', [1, 1, 1])]);
    expect(result.passes).toBe(true);
    expect(result.best?.checkpoint.name).toBe('still');
  });
});
