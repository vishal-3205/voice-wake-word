import type { IWakeWordEngine } from "./engine.js";
import type { WakeWordEngineOptions } from "./options.js";

/**
 * Factory signature used by adapter packages (`wake-word-porcupine`, etc.).
 */
export type WakeWordEngineFactory<
  TOptions extends WakeWordEngineOptions = WakeWordEngineOptions,
> = (options: TOptions) => IWakeWordEngine | Promise<IWakeWordEngine>;
