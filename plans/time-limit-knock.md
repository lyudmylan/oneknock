# Plan: a knock when the time limit passes (#55)

Intent: `intents/time-limit-knock.md`, checks 1 to 21.

## Steps

1. Extend `EventStore` with the arrival time on `open`, and with `markKnocked`, `unmarkKnocked` and
   `waitingSince`; implement them in `MemoryEventStore`.
2. `judgeEvent` takes the arrival time and marks an event before a knock is sent.
3. Add `src/core/time-limit.ts` with `judgeTimeLimit` and `TIME_LIMIT_RULE`.
4. The endpoint gives the core the time of the call, with an optional `now`.
5. Add the setting `ONEKNOCK_TIME_LIMIT_SECONDS`.
6. Add `src/time-limit-checks.ts`, and start it in `src/main.ts` each second; the stop ends it.
7. The runner of the product test reads `settings` and `waitMs`; add three scenarios.
8. Update `docs/architecture.md`.

## Files

- `src/core/event-store.ts`, `src/store/memory.ts`, `src/core/judge.ts`, `src/core/time-limit.ts`
- `src/http/endpoint.ts`, `src/settings.ts`, `src/time-limit-checks.ts`, `src/main.ts`
- `product-test/run.ts`, `product-test/scenarios/06-*.json`, `07-*.json`, `08-*.json`
- `docs/architecture.md`

## Tests

- `tests/core/time-limit.test.ts`: checks 1 to 9.
- `tests/store/memory.test.ts`: check 10; the older test gets an arrival time.
- `tests/settings.test.ts`: check 11.
- `tests/product-test/run.test.ts`: checks 12 and 13; a 60 second limit on the two tests that run the
  repository scenarios.
- `tests/http/endpoint.test.ts`: check 17.
- `tests/time-limit-checks.test.ts`: checks 18 to 21.
- `tests/core/judge.test.ts`: calls give an arrival time.
