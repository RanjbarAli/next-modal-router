import { OverlayLink } from "next-modal-router";
export default function Dashboard() { return <main className="main"><p>Example account</p><h1>Dashboard</h1><OverlayLink className="card" href="/notifications" fallback="/dashboard">Open notifications drawer →</OverlayLink></main>; }
