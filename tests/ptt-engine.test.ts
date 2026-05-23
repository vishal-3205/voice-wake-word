import { createAudioFrame } from "@voice/core-types";
import { describe, expect, it } from "vitest";

import {
  PushToTalkWakeEngine,
  createPushToTalkWakeEngine,
  isTriggerableWakeWordEngine,
} from "../src/index.js";

describe("PushToTalkWakeEngine", () => {
  it("ignores audio in process()", () => {
    const engine = createPushToTalkWakeEngine({ keyword: "listen" });
    const frame = createAudioFrame(new Int16Array(512), 1000);

    expect(engine.process(frame)).toBeNull();
    expect(engine.process(frame)).toBeNull();

    engine.dispose();
  });

  it("returns WakeHit from trigger()", () => {
    const engine = new PushToTalkWakeEngine({
      keyword: "hotkey",
      keywordIndex: 1,
      sensitivity: "low",
    });

    const hit = engine.trigger({ timestampMs: 42 });

    expect(hit).toEqual({
      keyword: "hotkey",
      keywordIndex: 1,
      timestampMs: 42,
      sensitivity: "low",
    });

    engine.dispose();
  });

  it("throws after dispose", () => {
    const engine = createPushToTalkWakeEngine();
    engine.dispose();

    expect(() => engine.trigger()).toThrow(/disposed/);
    expect(() => engine.process(createAudioFrame(new Int16Array(8)))).toThrow(
      /disposed/,
    );
  });
});

describe("isTriggerableWakeWordEngine", () => {
  it("detects PTT engines", () => {
    const engine = createPushToTalkWakeEngine();
    expect(isTriggerableWakeWordEngine(engine)).toBe(true);
    engine.dispose();
  });
});
