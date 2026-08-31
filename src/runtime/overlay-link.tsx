"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useOverlayContext } from "./context.js";

export type OverlayLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { fallback?: string };

function hrefString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  const query = href.query ? new URLSearchParams(Object.entries(href.query).flatMap(([key, value]) => Array.isArray(value) ? value.map((item) => [key, String(item)]) : value == null ? [] : [[key, String(value)]])).toString() : "";
  return `${href.pathname ?? ""}${query ? `?${query}` : ""}${href.hash ?? ""}`;
}

export const OverlayLink = forwardRef<HTMLAnchorElement, OverlayLinkProps>(function OverlayLink({ fallback, onClick, scroll = false, ...props }, ref) {
  const context = useOverlayContext();
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) context.mark(hrefString(props.href), fallback);
  };
  return <Link {...props} ref={ref} scroll={scroll} onClick={handleClick} />;
});
