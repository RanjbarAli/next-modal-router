# Nested overlays

Nested navigation remains URL-first:

```text
/products
/products/42
/products/42/reviews
```

Open each level through `OverlayLink` or `overlay.open`. The provider then reports depth `0`, `1`, and `2`, and safe close uses one native back operation per recorded current level.

Visual stacking depends on the route tree. A second parallel slot can preserve two independent surfaces. When one slot replaces its own active page, render the parent modal shell in the deeper intercepted page if the design needs both surfaces visible. Do not build a detached local array of modal components: it will diverge from refresh, sharing, and browser history.
