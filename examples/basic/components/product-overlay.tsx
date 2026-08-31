"use client";

import type { ReactNode } from "react";
import { OverlayLink, useOverlayRouter } from "next-modal-router";

export function ProductOverlay({ id, children }: { id: string; children?: ReactNode }) {
  const overlay = useOverlayRouter();
  return <div className="backdrop" data-testid="product-overlay"><article className="modal" role="dialog" aria-modal="true" aria-labelledby="product-title"><button className="close" onClick={() => overlay.close()}>Close</button><p>Product modal · depth {overlay.depth}</p><h2 id="product-title">Product {id}</h2><p>The URL is /products/{id}; refreshing renders the full page instead.</p><div className="tabs"><button className="close" onClick={() => overlay.setSearchParams({ tab: "details" })}>Details tab</button><button className="close" onClick={() => overlay.setSearchParams({ tab: "reviews" })}>Reviews tab</button></div><OverlayLink href={`/products/${id}/reviews`} fallback={`/products/${id}`}>Open reviews drawer →</OverlayLink>{children}</article></div>;
}
