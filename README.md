# @voice/wake-word

Wake-word engine **interface**, **mock**, and **push-to-talk** implementations for the desktop voice assistant platform.

No wake-word model or vendor keys required for POC — use `PushToTalkWakeEngine` and wire `trigger()` to a hotkey or tray action. Native adapters (e.g. `@voice/wake-word-porcupine`) are optional.

## Install

```bash
npm install @voice/wake-word @voice/core-types
# For mic + PTT demo / attachPushToTalkListener:
npm install @voice/mic-capture
```

## Push-to-talk (Option A — recommended for POC)

No Picovoice AccessKey. The mic stays on; you start a “session” when the user presses a key or hotkey.

```typescript
import { createMicCapture } from "@voice/mic-capture";
import {
  attachPushToTalkListener,
  createPushToTalkWakeEngine,
} from "@voice/wake-word";

const mic = createMicCapture();
const engine = createPushToTalkWakeEngine({ keyword: "listen" });

const ptt = attachPushToTalkListener({
  mic,
  engine,
  debounceMs: 2000,
  onWake: (hit) => {
    // → start voice-session / show mascot / begin utterance capture
    console.log("Listen now:", hit.keyword);
  },
});

await ptt.start();

// From Electron globalShortcut, tray click, etc.:
ptt.trigger();
```

`process(frame)` on the PTT engine always returns `null` (audio is ignored).

## Mock engine (automated tests)

```typescript
import { createAudioFrame } from "@voice/core-types";
import { createMockWakeWordEngine } from "@voice/wake-word";

const engine = createMockWakeWordEngine({
  triggerAfterFrames: 5,
  keyword: "jarvis",
});

const hit = engine.process(createAudioFrame(new Int16Array(512), Date.now()));
```

## Implementing a real wake-word adapter

```typescript
import type { AudioFrame, WakeHit } from "@voice/core-types";
import type { IWakeWordEngine, WakeWordEngineOptions } from "@voice/wake-word";

export class SherpaWakeWordEngine implements IWakeWordEngine {
  process(_frame: AudioFrame): WakeHit | null {
    return null;
  }
  dispose(): void {}
}
```

## CLI demos

After `npm run build`:

```bash
# Push-to-talk (Press Enter) — default demo, mock mic in CI
npx wake-word-ptt-demo --mock-mic

# Live microphone + Enter to listen
npx wake-word-ptt-demo

# Synthetic frame-based mock wake (no PTT)
npx wake-word-mock-demo --frames 30 --trigger-after 8
```

## API

| Export | Description |
|--------|-------------|
| `IWakeWordEngine` | `process(frame)` → `WakeHit \| null`, `dispose()` |
| `ITriggerableWakeWordEngine` | Adds `trigger()` for manual wake |
| `PushToTalkWakeEngine` | Ignores audio; wake on `trigger()` |
| `attachPushToTalkListener` | Mic + debounced `trigger()` → `onWake` |
| `isTriggerableWakeWordEngine` | Type guard |
| `MockWakeWordEngine` | Deterministic test double |
| `WakeWordEngineOptions` | Shared config shape for adapters |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run demo
```

Requires `@voice/core-types@^0.1.0` and optionally `@voice/mic-capture@^0.1.0`.

## License

MIT
