// The settings of the process.
import { expect, test } from "vitest";

import { readSettings } from "../src/settings.ts";

// intents/http-endpoint.md, check 12
test("the settings have their defaults", () => {
  expect(readSettings({ ONEKNOCK_RECORD_FILE: "messages.jsonl" })).toEqual({
    recordFile: "messages.jsonl",
    port: 8080,
    host: "127.0.0.1",
    timeLimitSeconds: 600,
  });
});

// intents/time-limit-knock.md, check 11
test("the time limit is a number of seconds from 1 to 86400", () => {
  const read = (value?: string) =>
    readSettings({ ONEKNOCK_RECORD_FILE: "a", ONEKNOCK_TIME_LIMIT_SECONDS: value }).timeLimitSeconds;
  expect(read()).toBe(600);
  expect(read("90")).toBe(90);
  expect(read("86400")).toBe(86400);
  for (const text of ["0", "86401", "1.5", "-5", "abc"]) {
    expect(() => read(text)).toThrow("ONEKNOCK_TIME_LIMIT_SECONDS");
  }
});

test("the settings read the port and the host", () => {
  const settings = readSettings({
    ONEKNOCK_RECORD_FILE: "messages.jsonl",
    ONEKNOCK_PORT: "0",
    ONEKNOCK_HOST: "0.0.0.0",
  });
  expect(settings.port).toBe(0);
  expect(settings.host).toBe("0.0.0.0");
});

// intents/review-corrections.md, check 6
test("the port is a plain number in the range", () => {
  for (const text of [" ", "0x10", "1e3", "80.0", "-1", "65536"]) {
    expect(() => readSettings({ ONEKNOCK_RECORD_FILE: "a", ONEKNOCK_PORT: text })).toThrow(
      "ONEKNOCK_PORT",
    );
  }
  expect(readSettings({ ONEKNOCK_RECORD_FILE: "a", ONEKNOCK_PORT: "0" }).port).toBe(0);
  expect(readSettings({ ONEKNOCK_RECORD_FILE: "a", ONEKNOCK_PORT: "8080" }).port).toBe(8080);
});

test("the settings refuse a missing file and a wrong port", () => {
  expect(() => readSettings({})).toThrow("ONEKNOCK_RECORD_FILE");
  expect(() => readSettings({ ONEKNOCK_RECORD_FILE: "a", ONEKNOCK_PORT: "x" })).toThrow(
    "ONEKNOCK_PORT",
  );
});
