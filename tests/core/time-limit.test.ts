// The judgement at the time limit, with a channel that keeps its messages in a list.
import { expect, test } from "vitest";

import type { Channel, Message } from "../../src/core/channel.ts";
import type { Event } from "../../src/core/event.ts";
import { judgeEvent } from "../../src/core/judge.ts";
import type { Rule } from "../../src/core/rule.ts";
import { judgeTimeLimit, TIME_LIMIT_RULE } from "../../src/core/time-limit.ts";
import { MemoryEventStore } from "../../src/store/memory.ts";

const T = new Date("2026-11-20T08:00:00Z");
const LIMIT = 600;
const at = (seconds: number): Date => new Date(T.getTime() + seconds * 1000);

const urgentGetsKnock: Rule = {
  name: "an urgent event gets a knock",
  when: { value: "urgent", equals: true },
  action: "knock",
};

function listChannel(): Channel & { messages: Message[] } {
  const messages: Message[] = [];
  return {
    messages,
    async send(message: Message): Promise<void> {
      messages.push(message);
    },
  };
}

function event(values: Partial<Event> = {}): Event {
  return {
    state: "open",
    identity: "event-1",
    startTime: "2026-11-20T08:00:00Z",
    urgent: false,
    ...values,
  };
}

// intents/time-limit-knock.md, check 1
test("an event with no result gets a knock when the time limit passes", async () => {
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  const early = await judgeTimeLimit(at(599), LIMIT, channel, store);
  expect(early).toEqual({ sent: [], failed: [] });
  expect(channel.messages).toEqual([]);
  const result = await judgeTimeLimit(at(600), LIMIT, channel, store);
  const expected: Message = {
    level: "knock",
    identity: "event-1",
    startTime: "2026-11-20T08:00:00Z",
    rule: TIME_LIMIT_RULE,
  };
  expect(TIME_LIMIT_RULE).toBe("the time limit passed with no result");
  expect(channel.messages).toEqual([expected]);
  expect(result.sent).toEqual([expected]);
});

// intents/time-limit-knock.md, check 2
test("the time limit gives one knock for one event", async () => {
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  await judgeTimeLimit(at(600), LIMIT, channel, store);
  const later = await judgeTimeLimit(at(700), LIMIT, channel, store);
  expect(later.sent).toEqual([]);
  expect(channel.messages).toHaveLength(1);
});

// intents/time-limit-knock.md, check 3
test("an event with a knock gets no second knock at the time limit", async () => {
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event({ urgent: true }), [urgentGetsKnock], channel, store, T);
  expect(channel.messages).toHaveLength(1);
  await judgeTimeLimit(at(600), LIMIT, channel, store);
  expect(channel.messages).toHaveLength(1);
});

// intents/time-limit-knock.md, check 4
test("an event that closed gets no knock at the time limit", async () => {
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  await judgeEvent(event({ state: "closed" }), [urgentGetsKnock], channel, store, at(10));
  await judgeTimeLimit(at(600), LIMIT, channel, store);
  expect(channel.messages).toEqual([]);
});

// intents/time-limit-knock.md, check 5
test("a repeat does not start the time limit again", async () => {
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  await judgeEvent(event(), [urgentGetsKnock], channel, store, at(599));
  await judgeTimeLimit(at(600), LIMIT, channel, store);
  expect(channel.messages).toHaveLength(1);
});

// intents/time-limit-knock.md, check 6
test("an event with a quiet message gets a knock at the time limit", async () => {
  const quiet: Rule = { name: "quiet", when: { value: "urgent", equals: false }, action: "quiet message" };
  const channel = listChannel();
  const store = new MemoryEventStore();
  await judgeEvent(event(), [quiet], channel, store, T);
  expect(channel.messages.map((message) => message.level)).toEqual(["quiet message"]);
  await judgeTimeLimit(at(600), LIMIT, channel, store);
  expect(channel.messages.map((message) => message.level)).toEqual(["quiet message", "knock"]);
});

// intents/time-limit-knock.md, check 7
test("two checks at the same time give one knock", async () => {
  const messages: Message[] = [];
  const channel: Channel = {
    async send(message: Message): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 20));
      messages.push(message);
    },
  };
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  await Promise.all([
    judgeTimeLimit(at(600), LIMIT, channel, store),
    judgeTimeLimit(at(600), LIMIT, channel, store),
  ]);
  expect(messages).toHaveLength(1);
});

// intents/time-limit-knock.md, check 8
test("a knock that failed is sent at the next check", async () => {
  const messages: Message[] = [];
  let fail = true;
  const channel: Channel = {
    async send(message: Message): Promise<void> {
      if (fail) {
        fail = false;
        throw new Error("the channel failed");
      }
      messages.push(message);
    },
  };
  const store = new MemoryEventStore();
  await judgeEvent(event(), [urgentGetsKnock], channel, store, T);
  const first = await judgeTimeLimit(at(600), LIMIT, channel, store);
  expect(first.sent).toEqual([]);
  expect(first.failed).toHaveLength(1);
  expect(first.failed[0]?.identity).toBe("event-1");
  expect(messages).toEqual([]);
  const second = await judgeTimeLimit(at(601), LIMIT, channel, store);
  expect(second.sent).toHaveLength(1);
  expect(messages).toHaveLength(1);
});

// intents/time-limit-knock.md, check 9
test("a failed knock does not stop the knock of another event", async () => {
  const messages: Message[] = [];
  const channel: Channel = {
    async send(message: Message): Promise<void> {
      if (message.identity === "event-1") {
        throw new Error("the channel failed");
      }
      messages.push(message);
    },
  };
  const store = new MemoryEventStore();
  await judgeEvent(event({ identity: "event-1" }), [urgentGetsKnock], channel, store, T);
  await judgeEvent(event({ identity: "event-2" }), [urgentGetsKnock], channel, store, at(1));
  const result = await judgeTimeLimit(at(601), LIMIT, channel, store);
  expect(result.failed.map((message) => message.identity)).toEqual(["event-1"]);
  expect(result.sent.map((message) => message.identity)).toEqual(["event-2"]);
  expect(messages.map((message) => message.identity)).toEqual(["event-2"]);
});
