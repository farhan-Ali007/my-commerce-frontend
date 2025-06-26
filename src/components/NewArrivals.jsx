import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { getNewArrivals } from '../functions/product';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';
import { motion } from 'framer-motion';

const NewArrivals = React.memo(() => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sliderRef = useRef(null);

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

    const productsPerPage = 8;

    const fetchProducts = useCallback(async (page) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getNewArrivals(page, productsPerPage);
            setProducts(data?.products || []);
            setTotalPages(data?.totalPages || 0);
        } catch (error) {
            console.error("Error fetching products", error);
            setError("Failed to load new arrivals. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [productsPerPage]);

    const handlePageChange = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        fetchProducts(pageNumber);
    }, [totalPages, fetchProducts]);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

    const CustomPrevArrow = useCallback((props) => (
        <button
            {...props}
            className="absolute left-0 top-[50%] transform -translate-y-1/2 bg-primary opacity-70 text-secondary hover:text-white p-2 rounded-full z-10 hover:opacity-90"
            aria-label="Previous slide"
        >
            <FaArrowLeft />
        </button>
    ), []);

    const CustomNextArrow = useCallback((props) => (
        <button
            {...props}
            className="absolute right-0 top-[50%] transform -translate-y-1/2 bg-primary opacity-70 text-secondary hover:text-white p-2 rounded-full z-10 hover:opacity-90"
            aria-label="Next slide"
        >
            <FaArrowRight />
        </button>
    ), []);

    const settings = useMemo(() => ({
        dots: false,
        infinite: false,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 5,
        slidesToScroll: 2,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
        ],
    }), [CustomPrevArrow, CustomNextArrow]);

    const getVisiblePages = useCallback(() => {
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        return Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
        );
    }, [currentPage, totalPages]);

    const renderSkeletons = useMemo(() => (
        <div className="relative overflow-x-auto scrollbar-hide">
            <div className="flex" style={{ width: 'max-content' }}>
                {Array.from({ length: productsPerPage }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 px-2 py-2 md:px-3" style={{ width: '250px' }}>
                        <ProductCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    ), [productsPerPage]);

    const renderPagination = useMemo(() => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center mt-6 mb-4 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                        currentPage === 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-secondary hover:bg-primary'
                    }`}
                    aria-label="Previous page"
                >
                    <FaChevronLeft />
                </button>

                {getVisiblePages().map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentPage === page
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                        currentPage === totalPages 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-secondary hover:bg-primary'
                    }`}
                    aria-label="Next page"
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    }, [currentPage, totalPages, handlePageChange, getVisiblePages]);

    if (error) {
        return (
            <div className="w-full py-8 text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full px-1 mt-4 overflow-hidden md:px-4 lg:px-4">
            {/* Heading with lines */}
            <motion.div 
                className="flex items-center justify-center w-full px-5 mb-4 md:mb-7"
                variants={headingVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
            >
                <div className="flex-grow h-[0.5px] mr-4 bg-primary"></div>
                <h1 className="text-2xl font-extrabold text-center text-secondary font-space md:text-4xl whitespace-nowrap">
                    New Arrivals
                </h1>
                <div className="flex-grow h-[0.5px] ml-4 bg-primary"></div>
            </motion.div>

            {loading ? (
                renderSkeletons
            ) : (
                <div className="relative overflow-x-auto scrollbar-hide">
                    <Slider {...settings} ref={sliderRef} className="flex">
                        {products.map((product) => (
                            <div key={product._id} className="px-2 py-2 md:px-3">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {renderPagination}
        </div>
    );
});

NewArrivals.displayName = 'NewArrivals';

export default NewArrivals;