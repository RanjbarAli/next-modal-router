import { ProductOverlay } from "../../../../components/product-overlay";
export default async function ProductModal({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProductOverlay id={id} />; }
