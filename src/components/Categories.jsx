import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../functions/categories';
import CategorySkeleton from './skeletons/CategorySkeleton';
import { motion } from 'framer-motion';

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

    // Optimized animation variants - Keeping only hover animations and removing others

    const imageHoverVariants = useMemo(() => ({
        hover: {
            scale: 1.1,
            rotate: [0, -2, 2, -2, 0],
            transition: {
                scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                },
                rotate: {
                    duration: 0.5,
                    ease: "easeInOut"
                }
            }
        }
    }), []);


    // Memoize the category list rendering
    const renderCategories = useMemo(() => {
        if (loading) {
            return Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                            duration: 0.3,
                            delay: index * 0.1
                        }
                    }}
                    className="will-change-transform"
                >
                    <CategorySkeleton />
                </motion.div>
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
            <motion.div
                key={category._id || index}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }} // Simple scale hover for item

            >
                <Link to={`/category/${category.slug}`} className="relative w-full cursor-pointer group">
                    <motion.div
                        className="w-20 h-20 overflow-hidden rounded-lg shadow-md md:h-24 md:w-24 lg:h-36 lg:w-36"
                        variants={imageHoverVariants}
                        whileHover="hover"
                    >
                        <motion.img
                            src={category?.Image}
                            alt={category?.name}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            width={144}
                            height={144}
                            whileHover={{ scale: 1.2 }} // Existing image scale hover
                            transition={{ duration: 0.3 }} // Existing image transition
                        />
                    </motion.div>
                </Link>

                <motion.span
                    className="mt-2 text-sm font-medium text-center capitalize font-poppins md:block"
                    whileHover={{ opacity: 1, y: -3 }} // Simple opacity and slight y hover for text
                >
                    {category?.name}
                </motion.span>
            </motion.div>
        ));
    }, [categories, loading, error, imageHoverVariants]); // Removed other variant dependencies

    return (
        <div className="max-w-screen-xl px-6 py-2 mx-auto overflow-hidden md:py-4 md:px-14">
            <h2
                className="mb-5 text-2xl font-extrabold text-center md:text-4xl font-space text-secondary"
            >
                Browse Categories
            </h2>

            <div
                className="grid grid-cols-4 gap-4 md:gap-2 md:grid-cols-7 lg:grid-cols-7"
            >
                {renderCategories}
            </div>
        </div>
    );
});

Categories.displayName = 'Categories';

export default React.memo(Categories);