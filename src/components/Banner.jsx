import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getBanners } from "../functions/banner";

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

    // Dynamic banners (PI) with safe fallback to staticBanners
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mounted = useRef(false);

    const fetchBanners = useCallback(async () => {
        if (!mounted.current) return;
        try {
            setLoading(true);
            setError(null);
            const response = await getBanners();
            const list = Array.isArray(response) ? response : (response?.banners || response?.data || []);
            setBanners(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error("Banner fetch failed", e);
            setError("Failed to load banners");
            setBanners([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        fetchBanners();
        return () => { mounted.current = false; };
    }, [fetchBanners]);

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

    // Removed Framer Motion variants to reduce JS overhead; layout preserved

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
                    <img
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
                        onError={(e) => {
                            console.error("Error loading banner image:", e);
                            e.target.style.display = 'none';
                        }}
                    />
                </picture>
            </div>
        );
    }, [bannerDimensions, getOptimizedImageUrl]);

    const resolvedBanners = banners.length ? banners : staticBanners;

    const renderDots = useCallback(() => (
        <div className="flex justify-center my-2">
            {resolvedBanners.map((_, index) => (
                <div
                    key={index}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer mx-[2px] ${
                        index === currentSlide ? "bg-secondary" : "bg-primary"
                    }`}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    role="button"
                    tabIndex={0}
                />
            ))}
        </div>
    ), [resolvedBanners, currentSlide, handleDotClick]);

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
                    {resolvedBanners.map((banner, index) => (
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
                {resolvedBanners.length > 1 && renderDots()}
            </div>
        </div>
    );
});

Banner.displayName = 'Banner';

export default Banner;