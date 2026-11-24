# Intent: this repo follows version 2 of the organization rules

Work item: #48. Approval: a person merges the change request that adds this file.

## Goal

The contract names version 2 of the organization rules, so that the factory starts the agent that answers
the findings of the reviewers on the change request of a run, with no step of a person.

## In scope

- Why: version 2 of the organization rules holds one new rule, `run.answer_start = "factory"`. The leader
  decided on 2026-11-24 that the rule lives in the organization file, for each repo of the organization.
- `charter.toml`: the version of the source, `v2`. The contract of this repo holds no value for
  `run.answer_start`; the value comes from the organization.
- What changes in the work of this repo. After a report of a reviewer on a branch `run/<number>`, the
  workflow `run` decides whether an answer starts. An answer starts for a finding at `medium` or above. An
  agent corrects the finding or drops it with the reason, in a new commit on that branch, and a comment on
  the change request says what it did. The limit of rounds of the organization, 3, ends the loop: an agent
  answers one change request two times at most in one loop, and then a person decides.
- A session of a person answers no finding on a branch of a run while the loop is open.
- Each merge stays with a person. A change request with a finding that the agent dropped holds the words
  `by the agent of a run:` in that line, and a person reads the reason before the merge.
- The stop: the variable `CHARTER_RUNS` of the repo with the value `off` stops each run and each answer.
  One line in this contract, `answer_start = "person"` under `[run]`, gives the start back to a person.
- One change request, with the intent and the plan in it: the change is one line and has no code of the
  product, and the merge of a person is the approval of the intent.

## Out of scope

A tier whose approver is `agent`. The start of a run after the merge of an intent with no step by hand.

## Acceptance checks

## Automatic checks

Each command is the one of Charter 0.3.19.

1. The contract passes the contract checks, with version 2 of the organization rules.
   command: `charter-check all charter.toml`
2. The quality checks pass.
   command: `charter-gate quality --contract charter.toml`
3. The contract names version 2 of the source.
   command: `grep -q '^version = "v2"$' charter.toml`
4. The contract of this repo holds no value of its own for the start of an answer.
   command: `sh -c '! grep -q "answer_start" charter.toml'`
5. The effective contract says that the factory starts an answer.
   command: `sh -c 'charter-check check charter.toml --json | grep -q "\"run.answer_start\": \"factory\""'`

## Manual checks

6. On the change request of a run with a finding at the threshold, an answer starts with no step of a
   person: the job `decide` of the workflow `run` prints `start=true`, an agent pushes a commit to the
   branch or drops the finding, a comment on the change request holds the outcome and the line
   `Answered commit:`, and the reviewers report again on the new commit.
   who: the leader. Not automatic: the check needs a model call, machines of the code host, and a report of
   a reviewer with such a finding.
7. With the variable `CHARTER_RUNS` set to `off`, no answer starts after a report of a reviewer.
   who: the leader. Not automatic: the check needs a variable of the repo on the code host.
