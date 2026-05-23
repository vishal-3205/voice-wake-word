# @voice/wake-word

Wake-word engine **interface** and a **mock implementation** for the desktop voice assistant platform.

No native binaries — adapters (e.g. `@voice/wake-word-porcupine`) implement `IWakeWordEngine` in separate packages.

## Install

```bash
npm install @voice/wake-word @voice/core-types
```

## Usage

### Implementing an adapter

```typescript
import type { AudioFrame, WakeHit } from "@voice/core-types";
import type { IWakeWordEngine, WakeWordEngineOptions } from "@voice/wake-word";

export class PorcupineWakeWordEngine implements IWakeWordEngine {
  constructor(_options: WakeWordEngineOptions) {}

  process(_frame: AudioFrame): WakeHit | null {
    // delegate to @picovoice/porcupine-node
    return null;
  }

  dispose(): void {}
}
```

### Mock engine (tests / demos)

```typescript
import { createAudioFrame } from "@voice/core-types";
import { createMockWakeWordEngine } from "@voice/wake-word";

const engine = createMockWakeWordEngine({
  triggerAfterFrames: 5,
  keyword: "jarvis",
});

const frame = createAudioFrame(new Int16Array(512), Date.now());
const hit = engine.process(frame);
```

## CLI demo

After `npm run build`:

```bash
npx wake-word-mock-demo --frames 30 --trigger-after 8 --keyword jarvis
```

## API

| Export | Description |
|--------|-------------|
| `IWakeWordEngine` | `process(frame)` → `WakeHit \| null`, `dispose()` |
| `WakeWordEngineOptions` | Shared config: paths, keywords, sensitivity, access key |
| `WakeWordEngineFactory` | Factory type for adapter packages |
| `MockWakeWordEngine` | Deterministic test double |
| `createMockWakeWordEngine` | Factory for mock engine |
| `createSyntheticFrame` | Generate PCM frames for tests |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run demo
```

Requires `@voice/core-types@^0.1.0` (published) or `file:../voice-core-types` during local development.

## Publish

1. Ensure `@voice/core-types@^0.1.0` is on npm.
2. Change `dependencies["@voice/core-types"]` from `file:../...` to `^0.1.0` if needed.
3. `npm publish --access public`
