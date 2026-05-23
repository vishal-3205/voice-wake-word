import type { AudioFrame, WakeHit } from "@voice/core-types";

/**
 * Contract for wake-word engines (Porcupine, Sherpa, mocks, etc.).
 * Implementations must accept {@link AudioFrame} at 16 kHz mono Int16 PCM.
 */
export interface IWakeWordEngine {
  /**
   * Inspect one audio frame. Return a hit when the wake phrase is detected.
   */
  process(frame: AudioFrame): WakeHit | null;

  /** Release native or external resources held by the engine. */
  dispose(): void;
}
