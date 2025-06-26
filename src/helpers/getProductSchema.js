// Helper to strip HTML tags from a string
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export const getProductSchemaData = (product, currentPrice) => {
    try {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const images = Array.isArray(product?.images)
            ? product.images.filter(img => typeof img === 'string' && img.startsWith('http'))
            : [];

        const price = typeof currentPrice === 'number' && !isNaN(currentPrice)
            ? currentPrice
            : product?.price || product?.salePrice || 0;

        // --- Aggregate Rating ---
        let aggregateRating = undefined;
        if (product?.averageRating && product?.reviews?.length > 0) {
            aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": product.averageRating,
                "reviewCount": product.reviews.length
            };
        }

        // --- Reviews ---
        let reviews = undefined;
        if (product?.reviews?.length > 0) {
            reviews = product.reviews.map(r => ({
                "@type": "Review",
                "author": r.reviewerId?.name || r.reviewerName || "Anonymous",
                "datePublished": r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "",
                "reviewBody": stripHtml(r.reviewText || ""),
                "name": r.title || "",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": r.rating
                }
            }));
        }

        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product?.title?.trim() || "Unnamed Product",
            "image": images.length ? images : ['/default-product-image.jpg'],
            "description": stripHtml(product?.description?.trim() || ""),
            "sku": product?._id || "",
            "brand": {
                "@type": "Brand",
              "name": product?.brand?.name?.trim() || "Your Store"
            },
            "offers": {
                "@type": "Offer",
                "url": url,
                "priceCurrency": "PKR",
                "price": price,
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product?.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock"
            },
            ...(aggregateRating ? { aggregateRating } : {}),
            ...(reviews ? { review: reviews } : {})
        };
    } catch (error) {
        console.error("Error generating schema data:", error);
        return null;
    }
};
