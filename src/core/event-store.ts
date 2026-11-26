// The interface through which the core keeps the state of the events it saw. The stores live outside the core.

/** An event that waits: open, with no knock. */
export interface WaitingEvent {
  identity: string;
  startTime: string;
}

/**
 * The store of events. An event is named by its identity and its start time. Each operation is
 * asynchronous, because the record store comes later behind the same interface.
 */
export interface EventStore {
  /**
   * Stores the event as open, with the time of its arrival, when the store does not know it, and returns
   * true. Otherwise changes nothing, also not the time of the arrival, and returns false.
   */
  open(identity: string, startTime: string, arrivedAt: Date): Promise<boolean>;
  /** Stores the event as closed, also when the store did not know it. */
  close(identity: string, startTime: string): Promise<void>;
  /** Removes the event, so the store does not know it any more. */
  forget(identity: string, startTime: string): Promise<void>;
  /** For an event that waits, stores that it got a knock and returns true. For each other event changes nothing and returns false. */
  markKnocked(identity: string, startTime: string): Promise<boolean>;
  /** An open event that is marked as knocked waits again. */
  unmarkKnocked(identity: string, startTime: string): Promise<void>;
  /** The events that wait and that arrived at the given time or before it, in the order of their arrival. */
  waitingSince(time: Date): Promise<WaitingEvent[]>;
}
