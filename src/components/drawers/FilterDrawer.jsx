// components/FilterDrawer.js
import React from 'react';
import Drawer from 'react-modern-drawer';
import { useState } from 'react';
import 'react-modern-drawer/dist/index.css';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { IoIosClose } from "react-icons/io";

const FilterDrawer = ({
    isOpen,
    toggleDrawer,
    categoryFilter,
    handleCategoryChange,
    categories,
    ratingFilter,
    handleRatingChange,
    brandFilter,
    handleBrandChange,
    brands
}) => {

    return (
        <Drawer
            open={isOpen}
            onClose={toggleDrawer}
            direction='left'
            size={300}
            className='h-screen !z-[1200] p-4 overflow-y-auto '
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-main">Filters</h2>
                <button
                    onClick={toggleDrawer}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <IoIosClose size={30} className="font-extrabold text-main" />
                </button>
            </div>
            {/* Category Filter */}
            <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-space text-main">By Category</h4>
                <div className="space-y-2">
                    {categories?.map((cat) => (
                        <label key={cat._id} className="flex items-center capitalize">
                            <input
                                type="radio"
                                name="category"
                                value={cat.name}
                                checked={categoryFilter[0] === cat.name}
                                onChange={handleCategoryChange}
                                className="mr-2"
                            />
                            {cat.name}
                        </label>
                    ))}
                </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-space text-main">By Brand</h4>
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
            <div className="mb-4">
                <h4 className="text-lg font-bold mb-2 font-space text-main">By Rating</h4>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center">
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
        </Drawer>
    );
};

export default FilterDrawer;