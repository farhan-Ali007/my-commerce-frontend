import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../functions/categories';
import CategorySkeleton from './skeletons/CategorySkeleton';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllCategories = async () => {
        try {
            setLoading(true);
            const response = await getAllCategories();
            setCategories(response?.categories || []);
        } catch (error) {
            console.log("Error in fetching all categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllCategories();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Stagger the animation of children
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const hoverVariants = {
        hover: { scale: 1.1, transition: { duration: 0.3 } },
    };

    return (
        <div className="max-w-screen-xl mx-auto py-2 md:py-4 px-6 md:px-14">
            <h2 className="text-2xl md:text-3xl font-extrabold font-space text-main text-center mb-5">
                Browse Categories
            </h2>

            {/* Grid Layout */}
            <motion.div
                className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-7 gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <CategorySkeleton key={index} />
                    ))
                    : categories?.slice(0, 14).map((category, index) => (
                        <motion.div
                        key={index}
                        className="flex flex-col items-center"
                        variants={itemVariants}
                    >
                        <Link to={`/category/${category.slug}`} className="relative group cursor-pointer w-full">
                            <motion.div
                                className="w-full h-20 md:h-24 lg:h-36 bg-cover bg-center  overflow-hidden shadow-md"
                                style={{ backgroundImage: `url(${category?.Image})` }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)"
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        </Link>
                    
                        <span className="text-sm text-center mt-2 capitalize font-medium font-poppins md:block">
                            {category?.name}
                        </span>
                    </motion.div>
                    
                    ))}
            </motion.div>
        </div>
    );
};

export default Categories;