// The checks of the time limits, each interval. It sits outside the core.

import type { Message } from "./core/channel.ts";

/** What one check gives back. */
export interface CheckResult {
  sent: Message[];
  failed: Message[];
}

/**
 * Calls `check` each `intervalMs` milliseconds with the time of that moment. A check does not start
 * while the check before it runs. Each failed message gives one line to `writeError`; a check that
 * throws gives one line, and the checks go on. Returns the function that ends the checks.
 */
export function startTimeLimitChecks(
  intervalMs: number,
  check: (time: Date) => Promise<CheckResult>,
  writeError: (line: string) => void,
): () => void {
  let running = false;
  let stopped = false;
  const timer = setInterval(() => {
    if (running || stopped) {
      return;
    }
    running = true;
    // A throw before the promise exists is caught too.
    Promise.resolve()
      .then(() => check(new Date()))
      .then((result) => {
        for (const message of result.failed) {
          writeError(
            `the knock at the time limit failed for the event ${message.identity} with the start time ${message.startTime}`,
          );
        }
      })
      .catch((error: unknown) => {
        writeError(`the check of the time limits failed: ${error instanceof Error ? error.message : String(error)}`);
      })
      .finally(() => {
        running = false;
      });
  }, intervalMs);
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
