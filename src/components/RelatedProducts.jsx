import React from 'react';
import ProductCard from '../components/cards/ProductCard';
import Pagination from '../components/Pagination';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';

const RelatedProducts = ({ relatedProducts, currentPage, totalPages, onPageChange }) => {
    const products = relatedProducts || [];
    const loading = products.length === 0;


    const productsPerPage = 8;

    if (!products.length) {
        return (
            <h2>No related product</h2>
        )
    }

    return (
        <div className="max-w-screen-xl mx-auto px-0 md:px-4 lg:px-4 mt-4">
            <h1 className="text-main font-space text-3xl md:text-4xl font-extrabold text-center mb-8">
                Related Products
            </h1>

            {/* Product Cards */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-6 lg:gap-6">
                    {[...Array(productsPerPage)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-5 lg:gap-6 pb-6">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}

            {/* Pagination Component */}
            {/* <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            /> */}
        </div>
    );
};

export default RelatedProducts;
