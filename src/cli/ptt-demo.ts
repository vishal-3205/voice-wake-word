#!/usr/bin/env node
import { createInterface } from "node:readline";

import { createMicCapture } from "@voice/mic-capture";

import { attachPushToTalkListener } from "../listener.js";
import { createPushToTalkWakeEngine } from "../ptt-engine.js";

interface CliOptions {
  keyword: string;
  debounceMs: number;
  deviceIndex: number;
  mockMic: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  let keyword = "push-to-talk";
  let debounceMs = 2_000;
  let deviceIndex = -1;
  let mockMic = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--keyword" && argv[i + 1] !== undefined) {
      keyword = argv[++i] ?? keyword;
    } else if (arg === "--debounce-ms" && argv[i + 1] !== undefined) {
      debounceMs = Number(argv[++i]);
    } else if (arg === "--device" && argv[i + 1] !== undefined) {
      deviceIndex = Number(argv[++i]);
    } else if (arg === "--mock-mic") {
      mockMic = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { keyword, debounceMs, deviceIndex, mockMic };
}

function printHelp(): void {
  console.log(`wake-word-ptt-demo — push-to-talk wake (no Picovoice / no wake-word model)

Usage:
  wake-word-ptt-demo [options]

Options:
  --keyword <name>       Label for wake events (default: push-to-talk)
  --debounce-ms <ms>     Ignore rapid retriggers (default: 2000)
  --device <index>       Mic device index, -1 = default
  --mock-mic             Synthetic mic frames (CI / no hardware)
  -h, --help             Show this help

Controls:
  Press Enter  →  "Wake detected!" (start listening in a full app)
  Ctrl+C       →  Quit

Example:
  npx wake-word-ptt-demo
  npx wake-word-ptt-demo --mock-mic
`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!Number.isFinite(options.debounceMs) || options.debounceMs < 0) {
    console.error("Invalid --debounce-ms value");
    process.exit(1);
  }

  if (!Number.isFinite(options.deviceIndex)) {
    console.error("Invalid --device value");
    process.exit(1);
  }

  const mic = createMicCapture({
    backend: options.mockMic ? "mock" : "pvrecorder",
    deviceIndex: options.deviceIndex,
  });

  const engine = createPushToTalkWakeEngine({ keyword: options.keyword });

  let wakeCount = 0;

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function promptUser(): void {
    rl.question("Press Enter to listen… ", () => {
      const hit = listener.trigger();
      if (hit === null) {
        console.log("(Ignored — within debounce window.)\n");
        promptUser();
      }
    });
  }

  const listener = attachPushToTalkListener({
    mic,
    engine,
    debounceMs: options.debounceMs,
    onWake: (hit) => {
      wakeCount += 1;
      console.log("Wake detected!");
      console.log(
        `  keyword="${hit.keyword}" index=${String(hit.keywordIndex)} t=${String(hit.timestampMs)}`,
      );
      console.log("  (In a full app: start utterance recording / show mascot now.)\n");
      promptUser();
    },
    onError: (error) => {
      console.error(`Mic error: ${error.message}`);
    },
  });

  const shutdown = async (): Promise<void> => {
    rl.close();
    await listener.stop();
    listener.dispose();
    console.log(`\nStopped. Manual wakes: ${String(wakeCount)}`);
  };

  process.on("SIGINT", () => {
    void shutdown().finally(() => {
      process.exit(0);
    });
  });

  console.log("Push-to-talk demo (Option A — no wake-word model).");
  console.log(`Keyword label: "${options.keyword}" | mic: ${options.mockMic ? "mock" : "live"}`);
  console.log("Mic is on; press Enter when you want to speak.\n");

  await listener.start();
  promptUser();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
