import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';
import { getBestSellers } from '../functions/product';

const BestSellers = React.memo(() => {
    const [loading, setLoading] = useState(true);
    const [bestSellers, setBestSellers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const productsPerPage = 10;

    const headingVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8,
                ease: "easeOut"
            }
        }
    }), []);

    const fetchBestSellers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getBestSellers(page, productsPerPage);
            if (response?.products) {
                if (page === 1) {
                    // For the first page, replace the entire list
                    setBestSellers(response.products);
                } else {
                    // For subsequent pages (Load More), append to the list
                    setBestSellers((prev) => [...prev, ...response.products]);
                }
                setTotalPages(response?.totalPages || 0);
            }
        } catch (error) {
            console.error("Error fetching best sellers:", error);
            setError("Failed to load best sellers. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [productsPerPage]);

    useEffect(() => {
        // Ensure the initial fetch explicitly requests page 1
        fetchBestSellers(1);
    }, [fetchBestSellers]);

    const loadMoreProducts = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchBestSellers(currentPage + 1);
        }
    }, [currentPage, totalPages, fetchBestSellers]);

    const buttonVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        hover: {
            scale: 1.05,
            transition: { duration: 0.3 }
        },
        tap: { scale: 0.95 },
    }), []);

    const renderSkeletons = useMemo(() => (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-6 lg:gap-6">
            {Array.from({ length: productsPerPage }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    ), [productsPerPage]);

    const renderProducts = useMemo(() => (
        <motion.div
            className="grid grid-cols-2 gap-3 mx-0 md:grid-cols-3 lg:grid-cols-5 md:gap-6 lg:gap-7 md:mx-4 lg:mx-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {bestSellers.map((product, index) => (
                <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </motion.div>
    ), [bestSellers]);

    const renderLoadMoreButton = useMemo(() => {
        if (currentPage >= totalPages) return null;

        return (
            <div className="flex justify-center mt-6">
                <motion.button
                    onClick={loadMoreProducts}
                    className="px-6 py-2 font-semibold text-secondary transition-all rounded-sm bg-primary opacity-70 hover:opacity-90 md:px-8 md:py-4 hover:bg-opacity-90"
                    variants={buttonVariants}
                    initial="hidden"
                    whileInView="visible"
                    whileHover="hover"
                    whileTap="tap"
                    viewport={{ once: true, amount: 0.2 }}
                    aria-label="Load more products"
                >
                    Load More
                </motion.button>
            </div>
        );
    }, [currentPage, totalPages, loadMoreProducts, buttonVariants]);

    if (error) {
        return (
            <div className="max-w-screen-xl px-2 mx-auto my-4 md:px-4 lg:px-4">
                <h2 className="px-5 mb-8 text-2xl font-extrabold text-center text-main font-space md:text-4xl">
                    Best Sellers
                </h2>
                <div className="py-8 text-center text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl px-2 mx-auto my-4 md:px-4 lg:px-4">
            {/* Heading with lines */}
            <motion.div 
                className="flex items-center justify-center w-full px-5 mb-8"
                variants={headingVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
            >
                <div className="flex-grow h-[0.5px] mr-4 bg-primary"></div>
                <h2 className="text-2xl font-extrabold text-center text-secondary font-space md:text-4xl whitespace-nowrap">
                    Best Sellers
                </h2>
                <div className="flex-grow h-[0.5px] ml-4 bg-primary"></div>
            </motion.div>

            {loading && currentPage === 1 ? renderSkeletons : renderProducts}
            {renderLoadMoreButton}
        </div>
    );
});

BestSellers.displayName = 'BestSellers';

export default BestSellers;
