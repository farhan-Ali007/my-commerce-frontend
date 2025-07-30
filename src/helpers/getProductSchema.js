// Helper to strip HTML tags from a string
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export const getProductSchemaData = (product, currentPrice) => {
    try {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://etimadmart.com';
        
        // Collect all images: main product images + variant images
        const mainImages = Array.isArray(product?.images)
            ? product.images.filter(img => typeof img === 'string' && img.startsWith('http'))
            : [];
            
        const variantImages = product?.variants?.flatMap(variant => 
            variant.values?.filter(val => val.image && val.image.startsWith('http')).map(val => val.image) || []
        ) || [];
        
        const allImages = [...mainImages, ...variantImages];
        
        // Ensure we have at least one image
        const images = allImages.length > 0 ? allImages : ['/default-product-image.jpg'];

        const price = typeof currentPrice === 'number' && !isNaN(currentPrice)
            ? currentPrice
            : product?.price || product?.salePrice || 0;

        // Helper function to determine brand name
        const getBrandName = (brand) => {
            if (!brand || !brand.name) return "Etimad Mart";
            const brandName = brand.name.trim().toLowerCase();
            if (brandName === "no-brand" || brandName === "nobrand" || brandName === "") {
                return "Etimad Mart";
            }
            return brand.name.trim();
        };

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
                    "name": r.reviewerId?.username || r.reviewerName || "Anonymous"
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
            hasVariant = product.variants.map(variant => {
                const variantImages = variant.values?.filter(val => val.image && val.image.startsWith('http')).map(val => val.image) || [];
                return {
                    "@type": "Product",
                    "name": `${product.title} - ${variant.name}`,
                    "description": `${product.title} in ${variant.name}`,
                    "url": url,
                    "image": variantImages.length > 0 ? variantImages : (mainImages.length > 0 ? [mainImages[0]] : ['/default-product-image.jpg']),
                    "productGroupID": product?.category?.slug || product?.category?.name || "default-group",
                    "category": category,
                    "brand": {
                        "@type": "Brand",
                        "name": getBrandName(product?.brand)
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": "PKR",
                        "price": price,
                        "availability": product?.stock > 0
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                        "shippingDetails": {
                            "@type": "OfferShippingDetails",
                            "shippingRate": {
                                "@type": "MonetaryAmount",
                                "value": product?.freeShipping ? 0 : (product?.deliveryCharges || 250),
                                "currency": "PKR"
                            },
                            "shippingDestination": {
                                "@type": "DefinedRegion",
                                "addressCountry": "PK"
                            },
                            "deliveryTime": {
                                "@type": "ShippingDeliveryTime",
                                "handlingTime": {
                                    "@type": "QuantitativeValue",
                                    "minValue": 0,
                                    "maxValue": 1,
                                    "unitCode": "DAY"
                                },
                                "transitTime": {
                                    "@type": "QuantitativeValue",
                                    "minValue": 2,
                                    "maxValue": 5,
                                    "unitCode": "DAY"
                                }
                            }
                        },
                        "hasMerchantReturnPolicy": {
                            "@type": "MerchantReturnPolicy",
                            "applicableCountry": "PK",
                            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                            "merchantReturnDays": 7,
                            "returnMethod": "https://schema.org/ReturnByMail",
                            "returnFees": "https://schema.org/FreeReturn"
                        }
                    }
                };
            });
        }

        const schemaData = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product?.title?.trim() || "Unnamed Product",
            "url": url,
            "image": images,
            "description": stripHtml(product?.description?.trim() || ""),
            "sku": product?._id || "",
            "mpn": product?._id || "",
            "productGroupID": product?.category?.slug || product?.category?.name || "default-group",
            "brand": {
                "@type": "Brand",
                "name": getBrandName(product?.brand)
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
                },
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": product?.freeShipping ? 0 : (product?.deliveryCharges || 200),
                        "currency": "PKR"
                    },
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "PK"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 1,
                            "unitCode": "DAY"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 2,
                            "maxValue": 5,
                            "unitCode": "DAY"
                        }
                    }
                },
                "hasMerchantReturnPolicy": {
                    "@type": "MerchantReturnPolicy",
                    "applicableCountry": "PK",
                    "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                    "merchantReturnDays": 7,
                    "returnMethod": "https://schema.org/ReturnByMail",
                    "returnFees": "https://schema.org/FreeReturn"
                }
            },
            "manufacturer": {
                "@type": "Organization",
                "name": getBrandName(product?.brand)
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
