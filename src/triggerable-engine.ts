import type { WakeHit } from "@voice/core-types";

import type { IWakeWordEngine } from "./engine.js";

/** Options passed to {@link ITriggerableWakeWordEngine.trigger}. */
export interface PushToTalkTriggerOptions {
  /** Label reported on {@link WakeHit.keyword} (overrides engine default). */
  keyword?: string;
  /** Epoch ms for the wake event (default: `Date.now()`). */
  timestampMs?: number;
}

/**
 * Wake-word engine that ignores audio and wakes on an explicit `trigger()` call.
 * Use for push-to-talk, global hotkeys, or tray "Listen" actions during POC.
 */
export interface ITriggerableWakeWordEngine extends IWakeWordEngine {
  /**
   * Signal that the user wants to start a voice session.
   * @returns The wake event to forward to session / mascot layers.
   */
  trigger(options?: PushToTalkTriggerOptions): WakeHit;
}

/** Type guard for manual / push-to-talk engines. */
export function isTriggerableWakeWordEngine(
  engine: IWakeWordEngine,
): engine is ITriggerableWakeWordEngine {
  return typeof (engine as ITriggerableWakeWordEngine).trigger === "function";
}
