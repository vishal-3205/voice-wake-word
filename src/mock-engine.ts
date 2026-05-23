import {
  AUDIO_FRAME_LENGTH,
  createAudioFrame,
  type AudioFrame,
  type WakeHit,
} from "@voice/core-types";

import type { IWakeWordEngine } from "./engine.js";
import type { WakeWordEngineOptions } from "./options.js";

export interface MockWakeWordEngineOptions extends WakeWordEngineOptions {
  /**
   * Emit a wake hit after this many `process()` calls (default: 10).
   */
  triggerAfterFrames?: number;

  /** Label reported on {@link WakeHit.keyword} (default: first keyword or `"mock"`). */
  keyword?: string;

  /** Value for {@link WakeHit.keywordIndex} (default: 0). */
  keywordIndex?: number;

  /**
   * When true, reset the frame counter after each hit so the mock fires repeatedly.
   * When false, only the first hit is emitted (default: true).
   */
  repeat?: boolean;
}

const DEFAULT_TRIGGER_AFTER_FRAMES = 10;

/**
 * Test double that simulates wake-word detection without a microphone or native libs.
 */
export class MockWakeWordEngine implements IWakeWordEngine {
  private frameCount = 0;
  private hasEmitted = false;
  private disposed = false;

  constructor(private readonly options: MockWakeWordEngineOptions = {}) {}

  process(frame: AudioFrame): WakeHit | null {
    if (this.disposed) {
      throw new Error("MockWakeWordEngine: already disposed");
    }

    const repeat = this.options.repeat ?? true;
    if (!repeat && this.hasEmitted) {
      return null;
    }

    this.frameCount += 1;
    const triggerAt =
      this.options.triggerAfterFrames ?? DEFAULT_TRIGGER_AFTER_FRAMES;

    if (this.frameCount < triggerAt) {
      return null;
    }

    this.frameCount = 0;
    this.hasEmitted = true;

    const keyword =
      this.options.keyword ??
      this.options.keywords?.[0] ??
      "mock";

    const hit: WakeHit = {
      keyword,
      keywordIndex: this.options.keywordIndex ?? 0,
      timestampMs: frame.timestampMs,
      ...(this.options.sensitivity !== undefined && {
        sensitivity: this.options.sensitivity,
      }),
    };

    if (repeat) {
      this.hasEmitted = false;
    }

    return hit;
  }

  dispose(): void {
    this.disposed = true;
  }
}

/** Convenience factory for {@link MockWakeWordEngine}. */
export function createMockWakeWordEngine(
  options?: MockWakeWordEngineOptions,
): IWakeWordEngine {
  return new MockWakeWordEngine(options);
}

/**
 * Generate synthetic PCM frames for tests and CLI demos.
 */
export function createSyntheticFrame(
  index: number,
  timestampMs: number = Date.now(),
): AudioFrame {
  const samples = new Int16Array(AUDIO_FRAME_LENGTH);
  samples[0] = (index % 32767) as number;
  return createAudioFrame(samples, timestampMs);
}
