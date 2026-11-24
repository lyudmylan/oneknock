// The settings of the process.
import { expect, test } from "vitest";

import { readSettings } from "../src/settings.ts";

// intents/http-endpoint.md, check 12
test("the settings have their defaults", () => {
  expect(readSettings({ ONEKNOCK_RECORD_FILE: "messages.jsonl" })).toEqual({
    recordFile: "messages.jsonl",
    port: 8080,
    host: "127.0.0.1",
  });
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
