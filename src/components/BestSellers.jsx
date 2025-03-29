import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';
import { getBestSellers } from '../functions/product';

const BestSellers = () => {
    const [loading, setLoading] = useState(true);
    const [bestSellers, setBestSellers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const productsPerPage = 6;

    const fetchBestSellers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getBestSellers(page, productsPerPage);
            if (response?.products) {
                setBestSellers((prev) => [...prev, ...response.products]); // Append new products
                setTotalPages(response?.totalPages || 0);
            }
            setLoading(false);
        } catch (error) {
            console.log("Error fetching best sellers:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const loadMoreProducts = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchBestSellers(currentPage + 1);
        }
    };
    const buttonVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        hover: {
            scale: 1.05,
            //  backgroundColor: '#0286DD',
            transition: { duration: 0.3 }
        },
        tap: { scale: 0.95 },
    };


    return (
        <div className="max-w-screen-xl mx-auto px-2 md:px-4 lg:px-4 my-4">
            <h1 className="text-main text-center font-space text-3xl md:text-4xl font-extrabold px-5 mb-8 underline decoration-4 underline-offset-8">
                Best Sellers
            </h1>

            {/* Product Cards */}
            {loading && currentPage === 1 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-6">
                    {[...Array(productsPerPage)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-6 mx-0 md:mx-4 lg:mx-4"
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
            )}

            {/* Load More Button */}
            {currentPage < totalPages && (
                <div className="flex justify-center mt-6">
                    <motion.button
                        onClick={loadMoreProducts}
                        className="bg-main opacity-70 hover:opacity-90 text-white px-6 md:px-8 py-2 md:py-4 rounded-sm font-semibold hover:bg-opacity-90 transition-all"
                        variants={buttonVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileHover="hover"
                        whileTap="tap"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        Load More
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default BestSellers;
