import type { WakeWordSensitivity } from "@voice/core-types";

/**
 * Common configuration shared by wake-word adapters.
 * Engine-specific packages may extend this shape.
 */
export interface WakeWordEngineOptions {
  /**
   * Path to a wake-word model file (e.g. Porcupine `.ppn`).
   */
  keywordPath?: string;

  /**
   * Human-readable keyword labels when multiple models are loaded.
   */
  keywords?: readonly string[];

  sensitivity?: WakeWordSensitivity;

  /**
   * Vendor access key (e.g. Picovoice AccessKey for Porcupine).
   */
  accessKey?: string;
}
