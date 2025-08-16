import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, AnimatePresence } from "framer-motion";

const Banner = React.memo(() => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    const bannerDimensions = useMemo(() => ({
        desktop: { width: 1920, height: 550 },
        tablet: { width: 1200, height: 400 },
        mobile: { width: 800, height: 250 }
    }), []);


    const aspectRatio = useMemo(() => 
        bannerDimensions.desktop.width / bannerDimensions.desktop.height,
        [bannerDimensions]
    );

    // Replace dynamic banners with static custom banners, but keep slider and dots
    const staticBanners = [
        {
            _id: 'custom1',
            image: '/customBanner1.webp',
            link: '#',
            alt: 'Custom Banner 1',
        },
        {
            _id: 'custom2',
            image: '/customBanner2.webp',
            link: '#',
            alt: 'Custom Banner 2',
        },
    ];

    // Remove dynamic fetching and use static banners
    // const [banners, setBanners] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    // const sliderRef = useRef(null);
    // const mounted = useRef(false);

    // const bannerDimensions = useMemo(() => ({
    //     desktop: { width: 1920, height: 550 },
    //     tablet: { width: 1200, height: 400 },
    //     mobile: { width: 800, height: 250 }
    // }), []);


    // const aspectRatio = useMemo(() => 
    //     bannerDimensions.desktop.width / bannerDimensions.desktop.height,
    //     [bannerDimensions]
    // );

    // const fetchBanners = useCallback(async () => {
    //     if (!mounted.current) return;
        
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         const response = await getBanners();
    //         console.log("Banner response:", response);
    //         if (!response) {
    //             throw new Error("No response from server");
    //         }
    //         // console.log("Setting banners with data:", response);
    //         setBanners(response || []);
            
    //         // Preload the first banner image
    //         if (response?.length > 0) {
    //             // console.log("Preloading first banner image:", response[0].image);
    //             const img = new Image();
    //             img.src = getOptimizedImageUrl(
    //                 response[0].image,
    //                 bannerDimensions.desktop.width,
    //                 bannerDimensions.desktop.height
    //             );
    //         }
    //     } catch (error) {
    //         console.error("Error in fetching banners ", error);
    //         setError("Failed to load banners. Please try again later.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // useEffect(() => {
    //     mounted.current = true;
    //     fetchBanners();
    //     return () => {
    //         mounted.current = false;
    //     };
    // }, [fetchBanners]);

    const settings = useMemo(() => ({
        dots: false,
        infinite: true,
        speed: 400,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: false,
        afterChange: (index) => setCurrentSlide(index),
    }), []);

    const handleDotClick = useCallback((index) => {
        sliderRef.current?.slickGoTo(index);
    }, []);

    const getOptimizedImageUrl = useCallback((imageUrl, width, height) => {
        if (!imageUrl) return '';
        // If it's a local asset (starts with '/'), return as-is to match preload and avoid cache misses
        if (imageUrl.startsWith('/')) return imageUrl;
        // Otherwise (e.g., Cloudinary/remote), append transformation params
        const sep = imageUrl.includes('?') ? '&' : '?';
        return `${imageUrl}${sep}f_auto&q_80&w=${width}&h=${height}&c=fill`;
    }, []);

    const slideVariants = useMemo(() => ({
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }), []);

    const dotVariants = useMemo(() => ({
        initial: { scale: 1 },
        hover: { 
            scale: 1.2,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        active: {
            scale: 1.3,
            backgroundColor: "#4B5563",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    }), []);

    const renderBannerImage = useCallback((banner, index) => {
        if (!banner?.image) return null;
        
        // Calculate padding-top percentage based on aspect ratio (height / width * 100)
        const paddingTopPercentage = (bannerDimensions.desktop.height / bannerDimensions.desktop.width) * 100;

        return (
            <div className="relative w-full overflow-hidden" style={{ paddingTop: `${paddingTopPercentage}%` }}>
                <picture className="absolute inset-0 block w-full h-full">
                    <source 
                        media="(max-width: 640px)"
                        srcSet={getOptimizedImageUrl(
                            banner.image, 
                            bannerDimensions.mobile.width, 
                            bannerDimensions.mobile.height
                        )}
                    />
                    <source 
                        media="(max-width: 1024px)"
                        srcSet={getOptimizedImageUrl(
                            banner.image, 
                            bannerDimensions.tablet.width, 
                            bannerDimensions.tablet.height
                        )}
                    />
                    <motion.img
                        src={getOptimizedImageUrl(
                            banner.image, 
                            bannerDimensions.desktop.width, 
                            bannerDimensions.desktop.height
                        )}
                        alt={`Banner ${index + 1}`}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                        className="absolute inset-0 object-cover object-center w-full h-full"
                        width={bannerDimensions.desktop.width}
                        height={bannerDimensions.desktop.height}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            duration: 0.8,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{
                            scale: 1.1, // Slightly zoom in
                            transition: {
                                duration: 0.3, // Smooth transition
                                ease: "easeInOut"
                            }
                        }}
                        onError={(e) => {
                            console.error("Error loading banner image:", e);
                            e.target.style.display = 'none';
                        }}
                    />
                </picture>
            </div>
        );
    }, [bannerDimensions, getOptimizedImageUrl]);

    const renderDots = useCallback(() => (
        <motion.div 
            className="flex justify-center my-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            {staticBanners.map((_, index) => (
                <motion.div
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer mx-[2px] ${
                        index === currentSlide ? "bg-secondary" : "bg-primary"
                    }`}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    role="button"
                    tabIndex={0}
                    variants={dotVariants}
                    initial="initial"
                    animate={index === currentSlide ? "active" : "initial"}
                    whileHover="hover"
                    whileTap={{ scale: 0.9 }}
                />
            ))}
        </motion.div>
    ), [staticBanners, currentSlide, dotVariants, handleDotClick]);

    // if (error) {
    //     return (
    //         <div className="w-full py-8 text-center text-red-500">
    //             {error}
    //         </div>
    //     );
    // }

return (
    <div className="relative w-full mx-auto">
        <div className="relative w-full">
            <Slider ref={sliderRef} {...settings}>
                {staticBanners.map((banner, index) => (
                    <div key={banner._id} className="w-full">
                        <a
                            href={banner.link}
                            className="block w-full h-full"
                            target="_self"
                            rel="noopener noreferrer"
                        >
                            {renderBannerImage(banner, index)}
                        </a>
                    </div>
                ))}
            </Slider>
            {staticBanners.length > 1 && renderDots()}
        </div>
    </div>
);
});

Banner.displayName = 'Banner';

export default Banner;