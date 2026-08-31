# Contributing

Thanks for improving `next-modal-router`.

## Setup

Use Node.js 18.17 or newer and pnpm 10. Node 22 is recommended for local development:

```bash
corepack enable
pnpm install
pnpm check
```

Run `pnpm dev` while changing library code and `pnpm --dir examples/basic dev` to exercise native routing. Unit tests belong in `tests/`; cover route calculations and filesystem behavior with temporary fixtures instead of mocking large parts of Next.js.

## Architecture

- `src/runtime` is the small client-facing layer. Keep browser state minimal and never patch Next.js or browser history.
- `src/routing` contains pure segment and interception logic plus filesystem discovery.
- `src/config` owns public configuration types and validation.
- `src/cli` owns project detection, safe writes, generation, and reporting.

Public behavior needs tests and synchronized documentation. Avoid dependencies unless they remove substantially more complexity than they add.

## Pull requests

Keep changes focused, explain observable behavior, add a changelog entry for user-facing changes, and ensure `pnpm check` succeeds. Generated files must compile, CLI errors must be actionable, and documentation examples must use real exports.

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).
