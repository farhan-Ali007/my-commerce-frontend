import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import { truncateTitle } from '../../helpers/truncateTitle';
import { TbTruckDelivery } from 'react-icons/tb';
import { motion } from 'framer-motion'; // Import motion from Framer Motion

const ProductCard = ({ product }) => {
    const { images, title, averageRating, price, salePrice, slug, freeShipping } = product;
    const off = salePrice && Math.floor(((price - salePrice) / price) * 100);
    const totalReviews = product?.reviews?.length;

    // State to track hover
    const [isHovered, setIsHovered] = useState(false);

    // Animation Variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        hover: { scale: 1.05, transition: { duration: 0.3 } }, // Hover animation
    };

    const imageVariants = {
        hover: { scale: 1.1, transition: { duration: 0.3 } }, // Image hover animation
    };

    const renderStars = (rating) => {
        const stars = [];
        const maxStars = 5;
        const fullStars = Math.floor(rating);
        const fractionalPart = rating % 1;

        for (let i = 1; i <= fullStars; i++) {
            stars.push(
                <svg
                    key={`full-${i}`}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                </svg>
            );
        }

        if (fractionalPart >= 0.5) {
            stars.push(
                <div key="half-star" className="relative w-4 h-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-yellow-500"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" fill="currentColor" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" fill="none" stroke="currentColor" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
                    </svg>
                </div>
            );
        }

        const remainingStars = maxStars - fullStars - (fractionalPart >= 0.5 ? 1 : 0);
        for (let i = 1; i <= remainingStars; i++) {
            stars.push(
                <svg
                    key={`empty-${i}`}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 20 20"
                    stroke="currentColor"
                >
                    <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                </svg>
            );
        }

        return stars;
    };

    return (
        <motion.div
            className="max-w-sm bg-white overflow-hidden shadow-md hover:shadow-lg hover:border-b-2 border-main transition-shadow  duration-300 flex flex-col items-stretch relative"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${slug}`} className="overflow-hidden w-full mb-4 aspect-square">
                <motion.img
                    className="w-full h-full object-cover transform transition-transform duration-300"
                    src={isHovered && images[1] ? images[1] : images[0]}
                    alt={title}
                    loading="lazy"
                    variants={imageVariants}
                    whileHover="hover"
                />
            </Link>

            {/* Free Shipping Tag */}
            {freeShipping && (
                <motion.span
                    className="absolute top-0 right-0 bg-green-600 rounded-s-sm  flex items-center gap-1 text-white text-sm font-semibold px-2 py-1 shadow-md"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <TbTruckDelivery size={20} /> Free Shipping
                </motion.span>
            )}

            <div className="mx-2 justify-start font-roboto mb-4">
                <h2 className="font-semibold text-base md:text-lg mb-2">{truncateTitle(title, 50)}</h2>
                <div className="flex items-center mb-1 gap-1">
                    <div className="flex items-center gap-1">
                        {renderStars(averageRating || 0)}
                        {totalReviews > 0 && <span className="text-gray-500 text-sm ml-2 font-bold">({totalReviews})</span>}
                    </div>
                </div>
                <div className="flex items-center gap-x-2 flex-nowrap">
                    <p className="text-gray-900 text-sm font-medium">
                        Rs.{' '}
                        {salePrice ? (
                            <span className="line-through text-gray-400 text-sm">{price}</span>
                        ) : (
                            <span>{price}</span>
                        )}{' '}
                        {salePrice}
                    </p>
                    {off && <p className="p-1 border-2 text-center text-xs sm:text-sm border-main">{off}% Off</p>
                    }
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;