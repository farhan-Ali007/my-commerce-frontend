import React, { useRef, useEffect, useState } from "react";
import { filterByCategory } from "../functions/search";
import ProductCard from "./cards/ProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";
import { Link } from "react-router-dom";

const ShowcaseCategories = ({
  categorySlug,
  categoryName,
  categoryImage ,
  limit = 8,
}) => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProducts([]);
      try {
        const res = await filterByCategory({
          categories: categorySlug,
          page: 1,
          limit,
        });
        setProducts(res?.products || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [categorySlug, limit]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="w-full max-w-screen-xl mx-auto px-1 md:px-8 py-4 md:py-0">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch min-h-[300px] md:min-h-[400px]">
        {/* Left: Category Name and Static Image */}
        <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center md:items-center justify-center md:justify-center mb-2 md:mb-0 h-full gap-4 md:gap-0 px-2 md:px-0">
          <Link className="no-underline flex-1 md:flex-none max-w-[50%] md:max-w-none" to={`/category/${categorySlug}`}> 
            <h2 className="text-lg md:text-2xl font-bold text-secondary font-space mb-0 md:mb-4 text-center md:text-left md:ml-4 block truncate">
              {categoryName}
            </h2>
          </Link>
          <img
            src={categoryImage}
            alt={categoryName}
            className="block w-16 h-16 md:w-auto md:max-w-[300px] md:h-auto md:max-h-[380px] lg:w-[300px] lg:h-[380px] md:object-contain lg:object-cover md:bg-transparent lg:bg-gray-100 self-center md:ml-2 rounded shadow-none  flex-shrink-0"
            loading="lazy"
            decoding="async"
            width={300}
            height={380}
          />
        </div>
        {/* Right: Horizontally Scrollable Products */}
        <div className="w-full md:w-3/4 flex flex-col h-full justify-center self-center md:mt-24 md:mb-8">
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide w-full px-2 md:px-0"
          >
            <div className="flex flex-row gap-3">
              {loadingProducts ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="w-[calc(50%-6px)] md:w-60 flex-shrink-0">
                    <ProductCardSkeleton />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} className="w-[calc(50%-6px)] md:w-60 flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8 w-full">
                  No products found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseCategories;
