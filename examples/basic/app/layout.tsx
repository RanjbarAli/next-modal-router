import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { OverlayRouterProvider } from "next-modal-router";
import "./globals.css";

export default function RootLayout({ children, modal, panel }: { children: ReactNode; modal: ReactNode; panel: ReactNode }) {
  return <html lang="en"><body><OverlayRouterProvider><header className="header"><strong>next-modal-router</strong><nav className="nav"><Link href="/products">Products</Link><Link href="/dashboard">Dashboard</Link></nav></header>{children}<Suspense fallback={null}>{modal}{panel}</Suspense></OverlayRouterProvider></body></html>;
}
