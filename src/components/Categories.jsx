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
            return (
                <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-4 md:gap-2">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <CategorySkeleton key={idx} />
                    ))}
                </div>
            );
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
                className="flex flex-col items-center transform transition-transform duration-300 ease-out motion-safe:md:hover:-translate-y-1"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '144px 184px' }}
            >
                <Link to={`/category/${category.slug}`} className="relative w-full cursor-pointer group">
                    <div className="relative w-20 h-20 overflow-hidden rounded-lg shadow-md md:h-24 md:w-24 lg:h-36 lg:w-36 transition-shadow duration-300 ease-out md:group-hover:shadow-lg">
                        <img
                            src={getOptimizedImageUrl(category?.Image, 144, 144)}
                            srcSet={[
                                `${getOptimizedImageUrl(category?.Image, 80, 80)} 80w`,
                                `${getOptimizedImageUrl(category?.Image, 96, 96)} 96w`,
                                `${getOptimizedImageUrl(category?.Image, 144, 144)} 144w`,
                            ].join(', ')}
                            sizes="(min-width: 1024px) 144px, (min-width: 768px) 96px, 80px"
                            alt={category?.name}
                            className="object-cover w-full h-full transform transition-transform duration-300 ease-in-out motion-safe:md:group-hover:scale-105 md:group-hover:brightness-105"
                            loading="lazy"
                            decoding="async"
                            fetchpriority="low"
                            width={144}
                            height={144}
                        />
                        {/* Gradient moving border on hover (desktop only) */}
                        <div
                            className="pointer-events-none absolute inset-0 rounded-lg p-[2px] opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                background: 'conic-gradient(from 270deg, var(--color-primary, #5a67d8), var(--color-secondary, #3182ce), var(--color-primary, #5a67d8))',
                                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude'
                            }}
                        >
                            <div className="w-full h-full rounded-[8px] bg-transparent md:group-hover:animate-[spin_2s_linear_infinite]" />
                        </div>
                    </div>
                </Link>

                <span className="mt-2 text-sm font-medium text-center capitalize font-poppins md:block transition-all duration-300 ease-out md:group-hover:opacity-90">
                    {category?.name}
                </span>
            </div>
        ));
    }, [categories, loading, error, getOptimizedImageUrl]);

    return (
        <div className="max-w-screen-xl px-6 py-2 mx-auto overflow-hidden md:py-4 md:px-14">
            <h2
                className="mb-5 text-2xl font-extrabold text-center md:text-4xl font-space text-secondary"
            >
                Browse Categories
            </h2>

            <div
                className="grid grid-cols-4 gap-4 md:gap-3 lg:gap-5 xl:gap-6 md:grid-cols-7 lg:grid-cols-7"
            >
                {renderCategories}
            </div>
        </div>
    );
});

Categories.displayName = 'Categories';

export default React.memo(Categories);