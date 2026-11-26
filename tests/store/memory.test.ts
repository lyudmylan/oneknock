// The store of events in memory.
import { expect, test } from "vitest";

import { MemoryEventStore } from "../../src/store/memory.ts";

const start = "2026-11-20T08:00:00Z";
const arrival = new Date("2026-11-20T08:00:00Z");

// intents/event-repeats.md, check 8
test("the store knows an event by its identity and its start time", async () => {
  const store = new MemoryEventStore();
  expect(await store.open("event-1", start, arrival)).toBe(true);
  expect(await store.open("event-1", start, arrival)).toBe(false);
  await store.close("event-1", start);
  expect(await store.open("event-1", start, arrival)).toBe(false);
  await store.forget("event-1", start);
  expect(await store.open("event-1", start, arrival)).toBe(true);
  expect(await store.open("event-1", "2026-11-20T09:00:00Z", arrival)).toBe(true);
  expect(await store.open("event-2", start, arrival)).toBe(true);
  await store.close("event-3", start);
  expect(await store.open("event-3", start, arrival)).toBe(false);
});

// intents/time-limit-knock.md, check 10
test("the store gives the events that wait since a given time", async () => {
  const at = (seconds: number): Date => new Date(arrival.getTime() + seconds * 1000);
  const store = new MemoryEventStore();
  await store.open("late", start, at(20));
  await store.open("second", start, at(10));
  await store.open("first", start, at(5));
  await store.open("closed", start, at(1));
  await store.close("closed", start);
  await store.open("marked", start, at(2));
  expect(await store.markKnocked("marked", start)).toBe(true);
  await store.open("gone", start, at(3));
  await store.forget("gone", start);

  const names = async (time: Date): Promise<string[]> =>
    (await store.waitingSince(time)).map((event) => event.identity);
  expect(await names(at(10))).toEqual(["first", "second"]);
  expect(await names(at(4))).toEqual([]);
  expect(await store.waitingSince(at(5))).toEqual([{ identity: "first", startTime: start }]);

  // A second open does not change the time of the arrival.
  expect(await store.open("late", start, at(0))).toBe(false);
  expect(await names(at(10))).toEqual(["first", "second"]);

  expect(await store.markKnocked("first", start)).toBe(true);
  expect(await store.markKnocked("first", start)).toBe(false);
  expect(await store.markKnocked("closed", start)).toBe(false);
  expect(await store.markKnocked("unknown", start)).toBe(false);
  expect(await names(at(10))).toEqual(["second"]);

  await store.unmarkKnocked("first", start);
  expect(await names(at(10))).toEqual(["first", "second"]);
});
