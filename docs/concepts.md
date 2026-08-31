# Concepts

`next-modal-router` separates three responsibilities. Next.js owns URL matching, server rendering, soft navigation, and browser history. The CLI owns filesystem generation and static validation. The runtime records only overlay navigation initiated through its public API.

## Parallel slots

A directory named `@modal` becomes a named layout prop. Its `default.tsx` must return `null` when no intercepted child is active. The slot does not add a URL segment.

## Interception

`(.)products/[id]` targets a sibling route segment from the layout that owns the slot. `(..)` climbs one route segment, repeated forms climb multiple segments, and `(...)` targets from the app root. Route groups and parallel slots do not count as URL segments.

## Navigation modes

Soft navigation can preserve the current page and render the target through a slot. A refresh or direct request renders the ordinary target page. Both modes intentionally share the same URL.

The library never attempts to turn a hard navigation into a client-only modal.
