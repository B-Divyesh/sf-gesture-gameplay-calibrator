import { describe, expect, it } from 'vitest';
import { SIGNATURE_LENGTH, isValidProfile } from '../src/profile-validation';

function validProfile() {
  const signature = Array.from({ length: SIGNATURE_LENGTH }, (_, index) => index / 1000);
  return {
    schema: 'movemap-profile/v1',
    id: 'profile-1',
    name: 'Desk jump',
    createdAt: '2026-08-28T00:00:00.000Z',
    updatedAt: '2026-08-28T00:01:00.000Z',
    frame: { width: 24, height: 18, feature: 'sobel-edge-24x18' },
    settings: { holdMs: 450, releaseThreshold: 0.58 },
    checkpoints: [{ id: 'checkpoint-1', name: 'Hands up', examples: Array.from({ length: 10 }, () => signature), centroid: signature, threshold: 0.5 }],
  };
}

describe('MoveMap v1 profile validation', () => {
  it('accepts a complete exported profile', () => {
    expect(isValidProfile(validProfile())).toBe(true);
  });

  it('rejects the verifier reproduction and malformed checkpoint data', () => {
    expect(isValidProfile({ schema: 'movemap-profile/v1', checkpoints: [{}] })).toBe(false);

    const withNonFiniteSignature = validProfile();
    withNonFiniteSignature.checkpoints[0]!.examples[0]![0] = Number.POSITIVE_INFINITY;
    expect(isValidProfile(withNonFiniteSignature)).toBe(false);

    const withTooManyCheckpoints = validProfile();
    withTooManyCheckpoints.checkpoints = Array.from({ length: 4 }, () => validProfile().checkpoints[0]!);
    expect(isValidProfile(withTooManyCheckpoints)).toBe(false);
  });
});
