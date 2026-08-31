# CLI reference

The `next-modal-router` binary has five commands: `init`, `add`, `check`, `doctor`, and `list`. Run `next-modal-router help` for compact syntax.

Generation commands support `--dry-run` and refuse meaningful overwrites unless the requested operation uses `--force`. Analysis commands support `--format json`; JSON contains no ANSI formatting. `--cwd` targets an application inside a monorepo.

Exit codes are `0` for success, `1` for route validation errors, and `2` for invalid invocation, unreadable configuration, or protected-file conflicts.

## Automation

```bash
next-modal-router add product --route /products/[id] --source /products --type modal --slot modal --fallback /products --ci
next-modal-router check --format json --ci
```

Quote dynamic routes in shells that expand brackets. See the README for every command, flag, and example output.
