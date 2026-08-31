# UI-library integrations

Routing controls whether the intercepted page exists. A UI library controls portal placement, focus trapping, escape handling, outside-click handling, animation, and visuals.

For Radix or shadcn/ui, render the dialog in controlled mode with `open` and call `overlay.close()` when `onOpenChange` receives `false`. For Headless UI, pass `open` and `onClose={overlay.close}`. For sheet packages, use the equivalent controlled-open callback.

Avoid a second persistent boolean as the source of truth. Navigation unmounts the intercepted route after close. If the UI library restores focus, set `restoreFocus={false}` on `OverlayRouterProvider` so only one system owns that behavior.
