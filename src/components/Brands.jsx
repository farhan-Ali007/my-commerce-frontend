import React, { useEffect, useState } from 'react';
import { getAllBrands } from '../functions/brand';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Brands = () => {
    const [brands, setBrands] = useState([]);

    const fetchBrands = async () => {
        try {
            const response = await getAllBrands();
            setBrands(response?.brands);
        } catch (error) {
            console.log("Error in fetching brands", error);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // Detect when the section comes into view
    const { ref, inView } = useInView({
        triggerOnce: true,  // Animates only once
        threshold: 0.2,  // Trigger when 20% of the section is visible
    });

    return (
        <div ref={ref} className="container mx-auto px-2 md:px-0 lg:px-8 py-3 md:py-4">
            <h2 className="text-2xl md:text-3xl font-extrabold font-space text-main text-center mb-5">
                Top Brands
            </h2>

            <motion.div 
                className="flex justify-start lg:justify-center space-x-4 md:space-x-5 lg:space-x-8 overflow-x-auto scrollbar-hide px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, ease: "easeOut", staggerChildren: 0.2 }}
            >
                {brands?.map((brand, index) => (
                    <motion.div 
                        key={index} 
                        className="flex flex-col items-center flex-shrink-0"
                        initial={{ opacity: 0, y: 50 }}
                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link to={`/products/${brand?.name}`} className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-pink-500 to-red-500">
                            <div className="w-16 md:w-20 lg:w-28 h-16 md:h-20 lg:h-28 bg-white rounded-full flex items-center justify-center">
                                <img
                                    src={brand?.logo}
                                    alt={brand.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevents infinite loop
                                        e.target.src = '/images/placeholder.png'; // Placeholder image
                                    }}
                                    className="w-14 md:w-18 lg:w-22 h-14 md:h-18 lg:h-22 object-contain rounded-full"
                                />
                            </div>
                        </Link>
                        <span className="mt-2 text-sm uppercase font-semibold text-gray-700 text-center">
                            {brand.name}
                        </span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Brands;
