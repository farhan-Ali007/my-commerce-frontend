import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoChevronDown, IoFilter } from "react-icons/io5";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import ShopCard from "../components/cards/ShopCard";
import FilterDrawer from "../components/drawers/FilterDrawer";
import { getAllBrands } from '../functions/brand';
import { getAllCategories } from "../functions/categories";
import {
    filterByCategory,
    filterByPrice,
    filterByPriceRange,
    filterByRating,
    filterProductsByBrand,
    filterBySubcategory,
    getMinMaxPrice
} from "../functions/search";

const CategoryPage = () => {
    const { categorySlug, subcategorySlug } = useParams();
    const [priceFilter, setPriceFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(categorySlug ? [categorySlug] : []);
    const [subcategoryFilter, setSubcategoryFilter] = useState(subcategorySlug ? [subcategorySlug] : []);
    const [minPrice, setMinPrice] = useState(100);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [brandFilter, setBrandFilter] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [brands, setBrands] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const toggleFilterDrawer = () => {
        setIsFilterOpen(!isFilterOpen);
    };
    const toggleSortDropdown = () => {
        setIsSortOpen(!isSortOpen);
    };

    const fetchAllCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response?.categories || []);
        } catch (error) {
            console.log("Error in fetching all categories", error);
        }
    };

    const fetchAllBrands = async () => {
        try {
            const response = await getAllBrands();
            setBrands(response?.brands || []);
        } catch (error) {
            console.log("Error in fetching all brands", error);
        }
    };

    useEffect(() => {
        const fetchMinMaxPrice = async () => {
            try {
                const response = await getMinMaxPrice();
                setMinPrice(response.minPrice);
                setMaxPrice(response.maxPrice);
                setPriceRange([response.minPrice, response.maxPrice]);
            } catch (error) {
                console.log("Error in fetching min and max price", error);
            }
        };
        fetchMinMaxPrice();
    }, []);

    useEffect(() => {
        fetchAllCategories();
        fetchAllBrands();
    }, []);

    useEffect(() => {
        if (categorySlug) {
            setCategoryFilter([categorySlug]);
        } else {
            setCategoryFilter([]);
        }

        if (subcategorySlug) {
            setSubcategoryFilter([subcategorySlug]);
        } else {
            setSubcategoryFilter([]);
        }
    }, [categorySlug, subcategorySlug]);

    const fetchFilteredProducts = async (page = 1) => {
        setLoading(true);
        try {
            let response;

            if (subcategorySlug) {
                response = await filterBySubcategory(subcategorySlug, page);
            }
            else if (priceFilter) {
                response = await filterByPrice({ price: priceFilter, page });
            }
            else if (categoryFilter.length > 0) {
                response = await filterByCategory({ categories: categoryFilter, page });
            }
            else if (ratingFilter > 0) {
                response = await filterByRating({ rating: ratingFilter, page });
            }
            else if (brandFilter) {
                response = await filterProductsByBrand(brandFilter, page);
            }
            else if (minPrice && maxPrice) {
                response = await filterByPriceRange({ min: minPrice, max: maxPrice }, page);
            }
            else {
                response = await filterByCategory({ categories: categoryFilter, page });
            }

            setProducts(response?.products || []);
            setTotalPages(response?.totalPages || 0);
            setCurrentPage(response?.currentPage || 1);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const getVisiblePages = () => {
        const visiblePages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }

        return visiblePages;
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        fetchFilteredProducts(pageNumber);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        fetchFilteredProducts(currentPage);
    }, [currentPage]);

    useEffect(() => {
        fetchFilteredProducts();
    }, [priceFilter, categoryFilter, subcategoryFilter, ratingFilter, brandFilter, minPrice, maxPrice]);

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPriceFilter(value);
        setCategoryFilter([]);
        setRatingFilter(null);
        setBrandFilter(null);
        setIsFilterOpen(false);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategoryFilter(value ? [value] : []);
        setPriceFilter("");
        setRatingFilter(null);
        setBrandFilter(null);
        setIsFilterOpen(false);
    };

    const handleRatingChange = (e) => {
        const value = Number(e.target.value);
        setRatingFilter(prev => (prev === value ? null : value));
        setPriceFilter("");
        setCategoryFilter([]);
        setBrandFilter(null);
        setIsFilterOpen(false);
    };

    const handleSortSelection = (value) => {
        setPriceFilter(value);
        setIsSortOpen(false);
    };

    const handlePriceRangeChange = (value) => {
        setPriceRange(value);
        setMinPrice(value[0]);
        setMaxPrice(value[1]);
        setPriceFilter("");
        setCategoryFilter([]);
        setRatingFilter(null);
        setBrandFilter(null);
        setIsFilterOpen(false);
    };

    const handleBrandChange = (e) => {
        const value = e.target.value;
        setBrandFilter(prev => (prev === value ? null : value));
        setRatingFilter(null);
        setPriceFilter("");
        setCategoryFilter([]);
        setIsFilterOpen(false);
    };

    return (
        <div className="max-w-screen mx-2 md:mx-5 flex flex-col md:flex-row">
            {/* Mobile Filter Button */}
            <div className="md:hidden flex justify-between items-center mb-4">
                {/* Sort Filter Dropdown */}
                <div className="relative flex-1 mt-2 justify-center">
                    <button
                        onClick={toggleSortDropdown}
                        className="w-full flex items-center bg-white justify-between border border-gray-200  px-2 py-2 text-main focus:outline-none"
                    >
                        <span className="flex items-center font-semibold gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                            SORT
                        </span>
                        <IoChevronDown className={`transition-transform ${isSortOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isSortOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200  shadow-lg">
                            <button
                                onClick={() => handleSortSelection("low")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Price: Low to High
                            </button>
                            <button
                                onClick={() => handleSortSelection("high")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                Price: High to Low
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={toggleFilterDrawer}
                    className="flex  justify-center items-center w-1/2 gap-2 border font-semibold border-gray-200 bg-white text-main px-3 mt-2 py-2 "
                >
                    <IoFilter size={24} /> Filters
                </button>
            </div>

            {/* Filter Drawer for Mobile */}
            <FilterDrawer
                isOpen={isFilterOpen}
                toggleDrawer={toggleFilterDrawer}
                priceFilter={priceFilter}
                handlePriceChange={handlePriceChange}
                categoryFilter={categoryFilter}
                handleCategoryChange={handleCategoryChange}
                categories={categories}
                priceRange={priceRange}
                handlePriceRangeChange={handlePriceRangeChange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                ratingFilter={ratingFilter}
                handleRatingChange={handleRatingChange}
                brandFilter={brandFilter}
                handleBrandChange={handleBrandChange}
                brands={brands}
            />

            {/* Sidebar Filters (Desktop) */}
            <div className="hidden md:block w-full h-full md:w-[20%] mt-0 md:mt-3 px-4 py-2 md:py-4 shadow-md mb-0 md:mb-2 lg:mb-2">
                {/* Price Range Filter */}
                <div className="mb-2 md:mb-3 w-full text-main">
                    <h4 className="text-lg font-bold mb-1 font-space">Price Range</h4>
                    <div className="flex flex-col justify-start gap-2">
                        <RangeSlider
                            min={100}
                            max={10000}
                            step={100}
                            value={priceRange}
                            onInput={handlePriceRangeChange}
                            className="w-full text-main"
                        />
                        <div className="flex justify-between text-sm">
                            <span>Rs {priceRange[0]}</span>
                            <span>Rs {priceRange[1]}</span>
                        </div>
                    </div>
                </div>
                <div className="flex md:flex-col gap-2 items-center md:items-start">
                    {/* Sort Filter */}
                    <div className="mb-2 md:mb-3 w-1/2 md:w-full">
                        <h4 className="text-lg font-bold mb-1 font-space text-main">Sort By Price</h4>
                        <select
                            value={priceFilter || ""}
                            onChange={handlePriceChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none"
                        >
                            <option value="" disabled>Select</option>
                            <option value="low">Low to High</option>
                            <option value="high">High to Low</option>
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-2 md:mb-3 w-1/2 md:w-full">
                        <h4 className="text-lg font-bold mb-2 font-space text-main">By Category</h4>
                        <select
                            value={categoryFilter[0] || ""}
                            onChange={handleCategoryChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none"
                        >
                            <option value="" disabled>Select</option>
                            {categories?.map((cat) => (
                                <option key={cat._id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-2 md:mb-3 w-full">
                    <h4 className="text-lg font-bold mb-2 font-space text-main">Filter By Brand</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {brands?.map((brand) => (
                            <label key={brand._id} className="text-sm font-semibold text-main/90">
                                <input
                                    type="checkbox"
                                    name="brand"
                                    value={brand.name}
                                    checked={brandFilter === brand.name}
                                    onChange={handleBrandChange}
                                    className="mr-2"
                                />
                                {brand.name}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-2">
                    <h4 className="text-lg font-medium font-space text-main">Filter By Rating</h4>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center mb-1">
                            <input
                                type="checkbox"
                                name="rating"
                                value={rating}
                                checked={ratingFilter === rating}
                                onChange={handleRatingChange}
                                className="mr-2"
                            />
                            <div className="flex">
                                {[...Array(rating)].map((_, index) => (
                                    <svg
                                        key={index}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 text-yellow-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                                    </svg>
                                ))}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Product Display */}
            <div className="w-full md:w-[80%] p-1 md:py-4 pl-1 md:pl-8  px-1 md:px-0">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <>
                        <div className="max-w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <ShopCard key={product._id} product={product} />
                                ))
                            ) : (
                                <p className="text-gray-500">No products found.</p>
                            )}
                        </div>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;