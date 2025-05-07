import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBanners } from "../functions/banner";
import { motion } from "framer-motion";

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    const bannerDimensions = {
        desktop: { width: 1920, height: 550 },
        tablet: { width: 1200, height: 400 },
        mobile: { width: 800, height: 250 }
    };
    const aspectRatio = bannerDimensions.desktop.width / bannerDimensions.desktop.height;

    const fetchBanners = async () => {
        try {
            const response = await getBanners();
            setBanners(response || []);
            
            // Preload the first banner image
            if (response?.length > 0) {
                const img = new Image();
                img.src = `${response[0].image}?f_auto&q_auto&w=${bannerDimensions.desktop.width}&h=${bannerDimensions.desktop.height}&c=fill`;
            }
        } catch (error) {
            console.log("Error in fetching banners ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const settings = {
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
    };

    const handleDotClick = (index) => {
        sliderRef.current.slickGoTo(index);
    };

    // Generate image URL with optimization parameters
    const getOptimizedImageUrl = (imageUrl, width, height) => {
        return `${imageUrl}?f_auto&q_80&w=${width}&h=${height}&c=fill`;
    };

    return (
        <div className="w-full mx-auto relative p-0 overflow-hidden">
            {/* Preload first banner image for better performance */}
            {banners.length > 0 && (
                <link 
                    rel="preload" 
                    href={getOptimizedImageUrl(
                        banners[0].image, 
                        bannerDimensions.desktop.width, 
                        bannerDimensions.desktop.height
                    )} 
                    as="image" 
                />
            )}

            {loading ? (
                <div 
                    className="w-full bg-gray-300 animate-pulse" 
                    style={{ 
                        height: `${bannerDimensions.desktop.height}px`,
                        maxHeight: '100vh'
                    }}
                ></div>
            ) : (
                <Slider ref={sliderRef} {...settings}>
                    {banners.map((banner, index) => (
                        <a
                            href={banner.link}
                            key={banner._id}
                            className="w-full h-full block focus:outline-none"
                            target="_self"
                            aria-label={`Banner ${index + 1}`}
                        >
                            <div 
                                className="w-full relative"
                                style={{ 
                                    paddingBottom: `${100 / aspectRatio}%`,
                                    height: 0,
                                    maxHeight: '100vh'
                                }}
                            >
                                <picture>
                                    {/* Mobile image */}
                                    <source 
                                        media="(max-width: 640px)"
                                        srcSet={getOptimizedImageUrl(
                                            banner.image, 
                                            bannerDimensions.mobile.width, 
                                            bannerDimensions.mobile.height
                                        )}
                                    />
                                    {/* Tablet image */}
                                    <source 
                                        media="(max-width: 1024px)"
                                        srcSet={getOptimizedImageUrl(
                                            banner.image, 
                                            bannerDimensions.tablet.width, 
                                            bannerDimensions.tablet.height
                                        )}
                                    />
                                    {/* Desktop image */}
                                    <img
                                        src={getOptimizedImageUrl(
                                            banner.image, 
                                            bannerDimensions.desktop.width, 
                                            bannerDimensions.desktop.height
                                        )}
                                        srcSet={`
                                            ${getOptimizedImageUrl(banner.image, 800, 250)} 800w,
                                            ${getOptimizedImageUrl(banner.image, 1200, 400)} 1200w,
                                            ${getOptimizedImageUrl(banner.image, 1920, 550)} 1920w
                                        `}
                                        sizes="100vw"
                                        alt={`Banner ${index + 1}`}
                                        loading={index > 0 ? "lazy" : "eager"}
                                        className="absolute top-0 left-0 w-full h-full object-cover object-center"
                                        width={bannerDimensions.desktop.width}
                                        height={bannerDimensions.desktop.height}
                                        decoding="async"
                                    />
                                </picture>
                            </div>
                        </a>
                    ))}
                </Slider>
            )}

            {/* Custom Dots */}
            {!loading && banners.length > 1 && (
                <div className="flex justify-center my-2">
                    {banners.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer mx-1 ${
                                index === currentSlide ? "bg-gray-400 scale-125" : "bg-main"
                            }`}
                            onClick={() => handleDotClick(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            role="button"
                            tabIndex={0}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Banner;