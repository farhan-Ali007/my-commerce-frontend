import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../functions/categories';
import CategorySkeleton from './skeletons/CategorySkeleton';

const Categories = React.memo(() => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAllCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllCategories();
            setCategories(response?.categories || []);
        } catch (error) {
            console.error("Error in fetching all categories", error);
            setError("Failed to load categories. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    // Helper to generate optimized image URLs when remote (e.g., Cloudinary); local paths unchanged
    const getOptimizedImageUrl = useCallback((imageUrl, width, height) => {
        if (!imageUrl) return '';
        if (typeof imageUrl === 'string' && imageUrl.startsWith('/')) return imageUrl;
        const sep = (typeof imageUrl === 'string' && imageUrl.includes('?')) ? '&' : '?';
        return `${imageUrl}${sep}f_auto&q_80&w=${width}&h=${height}&c=fill`;
    }, []);

    // Memoize the category list rendering
    const renderCategories = useMemo(() => {
        if (loading) {
            // Return tiles directly so they use the same outer grid container
            return Array.from({ length: 14 }).map((_, idx) => (
                <CategorySkeleton key={idx} />
            ));
        }

        if (error) {
            return (
                <div className="py-4 text-center text-red-500 col-span-full">
                    {error}
                </div>
            );
        }

        return categories?.slice(0, 14).map((category, index) => (
            <div
                key={category._id || index}
                className="flex flex-col items-center overflow-visible transform transition-transform duration-300 ease-out motion-safe:md:hover:-translate-y-1"
            >
                <Link to={`/category/${category.slug}`} className="relative w-full cursor-pointer group">
                    <div className="relative w-20 h-20 overflow-hidden rounded-lg shadow-sm md:h-24 md:w-24 lg:h-36 lg:w-36 transition-shadow duration-300 ease-out md:group-hover:shadow-[0_0_28px_rgba(17,24,39,0.22)]">
                        <img
                            src={getOptimizedImageUrl(category?.Image, 144, 144)}
                            srcSet={[
                                `${getOptimizedImageUrl(category?.Image, 80, 80)} 80w`,
                                `${getOptimizedImageUrl(category?.Image, 96, 96)} 96w`,
                                `${getOptimizedImageUrl(category?.Image, 144, 144)} 144w`,
                            ].join(', ')}
                            sizes="(min-width: 1024px) 144px, (min-width: 768px) 96px, 80px"
                            alt={category?.name}
                            className="object-cover w-full h-full transform transition-transform duration-300 ease-in-out motion-safe:md:group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            fetchpriority="low"
                            width={144}
                            height={144}
                        />
                    </div>
                </Link>

                <span className="mt-2 text-sm font-medium text-center capitalize font-poppins md:block transition-colors duration-200 ease-out md:group-hover:text-gray-800">
                    {category?.name}
                </span>
            </div>
        ));
    }, [categories, loading, error, getOptimizedImageUrl]);

    return (
        <div className="max-w-screen-xl px-4 py-2 mx-auto overflow-visible md:py-4 md:px-12 lg:px-14">
            <h2
                className="mb-5 text-2xl font-extrabold text-center md:text-4xl font-space text-secondary"
            >
                Browse Categories
            </h2>

            <div
                className="grid grid-cols-4 gap-4 sm:gap2 md:gap-5 lg:gap-5 xl:gap-6 md:grid-cols-7 lg:grid-cols-7 overflow-visible"
            >
                {renderCategories}
            </div>
        </div>
    );
});

Categories.displayName = 'Categories';

export default React.memo(Categories);