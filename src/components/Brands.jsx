import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllBrands } from '../functions/brand';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

const Brands = React.memo(() => {
    const [brands, setBrands] = useState([]);
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

    // Memoized gradient style to avoid per-item object recreation
    const ringStyle = useMemo(() => ({
        background: 'conic-gradient(from 270deg, var(--color-primary, #5a67d8), var(--color-secondary, #3182ce), var(--color-primary, #5a67d8))'
    }), []);

    // Lightweight CSS fade/slide in for the container
    const containerClasses = useMemo(() => (
        `flex items-center space-x-4 md:space-x-5 lg:space-x-8 overflow-x-auto overflow-y-visible scrollbar-hide px-4 md:px-6 lg:px-8 py-2 transition-all duration-500 ease-out ` +
        (inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')
    ), [inView]);

    const renderBrands = useMemo(() => {
        if (error) {
            return (
                <div className="text-center text-red-500 py-4">
                    {error}
                </div>
            );
        }

        return brands?.map((brand, index) => (
            <div
                key={brand._id || index}
                className="flex flex-col items-center flex-shrink-0 transition-transform duration-200 ease-out md:hover:scale-[1.01] origin-center overflow-visible py-2 transform-gpu"
            >
                <Link
                    to={`/brand/${brand?.slug}`}
                    className="rounded-full group overflow-visible"
                >
                    <div className="relative rounded-full overflow-visible">
                        {/* Gradient ring wrapper with padding; spins on hover (desktop) */}
                        <div
                            className="w-16 md:w-20 lg:w-28 h-16 md:h-20 lg:h-28 rounded-full p-[2px] md:group-hover:animate-[spin_3s_linear_infinite]"
                            style={ringStyle}
                        >
                            {/* Inner white circle holds the logo; clipped cleanly with small insets */}
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                                <img
                                    src={brand?.logo}
                                    alt={brand.name}
                                    loading="lazy"
                                    decoding="async"
                                    sizes="(min-width: 1024px) 112px, (min-width: 768px) 80px, 56px"
                                    width={88}
                                    height={88}
                                    onError={handleImageError}
                                    className="block w-[54px] h-[54px] md:w-[70px] md:h-[70px] lg:w-[86px] lg:h-[86px] object-contain rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </Link>
                <span
                    className="mt-2 text-sm uppercase font-semibold text-gray-700 text-center"
                >
                    {brand.name}
                </span>
            </div>
        ));
    }, [brands, error, handleImageError, ringStyle]);

    return (
        <div ref={ref} className="w-full py-3 md:py-4 overflow-visible">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <h2 className="text-2xl md:text-4xl font-extrabold font-space text-secondary text-center mb-5 md:mb-7">
                    Top Brands
                </h2>
            </div>

            <div 
                className={containerClasses}
            >
                {renderBrands}
            </div>
        </div>
    );
});

Brands.displayName = 'Brands';

export default Brands;