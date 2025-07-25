// src/helpers/getCategorySchema.js
export default function getCategorySchema({
  name,
  slug,
  description,
  products = [],
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `https://www.etimadmart.com/category/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, idx) => ({
        "@type": "Product",
        position: idx + 1,
        name: product.title,
        url: `https://www.etimadmart.com/products/${product.slug}`,
        image: product.images?.[0],
        description: product.description,
        sku: product.sku || product._id,
      })),
    },
  };
}
