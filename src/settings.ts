// The settings of the process, read from the environment.

export interface Settings {
  recordFile: string;
  port: number;
  host: string;
  timeLimitSeconds: number;
}

/** Reads the settings from the given environment. Throws an error that names the variable when one is wrong. */
export function readSettings(env: Record<string, string | undefined>): Settings {
  const recordFile = env["ONEKNOCK_RECORD_FILE"];
  if (recordFile === undefined || recordFile === "") {
    throw new Error(
      "ONEKNOCK_RECORD_FILE is not set: it holds the path of the file of the recording channel",
    );
  }
  const portText = env["ONEKNOCK_PORT"];
  let port = 8080;
  if (portText !== undefined && portText !== "") {
    port = /^[0-9]+$/.test(portText) ? Number(portText) : Number.NaN;
    if (!Number.isInteger(port) || port > 65535) {
      throw new Error(`ONEKNOCK_PORT is not a port: ${portText}`);
    }
  }
  const limitText = env["ONEKNOCK_TIME_LIMIT_SECONDS"];
  let timeLimitSeconds = 600;
  if (limitText !== undefined && limitText !== "") {
    timeLimitSeconds = /^[0-9]+$/.test(limitText) ? Number(limitText) : Number.NaN;
    if (!Number.isInteger(timeLimitSeconds) || timeLimitSeconds < 1 || timeLimitSeconds > 86400) {
      throw new Error(
        `ONEKNOCK_TIME_LIMIT_SECONDS is not a number of seconds from 1 to 86400: ${limitText}`,
      );
    }
  }
  const host = env["ONEKNOCK_HOST"];
  return {
    recordFile,
    port,
    host: host === undefined || host === "" ? "127.0.0.1" : host,
    timeLimitSeconds,
  };
}
