import { createMockMicCapture } from "@voice/mic-capture";
import { describe, expect, it, vi } from "vitest";

import { attachPushToTalkListener } from "../src/listener.js";
import { createPushToTalkWakeEngine } from "../src/ptt-engine.js";

describe("attachPushToTalkListener", () => {
  it("invokes onWake when trigger() is called", async () => {
    const mic = createMockMicCapture({ frameIntervalMs: 5 });
    const engine = createPushToTalkWakeEngine({ keyword: "ptt" });
    const onWake = vi.fn();

    const listener = attachPushToTalkListener({
      mic,
      engine,
      debounceMs: 0,
      onWake,
    });

    await listener.start();
    const hit = listener.trigger();

    expect(hit).not.toBeNull();
    expect(onWake).toHaveBeenCalledTimes(1);
    expect(onWake.mock.calls[0]?.[0]?.keyword).toBe("ptt");

    listener.dispose();
  });

  it("debounces rapid triggers", async () => {
    const mic = createMockMicCapture({ frameIntervalMs: 5 });
    const engine = createPushToTalkWakeEngine();
    const onWake = vi.fn();

    const listener = attachPushToTalkListener({
      mic,
      engine,
      debounceMs: 60_000,
      onWake,
    });

    await listener.start();
    expect(listener.trigger()).not.toBeNull();
    expect(listener.trigger()).toBeNull();
    expect(onWake).toHaveBeenCalledTimes(1);

    listener.dispose();
  });
});
