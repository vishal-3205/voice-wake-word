#!/usr/bin/env node
import { AUDIO_FRAME_LENGTH } from "@voice/core-types";

import {
  createMockWakeWordEngine,
  createSyntheticFrame,
} from "../mock-engine.js";

function parseArgs(argv: string[]): {
  frames: number;
  triggerAfter: number;
  keyword: string;
} {
  let frames = 20;
  let triggerAfter = 5;
  let keyword = "demo";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--frames" && argv[i + 1] !== undefined) {
      frames = Number(argv[++i]);
    } else if (arg === "--trigger-after" && argv[i + 1] !== undefined) {
      triggerAfter = Number(argv[++i]);
    } else if (arg === "--keyword" && argv[i + 1] !== undefined) {
      keyword = argv[++i] ?? keyword;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { frames, triggerAfter, keyword };
}

function printHelp(): void {
  console.log(`wake-word-mock-demo — exercise @voice/wake-word without a microphone

Usage:
  wake-word-mock-demo [options]

Options:
  --frames <n>           Synthetic frames to process (default: 20)
  --trigger-after <n>    Frames before mock wake fires (default: 5)
  --keyword <name>       Keyword label in WakeHit (default: demo)
  -h, --help             Show this help

Example:
  npx wake-word-mock-demo --frames 30 --trigger-after 8 --keyword jarvis
`);
}

const { frames, triggerAfter, keyword } = parseArgs(process.argv.slice(2));

if (!Number.isFinite(frames) || frames < 1) {
  console.error("Invalid --frames value");
  process.exit(1);
}

if (!Number.isFinite(triggerAfter) || triggerAfter < 1) {
  console.error("Invalid --trigger-after value");
  process.exit(1);
}

const engine = createMockWakeWordEngine({
  triggerAfterFrames: triggerAfter,
  keyword,
  repeat: true,
});

console.log(
  `Processing ${String(frames)} synthetic frames (${String(AUDIO_FRAME_LENGTH)} samples each)...`,
);
console.log(`Mock wake configured: keyword="${keyword}", triggerAfter=${String(triggerAfter)}`);

let hitCount = 0;
const baseTime = Date.now();

for (let i = 0; i < frames; i += 1) {
  const frame = createSyntheticFrame(i, baseTime + i * 32);
  const hit = engine.process(frame);
  if (hit !== null) {
    hitCount += 1;
    console.log(
      `[wake #${String(hitCount)}] keyword="${hit.keyword}" index=${String(hit.keywordIndex)} t=${String(hit.timestampMs)}`,
    );
  }
}

engine.dispose();
console.log(`Done. Wake hits: ${String(hitCount)}`);
