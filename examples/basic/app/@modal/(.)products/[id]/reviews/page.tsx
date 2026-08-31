import { ProductOverlay } from "../../../../../components/product-overlay";
import { CloseButton } from "../../../../../components/close-button";
export default async function ReviewsDrawer({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProductOverlay id={id}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="reviews-title" data-testid="reviews-drawer"><CloseButton /><h2 id="reviews-title">Reviews for product {id}</h2><p>This second URL navigation has logical overlay depth 2.</p></aside></ProductOverlay>; }
