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
                "reviewCount": product.reviews.length,
                "bestRating": 5,
                "worstRating": 1
            };
        }

        // --- Reviews ---
        let reviews = undefined;
        if (product?.reviews?.length > 0) {
            reviews = product.reviews.map(r => ({
                "@type": "Review",
                "author": {
                    "@type": "Person",
                    "name": r.reviewerId?.name || r.reviewerName || "Anonymous"
                },
                "datePublished": r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "",
                "reviewBody": stripHtml(r.reviewText || ""),
                "name": product?.title || "",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": r.rating,
                    "bestRating": 5,
                    "worstRating": 1
                }
            }));
        }

        // --- Additional Properties ---
        let additionalProperty = [];
        if (product?.weight) {
            additionalProperty.push({
                "@type": "PropertyValue",
                "name": "Weight",
                "value": `${product.weight} kg`
            });
        }
        if (product?.stock !== undefined) {
            additionalProperty.push({
                "@type": "PropertyValue",
                "name": "Stock",
                "value": product.stock
            });
        }
        if (product?.tags?.length > 0) {
            additionalProperty.push({
                "@type": "PropertyValue",
                "name": "Tags",
                "value": product.tags.map(tag => tag.name).join(', ')
            });
        }

        // --- Category ---
        let category = undefined;
        if (product?.category?.name) {
            category = {
                "@type": "Thing",
                "name": product.category.name
            };
        }

        // --- Variants ---
        let hasVariant = undefined;
        if (product?.variants?.length > 0) {
            hasVariant = product.variants.map(variant => ({
                "@type": "Product",
                "name": `${product.title} - ${variant.name}`,
                "description": `${product.title} in ${variant.name}`,
                "category": category,
                "brand": {
                    "@type": "Brand",
                    "name": product?.brand?.name?.trim() || "Your Store"
                },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "PKR",
                    "price": price,
                    "availability": product?.stock > 0
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock"
                }
            }));
        }

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product?.title?.trim() || "Unnamed Product",
            "image": images.length ? images : ['/default-product-image.jpg'],
            "description": stripHtml(product?.description?.trim() || ""),
            "sku": product?._id || "",
            "mpn": product?._id || "",
            "brand": {
                "@type": "Brand",
                "name": product?.brand?.name?.trim() || "Your Store"
            },
            "category": category,
            "offers": {
                "@type": "Offer",
                "url": url,
                "priceCurrency": "PKR",
                "price": price,
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product?.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": "Etimad Mart"
                }
            },
            "manufacturer": {
                "@type": "Organization",
                "name": product?.brand?.name?.trim() || "Your Store"
            }
        };

        // Add optional fields if they exist
        if (aggregateRating) {
            schemaData.aggregateRating = aggregateRating;
        }
        if (reviews && reviews.length > 0) {
            schemaData.review = reviews;
        }
        if (additionalProperty.length > 0) {
            schemaData.additionalProperty = additionalProperty;
        }
        if (hasVariant && hasVariant.length > 0) {
            schemaData.hasVariant = hasVariant;
        }
        if (product?.longDescription) {
            schemaData.longDescription = stripHtml(product.longDescription);
        }
        if (product?.metaDescription) {
            schemaData.metaDescription = stripHtml(product.metaDescription);
        }

        return schemaData;
    } catch (error) {
        console.error("Error generating schema data:", error);
        return null;
    }
};
