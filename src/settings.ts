// The settings of the process, read from the environment.

export interface Settings {
  recordFile: string;
  port: number;
  host: string;
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
    port = Number(portText);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(`ONEKNOCK_PORT is not a port: ${portText}`);
    }
  }
  const host = env["ONEKNOCK_HOST"];
  return { recordFile, port, host: host === undefined || host === "" ? "127.0.0.1" : host };
}
