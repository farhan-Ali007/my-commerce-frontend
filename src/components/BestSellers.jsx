import React, { useEffect, useState } from 'react';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';
import { getBestSellers } from '../functions/product';
import Pagination from './Pagination';

const BestSellers = () => {

    const [loading, setLoading] = useState(true);
    const [bestSellers, setBestSellers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const productsPerPage = 5;


    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchProducts(pageNumber);
    };

    const fetchBestSellers = async () => {
        try {
            setLoading(true);
            const response = await getBestSellers();
            // console.log("Reponse of best sellers---------->", response?.products)
            setBestSellers(response?.products);
            setTotalPages(response?.totalPages || 0);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log("Error fetching best sellers:", error);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        fetchBestSellers()
    }, []);

    return (
        <div className="max-w-screen-xl mx-auto px-2 md:px-4 lg:px-4 my-4">
            <h1 className="text-main text-center font-space text-3xl md:text-4xl font-extrabold px-5 mb-8 underline decoration-4 underline-offset-8">Best Sellers</h1>

            {/* Product Cards */}
            {
                loading ? (
                    <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-6">
                        {/* Render Skeleton Loader */}
                        {[...Array(productsPerPage)].map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-6 mx-0 md:mx-4 lg:mx-4">
                        {bestSellers?.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )
            }
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default BestSellers;
