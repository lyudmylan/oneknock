// The checks of the time limits, each interval.
import { expect, test } from "vitest";

import { startTimeLimitChecks } from "../src/time-limit-checks.ts";

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// intents/time-limit-knock.md, check 18
test("a check does not start while the check before it runs", async () => {
  let running = 0;
  let overlap = false;
  let calls = 0;
  const stop = startTimeLimitChecks(
    10,
    async () => {
      calls += 1;
      running += 1;
      if (running > 1) {
        overlap = true;
      }
      await pause(100);
      running -= 1;
      return { sent: [], failed: [] };
    },
    () => {},
  );
  await pause(350);
  stop();
  await pause(150);
  expect(overlap).toBe(false);
  expect(calls).toBeGreaterThanOrEqual(2);
});

// intents/time-limit-knock.md, check 19
test("each failed message gives one line", async () => {
  const lines: string[] = [];
  const message = (identity: string): { level: "knock"; identity: string; startTime: string; rule: string } => ({
    level: "knock",
    identity,
    startTime: "2026-11-20T08:00:00Z",
    rule: "r",
  });
  let done = false;
  const stop = startTimeLimitChecks(
    10,
    async () => {
      if (done) {
        return { sent: [], failed: [] };
      }
      done = true;
      return { sent: [], failed: [message("event-1"), message("event-2")] };
    },
    (line) => lines.push(line),
  );
  await pause(100);
  stop();
  expect(lines).toHaveLength(2);
  expect(lines[0]).toContain("event-1");
  expect(lines[0]).toContain("2026-11-20T08:00:00Z");
  expect(lines[1]).toContain("event-2");
});

// intents/time-limit-knock.md, check 20
test("a check that throws does not end the checks", async () => {
  const lines: string[] = [];
  let calls = 0;
  const stop = startTimeLimitChecks(
    10,
    async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error("the store broke");
      }
      return { sent: [], failed: [] };
    },
    (line) => lines.push(line),
  );
  await pause(150);
  stop();
  expect(lines).toHaveLength(1);
  expect(lines[0]).toContain("the store broke");
  expect(calls).toBeGreaterThanOrEqual(2);
});

// intents/time-limit-knock.md, check 21
test("the checks end at the stop", async () => {
  let calls = 0;
  const stop = startTimeLimitChecks(
    10,
    async () => {
      calls += 1;
      return { sent: [], failed: [] };
    },
    () => {},
  );
  await pause(60);
  stop();
  await pause(20);
  const after = calls;
  await pause(100);
  expect(calls).toBe(after);
});
