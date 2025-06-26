import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllBrands } from '../functions/brand';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Brands = React.memo(() => {
    const [brands, setBrands] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [error, setError] = useState(null);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await getAllBrands();
            setBrands(response?.brands || []);
            setError(null);
        } catch (error) {
            console.error("Error in fetching brands", error);
            setError("Failed to load brands. Please try again later.");
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/images/placeholder.png';
    }, []);

    const containerAnimation = useMemo(() => ({
        initial: { opacity: 0, y: 50 },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
        transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.2 }
    }), [inView]);

    const brandAnimation = useMemo(() => ({
        initial: { opacity: 0, y: 50 },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
        transition: { duration: 0.5 }
    }), [inView]);

    const renderBrands = useMemo(() => {
        if (error) {
            return (
                <div className="text-center text-red-500 py-4">
                    {error}
                </div>
            );
        }

        return brands?.map((brand, index) => (
            <motion.div 
                key={brand._id || index} 
                className="flex flex-col items-center flex-shrink-0"
                {...brandAnimation}
                transition={{ ...brandAnimation.transition, delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
            >
                <Link 
                    to={`/products/${brand?.name}`} 
                    className="p-[2px] rounded-full bg-gradient-to-r from-primary via-orange-600 to-secondary"
                >
                    <motion.div 
                        className="w-16 md:w-20 lg:w-28 h-16 md:h-20 lg:h-28 bg-white rounded-full flex items-center justify-center"
                        whileHover={{
                            scale: 1.1,
                            rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                        }}
                        animate={{
                            y: hoveredIndex === index ? -5 : 0,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10,
                        }}
                    >
                        <motion.img
                            src={brand?.logo}
                            alt={brand.name}
                            loading="lazy"
                            width={88}
                            height={88}
                            onError={handleImageError}
                            className="w-14 md:w-18 lg:w-22 h-14 md:h-18 lg:h-22 object-contain rounded-full"
                            whileHover={{
                                scale: 1.05,
                            }}
                            transition={{
                                duration: 0.3,
                            }}
                        />
                    </motion.div>
                </Link>
                <motion.span 
                    className="mt-2 text-sm uppercase font-semibold text-gray-700 hover:text-primary text-center"
                    animate={{
                        color: hoveredIndex === index ? "#000000" : "#374151",
                        scale: hoveredIndex === index ? 1.1 : 1,
                    }}
                    transition={{
                        duration: 0.2,
                    }}
                >
                    {brand.name}
                </motion.span>
            </motion.div>
        ));
    }, [brands, error, hoveredIndex, brandAnimation, handleImageError]);

    return (
        <div ref={ref} className="container mx-auto px-2 md:px-0 lg:px-8 py-3 md:py-4">
            <h2 className="text-2xl md:text-4xl font-extrabold font-space text-secondary text-center mb-5 md:mb-7">
                Top Brands
            </h2>

            <motion.div 
                className="flex justify-start lg:justify-center space-x-4 md:space-x-5 lg:space-x-8 overflow-x-auto scrollbar-hide px-4"
                {...containerAnimation}
            >
                {renderBrands}
            </motion.div>
        </div>
    );
});

Brands.displayName = 'Brands';

export default Brands;