# Troubleshooting

## Modal remains visible after navigation

The slot may be retaining its previous active segment. Add `@slot/default.tsx` returning `null`, and ensure the close action navigates rather than only toggling component state.

## Missing `default.tsx`

Every parallel slot needs a fallback for routes that do not match it. Run `next-modal-router check`; `NMR001` identifies the slot path.

## Incorrect intercept depth

Matchers count route segments. They do not count route groups such as `(shop)` or parallel slots such as `@modal`. Run `check --verbose` to compare found and expected paths.

## Overlay appears on refresh

The modal may live in an ordinary page or shared layout. Intercepted UI belongs under `@slot/(.)target`; the normal target page belongs outside the slot.

## Overlay does not appear during soft navigation

Confirm the slot is rendered by its owner layout and use `OverlayLink`, Next.js `Link`, or App Router navigation. A plain anchor can cause a hard request.

## Back button leaves the website

Replace unconditional `router.back()` with `overlay.close()` and provide a route fallback. Direct requests have no safe in-app previous entry the browser will disclose.

## Parallel slot produces 404

Pass the named slot prop through its layout, add a default route, and verify that the intercepted page filename is one of Next.js's supported page extensions.
