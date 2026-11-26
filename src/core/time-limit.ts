// The judgement at the time limit: an open event with no knock gets one knock.

import type { Channel, Message } from "./channel.ts";
import type { EventStore } from "./event-store.ts";

/** The rule of a knock at the time limit. */
export const TIME_LIMIT_RULE = "the time limit passed with no result";

/** The messages of one check: those that the channel took, and those that it refused. */
export interface TimeLimitResult {
  sent: Message[];
  failed: Message[];
}

/**
 * Gives one knock to each event that waits and whose time limit passed at the given time. The core holds
 * no clock: the caller gives the time. An event is taken when its age equals the time limit. The store
 * marks the event before the send, so two checks give one knock. When the channel fails for an event,
 * the core unmarks it, so the next check sends the knock, and goes on with the next event.
 */
export async function judgeTimeLimit(
  now: Date,
  timeLimitSeconds: number,
  channel: Channel,
  store: EventStore,
): Promise<TimeLimitResult> {
  const result: TimeLimitResult = { sent: [], failed: [] };
  const waiting = await store.waitingSince(new Date(now.getTime() - timeLimitSeconds * 1000));
  for (const { identity, startTime } of waiting) {
    if (!(await store.markKnocked(identity, startTime))) {
      continue;
    }
    const message: Message = { level: "knock", identity, startTime, rule: TIME_LIMIT_RULE };
    try {
      await channel.send(message);
      result.sent.push(message);
    } catch {
      await store.unmarkKnocked(identity, startTime);
      result.failed.push(message);
    }
  }
  return result;
}
