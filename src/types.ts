export type Signature = number[];

export interface Checkpoint {
  id: string;
  name: string;
  examples: Signature[];
  centroid?: Signature;
  threshold?: number;
}

export interface CalibrationProfile {
  schema: 'movemap-profile/v1';
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  frame: { width: number; height: number; feature: 'sobel-edge-24x18' };
  checkpoints: Checkpoint[];
  settings: { holdMs: number; releaseThreshold: number };
  lastTest?: TestSummary;
}

export interface TestSummary {
  startedAt: string;
  durationSeconds: number;
  triggers: number;
  userReportedFalseTrigger: boolean | null;
  peakConfidence: number;
}

export interface HistoryPoint {
  time: number;
  confidence: number;
  label: string;
  triggered: boolean;
}
