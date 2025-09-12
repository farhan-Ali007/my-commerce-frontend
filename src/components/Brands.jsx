import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllBrands } from '../functions/brand';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

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

    const ringStyle = useMemo(() => ({
        background: 'conic-gradient(from 270deg, var(--color-primary, #5a67d8), var(--color-secondary, #3182ce), var(--color-primary, #5a67d8))'
    }), []);

    const containerClasses = useMemo(() => (
        `px-4 md:px-6 lg:px-8 py-2 transition-all duration-500 ease-out ` +
        (inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')
    ), [inView]);

    const sliderSettings = useMemo(() => {
        // Desired slides per breakpoint
        const base = 8;
        const bp1280 = 7;
        const bp1024 = 6;
        const bp768  = 5;
        const bp640  = 3;
        const bp480  = 3;

        // If data is fewer than desired at any point, infinite can be disabled by slick.
        // We force infinite by reducing slidesToShow by 1 when equal to count.
        const count = brands?.length || 0;
        const calcShow = (desired) => {
            if (count <= 1) return 1;
            if (count > desired) return desired;
            if (count === desired) return Math.max(1, desired - 1); // allow looping
            return count; // fewer than desired
        };

        return {
            infinite: count > 1,
            autoplay: true,
            autoplaySpeed: 2500,
            pauseOnHover: true,
            speed: 450,
            arrows: true,
            dots: false,
            swipeToSlide: true,
            slidesToScroll: 1,
            slidesToShow: calcShow(base),
            nextArrow: <NextArrow />,
            prevArrow: <PrevArrow />,
            responsive: [
                { breakpoint: 1280, settings: { slidesToShow: calcShow(bp1280), infinite: count > 1 } },
                { breakpoint: 1024, settings: { slidesToShow: calcShow(bp1024), infinite: count > 1 } },
                { breakpoint: 768,  settings: { slidesToShow: calcShow(bp768),  infinite: count > 1 } },
                { breakpoint: 640,  settings: { slidesToShow: calcShow(bp640),  infinite: count > 1 } },
                { breakpoint: 480,  settings: { slidesToShow: calcShow(bp480),  infinite: count > 1 } },
            ],
        };
    }, [brands]);

    function NextArrow(props) {
        const { className, onClick } = props || {};
        return (
            <button
                type="button"
                aria-label="Next"
                onClick={onClick}
                className={`${className || ''} !flex !items-center !justify-center !w-8 !h-8 !rounded-full !bg-white !shadow-sm border border-gray-300 !text-black hover:!bg-primary hover:!text-white !right-[-12px] !z-20 !top-1/2 !-translate-y-[60%]`}
            >
                <BsChevronRight className="text-lg" />
            </button>
        );
    }

    function PrevArrow(props) {
        const { className, onClick } = props || {};
        return (
            <button
                type="button"
                aria-label="Previous"
                onClick={onClick}
                className={`${className || ''} !flex !items-center !justify-center !w-8 !h-8 !rounded-full !bg-white !shadow-sm border border-gray-300 !text-black hover:!bg-primary hover:!text-white !left-[-12px] !z-20 !top-1/2 !-translate-y-[60%]`}
            >
                <BsChevronLeft className="text-lg" />
            </button>
        );
    }

    const renderBrands = useMemo(() => {
        if (error) {
            return (
                <div className="text-center text-red-500 py-4">
                    {error}
                </div>
            );
        }

        return brands?.map((brand, index) => (
            <div key={brand._id || index} className="px-1">
                <div className="flex flex-col items-center transition-transform duration-200 ease-out md:hover:scale-[1.01] origin-center overflow-visible py-2 transform-gpu">
                    <Link to={`/brand/${brand?.slug}`} className="rounded-full group overflow-visible">
                        <div className="relative rounded-full overflow-visible">
                            {/* Gradient ring wrapper with padding; spins on hover (desktop) */}
                            <div
                                className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 rounded-full p-[2px] md:group-hover:animate-[spin_3s_linear_infinite]"
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
                                        className="block w-[54px] h-[54px] md:w-[70px] md:h-[70px] lg:w-[80px] lg:h-[80px] object-contain rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                    <span className="mt-2 text-sm uppercase font-semibold text-gray-700 text-center">
                        {brand.name}
                    </span>
                </div>
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

            <div className={containerClasses}>
                {/* Hide default slick-theme arrow icons to avoid double chevrons */}
                <style>{`
                  .brands-slider .slick-prev:before,
                  .brands-slider .slick-next:before { content: none !important; }
                `}</style>
                <div className="brands-slider relative">
                    <Slider {...sliderSettings}>
                        {renderBrands}
                    </Slider>
                </div>
            </div>
        </div>
    );
});

Brands.displayName = 'Brands';

export default Brands;