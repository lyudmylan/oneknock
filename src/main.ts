// The start of oneknock as one process: `node src/main.ts`.

import type { AddressInfo } from "node:net";

import { RecordingChannel } from "./channel/recording.ts";
import { judgeTimeLimit } from "./core/time-limit.ts";
import { urgentGetsKnock } from "./first-rule.ts";
import { createEndpoint } from "./http/endpoint.ts";
import { readSettings, type Settings } from "./settings.ts";
import { MemoryEventStore } from "./store/memory.ts";
import { startTimeLimitChecks } from "./time-limit-checks.ts";

let settings: Settings;
try {
  settings = readSettings(process.env);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const channel = new RecordingChannel(settings.recordFile);
const store = new MemoryEventStore();
const server = createEndpoint({ rules: [urgentGetsKnock], channel, store });

// The time limits are in the store, so a check each second holds no state of its own.
const stopChecks = startTimeLimitChecks(
  1000,
  (time) => judgeTimeLimit(time, settings.timeLimitSeconds, channel, store),
  (line) => console.error(line),
);

server.listen(settings.port, settings.host, () => {
  const { address, port } = server.address() as AddressInfo;
  const host = address.includes(":") ? `[${address}]` : address;
  console.log(`oneknock listens on http://${host}:${port}`);
});

function stop(): void {
  stopChecks();
  server.close(() => process.exit(0));
  server.closeAllConnections();
}

process.on("SIGTERM", stop);
process.on("SIGINT", stop);
