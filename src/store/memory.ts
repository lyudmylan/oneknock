// The store of events in memory. It sits outside the core. The events do not survive a restart.

import type { EventStore, WaitingEvent } from "../core/event-store.ts";

interface Entry {
  identity: string;
  startTime: string;
  state: "open" | "closed";
  /** The time of the arrival, in milliseconds; undefined for an event that was first stored as closed. */
  arrivedAt: number | undefined;
  knocked: boolean;
}

/** Holds the state of each event in a map, by the identity and the start time. */
export class MemoryEventStore implements EventStore {
  private readonly entries = new Map<string, Entry>();

  private key(identity: string, startTime: string): string {
    return JSON.stringify([identity, startTime]);
  }

  async open(identity: string, startTime: string, arrivedAt: Date): Promise<boolean> {
    const key = this.key(identity, startTime);
    if (this.entries.has(key)) {
      return false;
    }
    this.entries.set(key, {
      identity,
      startTime,
      state: "open",
      arrivedAt: arrivedAt.getTime(),
      knocked: false,
    });
    return true;
  }

  async close(identity: string, startTime: string): Promise<void> {
    const key = this.key(identity, startTime);
    const entry = this.entries.get(key);
    if (entry === undefined) {
      this.entries.set(key, { identity, startTime, state: "closed", arrivedAt: undefined, knocked: false });
    } else {
      entry.state = "closed";
    }
  }

  async forget(identity: string, startTime: string): Promise<void> {
    this.entries.delete(this.key(identity, startTime));
  }

  async markKnocked(identity: string, startTime: string): Promise<boolean> {
    const entry = this.entries.get(this.key(identity, startTime));
    if (entry === undefined || entry.state !== "open" || entry.knocked) {
      return false;
    }
    entry.knocked = true;
    return true;
  }

  async unmarkKnocked(identity: string, startTime: string): Promise<void> {
    const entry = this.entries.get(this.key(identity, startTime));
    if (entry !== undefined && entry.state === "open") {
      entry.knocked = false;
    }
  }

  async waitingSince(time: Date): Promise<WaitingEvent[]> {
    const limit = time.getTime();
    const waiting: { event: WaitingEvent; at: number }[] = [];
    for (const entry of this.entries.values()) {
      if (entry.state === "open" && !entry.knocked && entry.arrivedAt !== undefined && entry.arrivedAt <= limit) {
        waiting.push({ event: { identity: entry.identity, startTime: entry.startTime }, at: entry.arrivedAt });
      }
    }
    // Array.sort is stable, so events with the same time stay in the order of their storing.
    return waiting.sort((a, b) => a.at - b.at).map((item) => item.event);
  }
}
