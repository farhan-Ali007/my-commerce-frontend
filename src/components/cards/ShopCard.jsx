import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { TiShoppingCart } from 'react-icons/ti';
import { TbTruckDelivery } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart } from '../../store/cartSlice';
import { truncateTitle } from '../../helpers/truncateTitle'
import CartDrawer from '../drawers/CartDrawer';

const ShopCard = ({ product }) => {
    const dispatch = useDispatch();
    const { images, title, averageRating, price, slug, salePrice, brand, freeShipping, deliveryCharges } = product;
    const id = product._id;
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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

    const handleAddToCart = async () => {
        const cartItem = {
            productId: id,
            price: salePrice ? salePrice : price,
            count: 1,
            title: product.title,
            image: product.images[0],
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.deliveryCharges,
        };

        console.log("Cart items------>", cartItem)

        try {
            dispatch(addToCart(cartItem));
            setIsDrawerOpen(true);
        } catch (error) {
            toast.error('Failed to add the product to the cart. Please try again.');
            console.error('Error adding item to cart:', error);
        }
    };

    return (
        <>
            <motion.div
                className="max-w-[300px] relative flex-shrink-0 min-h-auto bg-white overflow-hidden shadow-md hover:shadow-lg hover:border-b-2 border-main transition-shadow duration-300 flex flex-col items-stretch"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link to={`/product/${slug}`} className="overflow-hidden w-full mb-4">
                    <motion.img
                        className="w-full h-40 md:h-48 object-contain aspect-square transform transition-transform duration-300"
                        src={isHovered && images[1] ? images[1] : images[0]}
                        alt={title}
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                    />
                </Link>

                {/* Free Shipping Tag */}
                {freeShipping && (
                    <motion.span
                        className="absolute top-0 right-0 bg-green-600 flex  rounded-s-sm items-center gap-1 text-white text-xs font-semibold px-2 py-1 shadow-md"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <TbTruckDelivery size={20} /> Free Shipping
                    </motion.span>
                )}

                <div className="mx-2 justify-start font-roboto mb-2">
                    <h2 className="font-bold text-base md:text-lg mb-2">{truncateTitle(title, 45)}</h2>
                    <div className="flex items-center mb-1 gap-1">
                        <div className="flex items-center gap-1">
                            {renderStars(averageRating || 0)}
                        </div>
                    </div>
                    <Link
                        to={`/products/${brand?.name}`}
                        className="text-main opacity-60 no-underline hover:opacity-90 hover:underline font-bold text-sm uppercase"
                    >
                        {brand?.name?.replace(/-/g, ' ')}
                    </Link>
                    <p className="text-gray-900 text-sm md:text-xl font-semibold">
                        Rs.{' '}
                        {salePrice ? (
                            <span className="line-through text-gray-400 text-sm">{price}</span>
                        ) : (
                            <span>{price}</span>
                        )}{' '}
                        {salePrice}
                    </p>
                </div>

             {/* Add to Cart Button with Slide-Up Animation */}
                <motion.div
                    className="w-full  flex-row text-center justify-between items-center mb-2 gap-1 px-3 overflow-hidden"
                >
                    <motion.button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-1 md:gap-0 lg:gap-2 opacity-70 hover:opacity-90 text-sm md:text-sm lg:text-[1rem] text-main hover:text-white hover:bg-main border-2 border-main font-bold py-2 px-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <TiShoppingCart className="text-xl" /> Add to Cart
                    </motion.button>
                </motion.div>


                <CartDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={() => setIsDrawerOpen(false)} />
            </motion.div>
        </>
    );
};

export default ShopCard;