
export const getProductSchemaData = (product, currentPrice) => {
    try {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const images = Array.isArray(product?.images)
            ? product.images.filter(img => typeof img === 'string' && img.startsWith('http'))
            : [];

        const price = typeof currentPrice === 'number' && !isNaN(currentPrice)
            ? currentPrice
            : product?.price || product?.salePrice || 0;

        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product?.title?.trim() || "Unnamed Product",
            "image": images.length ? images : ['/default-product-image.jpg'],
            "description": product?.description?.trim() || "",
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
            }
        };
    } catch (error) {
        console.error("Error generating schema data:", error);
        return null;
    }
};
