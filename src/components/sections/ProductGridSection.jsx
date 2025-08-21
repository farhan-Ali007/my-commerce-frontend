import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getAllProducts,
} from "../../functions/product";

const fetchBySource = async (source, page, limit) => {
  switch (source) {
    case "featured":
      return await getFeaturedProducts(page, limit);
    case "new-arrivals":
      return await getNewArrivals(page, limit);
    case "best-sellers":
      return await getBestSellers(page, limit);
    default:
      return await getAllProducts(page, limit);
  }
};

const ProductGridSection = ({ settings = {} }) => {
  const {
    title = "Products",
    source = "featured", // featured | new-arrivals | best-sellers | all
    limit = 8,
    page = 1,
  } = settings;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBySource(source, page, limit);
        const list = data?.products || data?.data || data?.items || [];
        if (mounted) setItems(list);
      } catch (e) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [source, page, limit]);

  if (loading) {
    return (
      <section className="container mx-auto px-4 my-6">
        <div className="h-8 w-40 bg-gray-100 animate-pulse rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: Math.min(8, limit) }).map((_, i) => (
            <div key={i} className="h-40 md:h-56 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="container mx-auto px-4 my-6">
      {title && <h2 className="text-xl md:text-2xl font-bold text-primary mb-3">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((p) => (
          <Link
            to={`/product/${p.slug}`}
            key={p._id || p.slug}
            className="no-underline bg-white rounded shadow-sm hover:shadow-md transition p-2"
          >
            <img
              src={p.thumbnail || p.image || p.images?.[0]?.url || "/placeholder.png"}
              alt={p.title}
              className="w-full h-36 md:h-48 object-cover rounded"
              loading="lazy"
            />
            <div className="mt-2">
              <div className="text-sm md:text-base text-secondary line-clamp-2">{p.title}</div>
              {p.price != null && (
                <div className="text-primary font-semibold mt-1">Rs.{p.price}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ProductGridSection;
