# Intent: one command starts oneknock, and one command runs the test of the product

Work item: #4. Approval: a person merges the change request that adds this file.

## Goal

A person or an agent starts oneknock with `pnpm start` and runs the test of the product with
`pnpm product-test`, and the contract names the second command as its product test, so each change request
runs it.

## In scope

A person makes this change, in a session with an agent. The package file and the contract are closed to a
run of an agent with no person present, so no run starts from this work item.

- `package.json`, two new scripts. The two scripts that exist stay as they are.
  - `"start": "node src/main.ts"`
  - `"product-test": "node product-test/run.ts"`
- `charter.toml`, the section `[checks]`. One line replaces the line `no_product_reason`:
  - `product = ["pnpm product-test"]`
  - The contract then holds no `no_product_reason`. The contract takes a command or a reason, not both.
  - The comment above the line names what the test does: it starts oneknock, sends the events of each
    scenario, and compares the messages with the known answer.
- `tests/product-test/run.test.ts`, one new test: the test of the product passes when its start command is
  `pnpm start`. So a test shows that the script starts oneknock, that oneknock writes its address, and
  that it ends with the exit code 0 on SIGTERM through the script.
- `docs/architecture.md`, the rows "Start of the process" and "Test of the product": each row names its
  script next to the command that it names today.
- The test of the product itself keeps `node src/main.ts` as its start command. Its code does not change.

After the merge, the job `product` of each change request runs the test of the product. Before, the job
passed with the reason for no product test.

## Out of scope

New scenarios, and each change of `src/` or of `product-test/`. A change of a workflow: the job `product`
exists and reads the contract. The two small findings on the test of the product (#40). A script that
builds or installs oneknock: `pnpm install` stays the one step before the two commands.

## Acceptance checks

## Automatic checks

1. The test of the product passes through its script on the code of the main branch with this work item.
   command: `pnpm product-test`
2. The script `start` starts oneknock: the two first scenarios pass when the start command of the test of
   the product is `pnpm start`.
   test: `tests/product-test/run.test.ts::the start script starts oneknock`
3. The contract names the command as its product test.
   command: `grep -qx 'product = \["pnpm product-test"\]' charter.toml`
4. The checks of the contract pass on the changed contract. They fail when the contract holds a command
   and a reason for no product test, so this check also shows that the reason is gone.
   command: `charter-check all charter.toml`

This work item adds no behaviour to the product, so it names no new scenario of the test of the product.

## Manual checks

5. The job `product` on the change request of this work item runs the test of the product: its log holds
   one line with "passed" for each of the two scenarios. who: the leader, at the merge, with the link to
   the log from the author. Not automatic: the log exists only on the code host, after the checks ran.
