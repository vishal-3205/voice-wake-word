import { AUDIO_FRAME_LENGTH, createAudioFrame } from "@voice/core-types";
import { describe, expect, it } from "vitest";

import {
  MockWakeWordEngine,
  createMockWakeWordEngine,
  createSyntheticFrame,
} from "../src/index.js";

describe("MockWakeWordEngine", () => {
  it("returns null until trigger frame count", () => {
    const engine = new MockWakeWordEngine({ triggerAfterFrames: 3 });
    const frame = createAudioFrame(new Int16Array(AUDIO_FRAME_LENGTH), 1000);

    expect(engine.process(frame)).toBeNull();
    expect(engine.process(frame)).toBeNull();
    const hit = engine.process(frame);
    expect(hit).not.toBeNull();
    expect(hit?.keyword).toBe("mock");
    engine.dispose();
  });

  it("uses custom keyword and sensitivity", () => {
    const engine = createMockWakeWordEngine({
      triggerAfterFrames: 1,
      keyword: "jarvis",
      keywordIndex: 2,
      sensitivity: "high",
      repeat: false,
    });

    const hit = engine.process(
      createSyntheticFrame(0, 1_700_000_000_000),
    );
    expect(hit).toEqual({
      keyword: "jarvis",
      keywordIndex: 2,
      timestampMs: 1_700_000_000_000,
      sensitivity: "high",
    });
    expect(engine.process(createSyntheticFrame(1))).toBeNull();
    engine.dispose();
  });

  it("throws after dispose", () => {
    const engine = createMockWakeWordEngine({ triggerAfterFrames: 1 });
    engine.dispose();
    expect(() =>
      engine.process(createSyntheticFrame(0)),
    ).toThrow(/disposed/);
  });

  it("repeats hits when repeat is true", () => {
    const engine = new MockWakeWordEngine({
      triggerAfterFrames: 2,
      repeat: true,
    });
    const frame = createSyntheticFrame(0);

    expect(engine.process(frame)).toBeNull();
    expect(engine.process(frame)).not.toBeNull();
    expect(engine.process(frame)).toBeNull();
    expect(engine.process(frame)).not.toBeNull();
    engine.dispose();
  });
});

describe("createSyntheticFrame", () => {
  it("produces valid-length PCM", () => {
    const frame = createSyntheticFrame(42, 1234);
    expect(frame.samples.length).toBe(AUDIO_FRAME_LENGTH);
    expect(frame.sampleRate).toBe(16_000);
    expect(frame.timestampMs).toBe(1234);
  });
});
