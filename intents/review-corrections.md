# Intent: the three small findings of the code reviews on the thin path are corrected

Work item: #34. Status: planned. Approval: a person merges the change request that adds this file.

## Goal

The check on the imports of the core, the reader of the record file and the port setting each handle the
case that a reviewer found, and a test shows each correction.

## In scope

- `tests/core/boundary.test.ts`, the check on the imports of the core.
  - The code that finds the sources of the imports in a text moves to `tests/core/import-sources.ts`, so
    a test calls it with a text.
  - It removes the comments of a text before it looks for sources. A comment that holds the text of an
    import is no import.
  - It also finds the source of a `require("x")`. This covers `import x = require("x")` too.
  - One comment in the file names the limit: the removal of comments reads no string, so the text `//`
    inside a string cuts the rest of that line.
- `src/channel/recording.ts`, the reader of the record file. A line that is not valid JSON gives an error
  that names the file and the number of the line. The reader drops no line in silence, because the
  record is evidence. A last line that is not complete is such a line.
- `src/settings.ts`, the port setting. The text of `ONEKNOCK_PORT` holds digits only. Each other text
  gives the error that names the variable. The range 0 to 65535 stays.
- The change request has the line `No document change: corrections with no new behaviour`. No document
  changes.

## Out of scope

New behaviour of the product. A change of a package file, of the contract, or of an intent that is
already merged. A parser of TypeScript for the check on the imports.

## Acceptance checks

## Automatic checks

1. A text with an import in a line comment and with an import in a block comment has no source.
   test: `tests/core/import-sources.test.ts::a comment with the text of an import is no import`
2. A text with `require("node:fs")` and a text with `import fs = require("node:fs")` each have the source
   `node:fs`.
   test: `tests/core/import-sources.test.ts::a require form is an import`
3. A text with the four forms that the check knew before has the same sources as before: an import with
   `from`, an export with `from`, an import with no name, and an import as a call.
   test: `tests/core/import-sources.test.ts::the four known forms keep their sources`
4. A record file whose second line is not complete gives an error, and the text of the error holds the
   path of the file and the number 2.
   test: `tests/channel/recording.test.ts::a line that is not complete gives an error with its place`
5. The port texts `" "`, `"0x10"`, `"1e3"`, `"80.0"`, `"-1"` and `"65536"` each give an error that names
   `ONEKNOCK_PORT`. The port texts `"0"` and `"8080"` give the ports 0 and 8080.
   test: `tests/settings.test.ts::the port is a plain number in the range`

The checks of the earlier intents stay as they are and still pass with `pnpm test`.

This work item adds no behaviour that a scenario of the test of the product can show.

## Manual checks

None.
