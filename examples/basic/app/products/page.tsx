import { OverlayLink } from "next-modal-router";

export default function ProductsPage() {
  return <main className="main"><p>Example store</p><h1>Products</h1><p>Soft navigation opens an intercepted modal while keeping this page mounted.</p><div className="grid">{[1, 2, 3].map((id) => <OverlayLink className="card" key={id} href={`/products/${id}`} fallback="/products" scroll={false}><strong>Product {id}</strong><p>Open URL-native modal →</p></OverlayLink>)}</div></main>;
}
