import { defineConfig } from "next-modal-router/config";

export default defineConfig({
  defaultSlot: "modal",
  overlays: {
    product: { route: "/products/[id]", source: "/products", type: "modal", slot: "modal", closeFallback: "/products" },
    productReviews: { route: "/products/[id]/reviews", source: "/products/[id]", type: "drawer", slot: "modal", closeFallback: "/products/[id]" },
    notifications: { route: "/notifications", source: "/dashboard", type: "drawer", slot: "panel", closeFallback: "/dashboard" },
  },
});
