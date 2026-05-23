# Changelog

## 0.1.1

- **Option A (POC):** `PushToTalkWakeEngine` + `ITriggerableWakeWordEngine` — manual wake, no Picovoice
- `attachPushToTalkListener` — mic stays on; call `trigger()` from hotkey or CLI
- `wake-word-ptt-demo` CLI (Press Enter to listen)

## 0.1.0

- `IWakeWordEngine` contract aligned with `@voice/core-types` `AudioFrame` / `WakeHit`
- `WakeWordEngineOptions` and `WakeWordEngineFactory` types
- `MockWakeWordEngine` for tests and `wake-word-mock-demo` CLI
