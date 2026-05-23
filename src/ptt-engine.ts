import type { AudioFrame, WakeHit } from "@voice/core-types";

import type { WakeWordEngineOptions } from "./options.js";
import type {
  ITriggerableWakeWordEngine,
  PushToTalkTriggerOptions,
} from "./triggerable-engine.js";

export interface PushToTalkWakeEngineOptions extends WakeWordEngineOptions {
  /** Label on {@link WakeHit.keyword} (default: `"push-to-talk"`). */
  keyword?: string;
  /** Value for {@link WakeHit.keywordIndex} (default: 0). */
  keywordIndex?: number;
}

const DEFAULT_KEYWORD = "push-to-talk";

/**
 * Manual wake engine for POC: no microphone analysis, no vendor keys.
 * Call {@link trigger} from a hotkey, tray action, or CLI keypress.
 */
export class PushToTalkWakeEngine
  implements ITriggerableWakeWordEngine
{
  private disposed = false;

  constructor(private readonly options: PushToTalkWakeEngineOptions = {}) {}

  /**
   * Audio frames are ignored — always returns `null`.
   * Mic capture can stay on for utterance recording after {@link trigger}.
   */
  process(_frame: AudioFrame): WakeHit | null {
    if (this.disposed) {
      throw new Error("PushToTalkWakeEngine: already disposed");
    }
    return null;
  }

  trigger(triggerOptions: PushToTalkTriggerOptions = {}): WakeHit {
    if (this.disposed) {
      throw new Error("PushToTalkWakeEngine: already disposed");
    }

    const keyword =
      triggerOptions.keyword ??
      this.options.keyword ??
      this.options.keywords?.[0] ??
      DEFAULT_KEYWORD;

    const hit: WakeHit = {
      keyword,
      keywordIndex: this.options.keywordIndex ?? 0,
      timestampMs: triggerOptions.timestampMs ?? Date.now(),
      ...(this.options.sensitivity !== undefined && {
        sensitivity: this.options.sensitivity,
      }),
    };

    return hit;
  }

  dispose(): void {
    this.disposed = true;
  }
}

/** Convenience factory for {@link PushToTalkWakeEngine}. */
export function createPushToTalkWakeEngine(
  options?: PushToTalkWakeEngineOptions,
): PushToTalkWakeEngine {
  return new PushToTalkWakeEngine(options);
}
