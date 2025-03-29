import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { getAllProducts } from '../functions/product';
import ProductCard from './cards/ProductCard';
import ProductCardSkeleton from './skeletons/ProductCardSkeleton';

const NewArrivals = () => {
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
        setCurrentPage(pageNumber);
        fetchProducts(pageNumber);
    };

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    // Custom Arrow Components
    const CustomPrevArrow = (props) => (
        <button
            {...props}
            className="absolute left-0 top-[40%] transform -translate-y-1/2 bg-main opacity-70 text-white p-2 rounded-full z-10 hover:opacity-90"
        >
            <FaArrowLeft />
        </button>
    );

    const CustomNextArrow = (props) => (
        <button
            {...props}
            className="absolute right-0 top-[40%] transform -translate-y-1/2 bg-main opacity-70 text-white p-2 rounded-full z-10 hover:opacity-90"
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
        slidesToShow: 6, // Number of products to show at once
        slidesToScroll: 2,
        prevArrow: <CustomPrevArrow />, // Custom previous arrow
        nextArrow: <CustomNextArrow />, // Custom next arrow
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

    return (
        <div className="w-full overflow-hidden px-1 md:px-4 lg:px-4 mt-4">
            <h1 className="text-main text-center w-full block font-space text-3xl md:text-4xl font-extrabold px-5 mb-4 md:mb-7 underline decoration-4 underline-offset-8">
                New Arrivals
            </h1>

            {/* Product Carousel */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 lg:gap-6">
                    {[...Array(productsPerPage)].map((_, index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="relative overflow-x-auto scrollbar-hide">
                    <Slider {...settings} ref={sliderRef} className='flex'>
                        {products.map((product) => (
                            <div key={product._id} className=" px-2 py-2">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-2 md:mt-6">
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`mx-1 px-3 py-1 rounded-full ${currentPage === index + 1
                            ? 'bg-main text-white'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NewArrivals;