import React, { useEffect, useState } from 'react';
import { filterByCategory } from '../functions/search';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';

const ShowcaseCategories = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const categoryName = 'Trimmers and Shavers';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProducts([]);
      try {
        const res = await filterByCategory({ categories: 'trimmers-and-shavers', page: 1, limit: 8 });
        setProducts(res?.products || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="max-w-screen-xl mx-auto px-2 md:px-8 py-8 md:py-14">
      <div className="flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
        {/* Left: Category Name and Static Image */}
        <div className="md:w-1/4 w-full flex flex-col items-center justify-center mb-4 md:mb-0 h-full">
          <h2 className="text-xl md:text-2xl font-bold text-secondary font-space mb-0 md:mb-4 text-center md:text-left">
            {categoryName}
          </h2>
          <img
            src="/category.jpg"
            alt="Categories"
            className="shadow-none hidden md:block hover:shadow-md w-full max-w-[180px] md:max-w-[300px] object-cover h-60 md:h-[400px] bg-gray-100 self-center"
            loading="lazy"
          />
        </div>
        {/* Right: Horizontally Scrollable Products (4 visible on desktop) */}
        <div className="md:w-3/4 w-full flex flex-col h-full justify-center self-center md:mt-24 md:mb-8">
          <div className="relative overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 items-center" style={{ minWidth: '100%' }}>
              {loadingProducts
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="min-w-[50%] max-w-[50%] md:min-w-[25%] md:max-w-[25%] flex-1">
                      <ProductCardSkeleton />
                    </div>
                  ))
                : products.length > 0
                ? products.map((product) => (
                    <div key={product._id} className="min-w-[50%] max-w-[50%] md:min-w-[25%] md:max-w-[25%] flex-1">
                      <ProductCard product={product} />
                    </div>
                  ))
                : (
                  <div className="text-gray-500 text-center py-8">No products found in this category.</div>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseCategories;
