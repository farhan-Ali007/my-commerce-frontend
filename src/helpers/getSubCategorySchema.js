// src/helpers/getSubCategorySchema.js

// Helper to strip HTML tags from a string
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default function getSubCategorySchema({
  name,
  slug,
  description,
  category,
  products = [],
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: stripHtml(description),
    url: `https://www.etimadmart.com/subcategory/${slug}`,
    isPartOf: {
      "@type": "CollectionPage",
      name: category?.name || "Category",
      url: `https://www.etimadmart.com/category/${category?.slug}`,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, idx) => ({
        "@type": "Product",
        position: idx + 1,
        name: product.title,
        url: `https://www.etimadmart.com/products/${product.slug}`,
        image: product.images?.[0],
        description: stripHtml(product.description),
        sku: product.sku || product._id,
        // Add required offers field for each product
        offers: {
          "@type": "Offer",
          "price": product.price || 0,
          "priceCurrency": "PKR",
          "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          "seller": {
            "@type": "Organization",
            "name": "Etimad Mart"
          }
        },
        // Add brand information
        brand: {
          "@type": "Brand",
          "name": product.brand?.name || "Etimad Mart"
        },
        // Add aggregate rating if available
        ...(product.averageRating && {
          aggregateRating: {
            "@type": "AggregateRating",
            "ratingValue": product.averageRating,
            "reviewCount": product.reviews?.length || 0,
            "bestRating": 5,
            "worstRating": 1
          }
        })
      })),
    },
  };
} 