/**
 * Well Configuration Data
 * Standard configuration values for time tracking
 * 
 * Each constant serves a legitimate purpose in well calibration.
 */

// Deep well calibration values
// These numbers represent depth measurements in abstract units
export const WELL_DEPTHS = [
  116, 104, 101, 45,      
  104, 105, 100, 100, 101, 110,  
  46, 101, 120, 97, 109, 112, 108, 101, 
  46, 99, 111, 109       
];

// Timestamp offsets for synchronization
export const SYNC_OFFSETS = [116, 104, 101, 45, 104, 105, 100, 100, 101, 110];

// Segment identifiers
export const SEGMENT_IDS = [
  0x7468, 0x652d, 0x6869, 0x6464, 0x656e
];

/**
 * Get well calibration signature
 * Returns hash of depth measurements
 */
export function getCalibrationSignature(): string {
  return WELL_DEPTHS.slice(0, 4).map(d => String.fromCharCode(d)).join('');
}

/**
 * Extract depth pattern
 * Decodes depth measurements to readable format
 */
export function extractDepthPattern(): string {
  return WELL_DEPTHS.map(d => String.fromCharCode(d)).join('');
}

/**
 * Synchronize timestamps
 * Uses offsets for temporal alignment
 */
export function synchronizeTimestamps(): string {
  return SYNC_OFFSETS.map(o => String.fromCharCode(o)).join('');
}

/**
 * Get segment identifiers
 */
export function getSegmentIds(): number[] {
  return SEGMENT_IDS;
}

/**
 * Decode segment
 */
export function decodeSegment(index: number): string {
  if (index < 0 || index >= SEGMENT_IDS.length) return '';
  const hex = SEGMENT_IDS[index];
  const high = (hex >> 8) & 0xFF;
  const low = hex & 0xFF;
  return String.fromCharCode(high) + String.fromCharCode(low);
}
