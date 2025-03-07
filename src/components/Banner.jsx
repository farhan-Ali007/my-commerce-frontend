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

    const fetchBanners = async () => {
        try {
            const response = await getBanners();
            setBanners(response || []);
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
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: false,
        afterChange: (index) => setCurrentSlide(index),
    };

    const handleDotClick = (index) => {
        sliderRef.current.slickGoTo(index);
    };

    return (
        <div className="w-full min-h-full mx-auto relative p-0 overflow-hidden">
            {loading ? (
                <div className="w-full h-[600px] bg-gray-300 animate-pulse"></div>
            ) : (
                <Slider ref={sliderRef} {...settings}>
                    {banners.map((banner, index) => (
                        <a
                            href={banner.link}
                            key={banner._id}
                            className="w-full h-full block"
                            target="_self"
                        >
                            <img
                                src={`${banner.image}?f_auto&q_auto&w=1920&h=600&c=fill`}
                                alt={`Banner ${index + 1}`}
                                loading="lazy"
                                className="w-full h-full object-cover object-center"
                            />
                        </a>
                    ))}
                </Slider>
            )}

            {/* Custom Dots */}
            {!loading && (
                <div className="flex justify-center my-2 md:my-4">
                    {banners.map((_, index) => (
                        <motion.div
                            key={index}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer mx-1 ${
                                index === currentSlide ? "bg-gray-400 scale-125" : "bg-main"
                            }`}
                            onClick={() => handleDotClick(index)}
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