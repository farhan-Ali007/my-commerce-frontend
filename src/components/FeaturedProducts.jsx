import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { getAllProducts } from '../functions/product';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);

    const productsPerPage = 8;

    const fetchProducts = async (page) => {
        setLoading(true);
        try {
            const data = await getAllProducts(page, productsPerPage);
            setProducts(data?.products || []);
            setTotalPages(data?.totalPages || 0);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        fetchProducts(pageNumber);
    };

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    // Custom Arrow Components for Slider
    const CustomPrevArrow = (props) => (
        <button
            {...props}
            className="absolute left-0 top-[50%] transform -translate-y-1/2 bg-main opacity-70 text-white p-2 rounded-full z-10 hover:opacity-90"
        >
            <FaArrowLeft />
        </button>
    );

    const CustomNextArrow = (props) => (
        <button
            {...props}
            className="absolute right-0 top-[50%] transform -translate-y-1/2 bg-main opacity-70 text-white p-2 rounded-full z-10 hover:opacity-90"
        >
            <FaArrowRight />
        </button>
    );

    // React Slick settings
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 6,
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
    };

    // Calculate visible page numbers
    const getVisiblePages = () => {
        const visiblePages = [];
        const maxVisible = 5; // Maximum number of visible page buttons
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage + 1 < maxVisible) {
                startPage = endPage - maxVisible + 1;
            }
            
            for (let i = startPage; i <= endPage; i++) {
                visiblePages.push(i);
            }
        }
        
        return visiblePages;
    };

    return (
        <div className="w-full overflow-hidden px-1 md:px-4 lg:px-4 mt-4">
            <h1 className="text-main text-center w-full block font-space text-3xl md:text-4xl font-extrabold px-5 mb-4 md:mb-7">
                Trending Products
            </h1>

            {/* Product Carousel */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 lg:gap-6">
                    {[...Array(productsPerPage)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="relative overflow-x-auto scrollbar-hide">
                    <Slider {...settings} ref={sliderRef} className='flex'>
                        {products.map((product) => (
                            <div key={product._id} className="px-2 py-2">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* Improved Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 mb-4 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-main hover:bg-gray-100'}`}
                    >
                        <FaChevronLeft />
                    </button>

                    {getVisiblePages().map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPage === page
                                ? 'bg-main text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-main hover:bg-gray-100'}`}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeaturedProducts;