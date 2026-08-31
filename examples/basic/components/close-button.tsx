"use client";
import { useOverlayRouter } from "next-modal-router";
export function CloseButton({ fallback }: { fallback?: string }) { const overlay = useOverlayRouter(); return <button className="close" onClick={() => overlay.close(fallback)}>Close</button>; }
