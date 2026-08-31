import Link from "next/link";
export default async function ReviewsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main className="main"><p>Full page route</p><h1>Reviews for product {id}</h1><Link href={`/products/${id}`}>Product {id}</Link></main>; }
