import { FRAME_HEIGHT, FRAME_WIDTH } from './calibration';
import type { CalibrationProfile, Checkpoint, Signature, TestSummary } from './types';

export const SIGNATURE_LENGTH = (FRAME_WIDTH - 2) * (FRAME_HEIGHT - 2);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isFiniteNumber(value: unknown, minimum?: number, maximum?: number): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && (minimum === undefined || value >= minimum)
    && (maximum === undefined || value <= maximum);
}

function isSignature(value: unknown): value is Signature {
  return Array.isArray(value)
    && value.length === SIGNATURE_LENGTH
    && value.every((entry) => isFiniteNumber(entry));
}

function isCheckpoint(value: unknown): value is Checkpoint {
  if (!isRecord(value)) return false;
  return isNonEmptyString(value.id, 128)
    && isNonEmptyString(value.name, 32)
    && Array.isArray(value.examples)
    && value.examples.length === 10
    && value.examples.every(isSignature)
    && isSignature(value.centroid)
    && isFiniteNumber(value.threshold, 0.36, 1.7);
}

function isTestSummary(value: unknown): value is TestSummary {
  if (!isRecord(value)) return false;
  return isDateString(value.startedAt)
    && isFiniteNumber(value.durationSeconds, 1, 86_400)
    && Number.isInteger(value.triggers)
    && isFiniteNumber(value.triggers, 0)
    && (typeof value.userReportedFalseTrigger === 'boolean' || value.userReportedFalseTrigger === null)
    && isFiniteNumber(value.peakConfidence, 0, 1);
}

/**
 * Accept only complete profiles that this version can safely replay. Imports
 * are untrusted user files, so shape checks happen before IndexedDB is touched.
 */
export function isValidProfile(value: unknown): value is CalibrationProfile {
  if (!isRecord(value) || value.schema !== 'movemap-profile/v1') return false;
  if (!isNonEmptyString(value.id, 128) || !isNonEmptyString(value.name, 48)) return false;
  if (!isDateString(value.createdAt) || !isDateString(value.updatedAt)) return false;
  if (!isRecord(value.frame)
    || value.frame.width !== FRAME_WIDTH
    || value.frame.height !== FRAME_HEIGHT
    || value.frame.feature !== 'sobel-edge-24x18') return false;
  if (!isRecord(value.settings)
    || !isFiniteNumber(value.settings.holdMs, 1, 60_000)
    || !isFiniteNumber(value.settings.releaseThreshold, 0, 1)) return false;
  if (!Array.isArray(value.checkpoints)
    || value.checkpoints.length < 1
    || value.checkpoints.length > 3
    || !value.checkpoints.every(isCheckpoint)) return false;
  return value.lastTest === undefined || isTestSummary(value.lastTest);
}
