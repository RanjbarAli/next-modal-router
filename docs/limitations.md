# Limitations

`next-modal-router` orchestrates documented App Router behavior; it cannot alter when Next.js chooses an intercepted route.

Browser APIs do not disclose arbitrary history destinations. Safe close therefore trusts only entries recorded by the current provider and otherwise replaces with a fallback. Navigations made through raw custom router calls are invisible to this marker.

The generator targets root-owned parallel slots. The analyzer can discover nested existing slots, but unusual route trees may be maintained manually. Config-driven `add` serializes configuration to a stable static form and does not preserve comments or computed expressions.

There is no focus trap, portal, animation engine, dialog markup, CSS, or server-side overlay state. Use an accessible UI library for those concerns.
