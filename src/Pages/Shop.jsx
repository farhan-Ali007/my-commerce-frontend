import React, { useEffect, useState } from "react";
import ShopCard from "../components/cards/ShopCard";
import { getAllCategories } from "../functions/categories";
import { getAllProducts } from "../functions/product";
import { getAllBrands } from '../functions/brand';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import {
    filterByCategory,
    filterByPrice,
    filterByRating,
    filterProductsByBrand,
    getMinMaxPrice,
    filterByPriceRange
} from "../functions/search";

const Shop = () => {
    const [priceFilter, setPriceFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [minPrice, setMinPrice] = useState(100);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [brandFilter, setBrandFilter] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [brands, setBrands] = useState([]);

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

    // Fetch products based on filters
    const fetchFilteredProducts = async () => {
        setLoading(true);
        try {
            let filteredProducts = [];

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
    }, [priceFilter, categoryFilter, ratingFilter, brandFilter, minPrice, maxPrice]);

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPriceFilter(value);
        setCategoryFilter([]);
        setRatingFilter(null);
        setBrandFilter(null);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setCategoryFilter(value ? [value] : []);
        setPriceFilter("");
        setRatingFilter(null);
        setBrandFilter(null);
    };

    const handleRatingChange = (e) => {
        const value = Number(e.target.value);
        setRatingFilter(prev => (prev === value ? null : value));
        setPriceFilter("");
        setCategoryFilter([]);
        setBrandFilter(null);
    };

    const handlePriceRangeChange = (value) => {
        setPriceRange(value);
        setMinPrice(value[0]);
        setMaxPrice(value[1]);
        setPriceFilter("");
        setCategoryFilter([]);
        setRatingFilter(null);
        setBrandFilter(null);
    };

    const handleBrandChange = (e) => {
        const value = e.target.value;
        setBrandFilter(prev => (prev === value ? null : value));
        setRatingFilter(null);
        setPriceFilter("");
        setCategoryFilter([]);
    };

    return (
        <div className="max-w-screen mx-2 md:mx-5 flex flex-col md:flex-row">
            {/* Sidebar Filters */}
            <div className="w-full h-full md:w-1/4 mt-0 md:mt-3 px-4 py-2 md:py-4 shadow-md mb-0 md:mb-2 lg:mb-2">
                {/* Price Range Filter */}
                <div className="mb-2 md:mb-3 w-full hidden md:block">
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
                        {/* <button
                                onClick={applyPriceRangeFilter}
                                className="mt-2 w-auto bg-main bg-opacity-70 text-white rounded-lg p-2 hover:bg-opacity-90"
                            >
                                Filter
                            </button> */}
                    </div>
                </div>
                <div className="flex md:flex-col gap-2 items-center md:items-start">
                    {/* Sort Filter */}
                    <div className="mb-2 md:mb-3 w-1/2 md:w-full">
                        <h4 className="text-lg font-bold mb-1 font-space">Sort By Price</h4>
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
                        <h4 className="text-lg font-bold mb-2 font-space">Filter By Category</h4>
                        <select
                            value={categoryFilter[0] || ""}
                            onChange={handleCategoryChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories?.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-2 md:mb-3">
                    <h4 className="text-lg font-bold mb-2 font-space">Filter By Brand</h4>

                    {/* Grid layout for brands (hidden on mobile, visible on md and larger screens) */}
                    <div className="hidden md:grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
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

                    {/* Dropdown for brands (visible only on mobile screens) */}
                    <div className="md:hidden">
                        <select
                            value={brandFilter || ""}
                            onChange={handleBrandChange}
                            className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none"
                        >
                            <option value="" disabled>Select Brand</option>
                            {brands?.map((brand) => (
                                <option key={brand._id} value={brand.name}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Rating Filter (Hidden on Small, Visible on md & lg) */}
                <div className="mb-2 hidden md:block">
                    <h4 className="text-lg font-medium font-space">Filter By Rating</h4>
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

                {/* Rating Dropdown (Visible Only on Small Screens) */}
                <div className="mb-3 md:hidden">
                    <h4 className="text-lg font-medium font-space mb-1">Rating</h4>
                    <select
                        value={ratingFilter || ""}
                        onChange={handleRatingChange}
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none"
                    >
                        <option value="" disabled>All Ratings</option>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} Stars
                            </option>
                        ))}
                    </select>
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

export default Shop;