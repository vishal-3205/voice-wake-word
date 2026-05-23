import type { AudioFrame, WakeHit } from "@voice/core-types";
import type { IMicCapture } from "@voice/mic-capture";

import type { ITriggerableWakeWordEngine } from "./triggerable-engine.js";

const DEFAULT_DEBOUNCE_MS = 2_000;

export interface PushToTalkListenerOptions {
  /**
   * Microphone stream (stays on while idle so utterance capture can start immediately).
   */
  mic: IMicCapture;
  engine: ITriggerableWakeWordEngine;
  /** Minimum time between wake callbacks (default: 2000 ms). */
  debounceMs?: number;
  onWake: (hit: WakeHit) => void;
  onError?: (error: Error) => void;
}

export interface PushToTalkListenerHandle {
  start(): Promise<void>;
  stop(): Promise<void>;
  /** Fire a manual wake (e.g. from a global hotkey). */
  trigger(): WakeHit | null;
  dispose(): void;
}

/**
 * Keep mic capture running and invoke `onWake` when {@link PushToTalkListenerHandle.trigger}
 * is called. Audio is not analyzed for wake phrases.
 */
export function attachPushToTalkListener(
  options: PushToTalkListenerOptions,
): PushToTalkListenerHandle {
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  let lastWakeMs = 0;
  let started = false;

  const onFrame = (frame: AudioFrame): void => {
    options.engine.process(frame);
  };

  const onError = (error: Error): void => {
    options.onError?.(error);
  };

  options.mic.on("frame", onFrame);
  options.mic.on("error", onError);

  return {
    async start() {
      if (started) return;
      started = true;
      await options.mic.start();
    },

    async stop() {
      if (!started) return;
      started = false;
      await options.mic.stop();
    },

    trigger() {
      const now = Date.now();
      if (now - lastWakeMs < debounceMs) {
        return null;
      }

      const hit = options.engine.trigger({ timestampMs: now });
      lastWakeMs = now;
      options.onWake(hit);
      return hit;
    },

    dispose() {
      options.mic.off("frame", onFrame);
      options.mic.off("error", onError);
      void options.mic.stop().catch(() => undefined);
      options.mic.dispose();
      options.engine.dispose();
    },
  };
}
