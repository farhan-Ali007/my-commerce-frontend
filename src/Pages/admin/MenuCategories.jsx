import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategories } from '../../functions/categories';
import { setSelectedCategories } from '../../store/selectedCategoriesSlice';

const MenuCategories = () => {
    const [categories, setCategories] = useState([]);
    const selectedCategories = useSelector((state) => state.selectedCategories.selectedCategories);
    const dispatch = useDispatch();
    console.log("Selected categories----->" , categories)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategorySelect = (category) => {
        const isSelected = selectedCategories.some((cat) => cat._id === category._id);
        if (isSelected) {
            dispatch(setSelectedCategories(selectedCategories.filter((cat) => cat._id !== category._id)));
        } else {
            dispatch(setSelectedCategories([...selectedCategories, category]));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 px-6 py-3">
            <h1 className="text-2xl md:text-3xl text-main font-bold text-center mb-6">
                Select Categories for Navbar
            </h1>
            <h2 className="text-lg text-gray-600 text-center mb-4">
                {selectedCategories.length} categories selected
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <div
                        key={category._id}
                        className={`relative bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform transform hover:scale-105 ${selectedCategories.some((cat) => cat._id === category._id)
                            ? 'border-2 border-blue-500'
                            : 'border-2 border-transparent'
                            }`}
                        onClick={() => handleCategorySelect(category)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedCategories.some((cat) => cat._id === category._id)}
                            onChange={() => handleCategorySelect(category)}
                            className="hidden"
                        />
                        <AnimatePresence>
                            {selectedCategories.some((cat) => cat._id === category._id) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1"
                                >
                                    <FaCheckCircle className="text-blue-500 text-2xl" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <img
                            src={category?.Image}
                            alt={category?.name}
                            className="w-full h-32 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-xl font-semibold text-center">{category.name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuCategories;
