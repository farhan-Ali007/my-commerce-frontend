import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ShopCard from "../components/cards/ShopCard";
import { getAllCategories } from "../functions/categories";
import { getAllBrands } from '../functions/brand';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { IoFilter, IoChevronDown } from "react-icons/io5";
import {
    filterByCategory,
    filterByPrice,
    filterByRating,
    filterBySubcategory,
    filterProductsByBrand,
    getMinMaxPrice,
    filterByPriceRange
} from "../functions/search";
import FilterDrawer from "../components/drawers/FilterDrawer";

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

    const toggleFilterDrawer = () => {
        setIsFilterOpen(!isFilterOpen);
    };
    
    const toggleSortDropdown = () => {
        setIsSortOpen(!isSortOpen);
    };

    const handleSortSelection = (value) => {
        setPriceFilter(value);
        setIsSortOpen(false);
    };

    // Fetch all categories
    const fetchAllCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response?.categories || []);
        } catch (error) {
            console.log("Error in fetching all categories", error);
        }
    };

    // Fetch all brands
    const fetchAllBrands = async () => {
        try {
            const response = await getAllBrands();
            setBrands(response?.brands || []);
        } catch (error) {
            console.log("Error in fetching all brands", error);
        }
    };

    // Fetch min and max price on component mount
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

    // Fetch categories and brands on component mount
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

    // Fetch products based on filters
    const fetchFilteredProducts = async () => {
        setLoading(true);
        try {
            let filteredProducts = [];

            if (subcategorySlug) {
                const subcategoryProducts = await filterBySubcategory(subcategorySlug);
                filteredProducts = subcategoryProducts?.products || [];
                if (!filteredProducts || filteredProducts.length === 0) {
                    filteredProducts = [];
                }
            }
            
            if (!priceFilter && categoryFilter.length === 0 && !ratingFilter && !brandFilter && !minPrice && !maxPrice) {
                const allProductsResponse = await getAllProducts();
                filteredProducts = allProductsResponse?.products || [];
            } else {
                if (priceFilter) {
                    const priceResponse = await filterByPrice({ price: priceFilter });
                    filteredProducts = priceResponse?.products || [];
                }
                if (categoryFilter.length > 0) {
                    const categoryResponse = await filterByCategory({ categories: categoryFilter });
                    filteredProducts = filteredProducts.length
                        ? filteredProducts.filter((product) =>
                            categoryResponse.products.some((p) => p._id === product._id)
                        )
                        : categoryResponse?.products || [];
                }
                if (ratingFilter > 0) {
                    const ratingResponse = await filterByRating({ rating: ratingFilter });
                    filteredProducts = filteredProducts.length
                        ? filteredProducts.filter((product) =>
                            ratingResponse.products.some((p) => p._id === product._id)
                        )
                        : ratingResponse?.products || [];
                }
                if (brandFilter) {
                    const brandResponse = await filterProductsByBrand(brandFilter);
                    filteredProducts = filteredProducts.length
                        ? filteredProducts.filter((product) =>
                            brandResponse.products.some((p) => p._id === product._id)
                        )
                        : brandResponse?.products || [];
                }
                if (minPrice && maxPrice) {
                    const priceRangeResponse = await filterByPriceRange({ min: minPrice, max: maxPrice });
                    filteredProducts = filteredProducts.length
                        ? filteredProducts.filter((product) =>
                            priceRangeResponse.products.some((p) => p._id === product._id)
                        )
                        : priceRangeResponse?.products || [];
                }
            }

            setProducts(filteredProducts);
        } catch (error) {
            console.log("Error in fetching filtered products", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when filters change
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
                <div className="relative flex-1 mt-2">
                    <button
                        onClick={toggleSortDropdown}
                        className="w-[40%] flex items-center bg-main justify-between border border-gray-200 px-2 py-2 text-white focus:outline-none"
                    >
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                            SORT
                        </span>
                        <IoChevronDown className={`transition-transform ${isSortOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    
                    {isSortOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg">
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
                    className="flex items-center gap-1 bg-main text-white px-3 mt-2 py-2"
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
            <div className="hidden md:block w-full h-full md:w-1/4 mt-0 md:mt-3 px-4 py-2 md:py-4 shadow-md mb-0 md:mb-2 lg:mb-2">
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
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-2 md:mb-3 w-full">
                    <h4 className="text-lg font-bold mb-2 font-space text-main">Filter By Brand</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {brands?.map((brand) => (
                            <label key={brand._id} className="flex items-center">
                                <input
                                    type="radio"
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
                                type="radio"
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
            <div className="w-full md:w-3/4 p-1 md:p-4 lg:p-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <div className="max-w-screen-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ShopCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="text-gray-500">No products found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;