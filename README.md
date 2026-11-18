# oneknock

oneknock judges when a person is needed in human-in-the-loop scenarios, and then it knocks. A knock is
a push to the person to act now. oneknock serves a human-agent team. In such a team, agents do part of
the work, and a person must be brought in exactly when needed. On-call is the first use case. There an
agent investigates each alert, and oneknock judges whether the engineer on call is needed.

oneknock knocks every time a person is needed and only then. A false positive is a knock that did not
need a person. A false negative is a missed alert, when a person had to receive a knock but did not. On
the scenarios of the oneknock lab the limit for each error is zero. The oneknock lab runs a small
service with seeded defects, and the repository publishes both counts as they are.

## Documents

| Document                                       | Content                                                      |
| ---------------------------------------------- | ------------------------------------------------------------ |
| [`docs/product.md`](docs/product.md)           | What oneknock is                                             |
| [`docs/architecture.md`](docs/architecture.md) | The architecture map and the flow                            |
| [`AGENTS.md`](AGENTS.md)                       | The rules for work in this repo                              |
| [`intents/`](intents/)                         | The intent of each work item: goal, scope, acceptance checks |

## How oneknock is built

oneknock is built with [Charter](https://github.com/lyudmylan/charter).

## State

The first version is in progress.

## License

Apache 2.0. See `LICENSE` and `NOTICE`.
