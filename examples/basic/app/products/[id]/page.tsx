import Link from "next/link";
import { Suspense } from "react";
import { CloseButton } from "../../../components/close-button";
export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) { const { id } = await params; const query = await searchParams; return <main className="main" data-testid="full-product"><p>Full page route</p><h1>Product {id}</h1><p>Active tab: {query.tab ?? "details"}</p><p><Link href="/products">Back to products</Link></p><Suspense fallback={null}><CloseButton fallback="/products" /></Suspense></main>; }
