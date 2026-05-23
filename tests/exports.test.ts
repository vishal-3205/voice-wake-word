import { describe, expect, it } from "vitest";

import * as wakeWord from "../src/index.js";

describe("package exports", () => {
  it("exposes engine contract and mock factory", () => {
    expect(typeof wakeWord.createMockWakeWordEngine).toBe("function");
    expect(wakeWord.MockWakeWordEngine).toBeDefined();
    expect(wakeWord.createSyntheticFrame).toBeDefined();
  });

  it("exposes push-to-talk helpers", () => {
    expect(typeof wakeWord.createPushToTalkWakeEngine).toBe("function");
    expect(typeof wakeWord.attachPushToTalkListener).toBe("function");
    expect(typeof wakeWord.isTriggerableWakeWordEngine).toBe("function");
  });
});
