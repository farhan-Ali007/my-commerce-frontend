import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { truncateTitle } from '../../helpers/truncateTitle';
import { TbTruckDelivery } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { toast } from 'react-hot-toast'
import { addItemToCart, getMyCart } from '../../functions/cart'
import { motion, AnimatePresence } from "framer-motion";
import useFacebookPixel from '../../hooks/useFacebookPixel';

const ProductCard = ({ product, backendCartItems = [] }) => {
    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;
    const { images, title, averageRating, price, salePrice, slug, freeShipping } = product;
    const off = salePrice && Math.floor(((price - salePrice) / price) * 100);
    const totalReviews = product?.reviews?.length;
    const [isHovered, setIsHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const { track } = useFacebookPixel();

    const imageWidth = 180;
    const imageHeight = 180;

    const handleAddToCart = useCallback(async () => {
        const variantsForBackend = [];

        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: product?.salePrice ? product?.salePrice : product?.price,
            image: product?.images[0],
            count: 1,
            selectedVariants: variantsForBackend,
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.freeShipping ? 0 : product?.deliveryCharges
        };

        try {
            dispatch(addToCart(cartItem));
            toast.success("Product added to cart!");
            // Meta Pixel AddToCart event
            track('AddToCart', {
                content_ids: [product._id],
                content_name: product.title,
                value: product.salePrice ? product.salePrice : product.price,
                currency: 'PKR'
            });
        } catch (error) {
            toast.error("Failed to add the product to the cart. Please try again.");
            console.error("Error adding item to cart:", error);
        }
    }, [product, userId, navigateTo, dispatch, track]);

    const handleByNow = useCallback(async () => {
        const variantsForBackend = [];
        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: product?.salePrice ? product?.salePrice : product?.price,
            image: product?.images[0],
            count: 1,
            selectedVariants: variantsForBackend,
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.freeShipping ? 0 : product?.deliveryCharges
        };

        try {
            // Defensive: always use an array
            const items = Array.isArray(backendCartItems) ? backendCartItems : [];
            const existing = items.find(item => item.productId === cartItem.productId);
            let updatedCartItems;
            if (existing) {
                updatedCartItems = items.map(item =>
                    item.productId === cartItem.productId
                        ? { ...item, count: item.count + 1 }
                        : item
                );
            } else {
                updatedCartItems = [...items, cartItem];
            }

            dispatch(addToCart(cartItem));
            const cartPayload = {
                products: updatedCartItems
            };
            await addItemToCart(userId, cartPayload);
            // Meta Pixel InitiateCheckout event
            track('InitiateCheckout', {
                content_ids: [product._id],
                content_name: product.title,
                value: product.salePrice ? product.salePrice : product.price,
                currency: 'PKR'
            });
            navigateTo("/cart/checkout");
            toast.success("Proceeding to checkout!");
        } catch (error) {
            toast.error("Failed to proceed to checkout. Please try again.");
            console.error("Error during Buy Now:", error);
        }
    }, [product, dispatch, userId, navigateTo, backendCartItems, track]);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.3,
                ease: "easeOut"
            } 
        },
        hover: { 
            scale: 1.02, 
            transition: { 
                duration: 0.2,
                ease: "easeOut"
            } 
        },
    };

    const imageVariants = {
        hover: { 
            scale: 1.05, 
            transition: { 
                duration: 0.2,
                ease: "easeOut"
            } 
        },
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

    const getOptimizedImageUrl = (imageUrl) => {
        return `${imageUrl}?f_auto&q_80&w=${imageWidth}&h=${imageHeight}&c=fill`;
    };

    return (
        <motion.div
            className="max-w-sm bg-white h-[320px] overflow-hidden rounded-lg shadow-md mb-2 hover:shadow-lg hover:border-b-2 border-primary transition-shadow duration-300 flex flex-col items-stretch relative"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover="hover"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/product/${slug}`} className="w-full mb-4 overflow-hidden" style={{ height: `${imageHeight}px` }}>
                <div className="relative w-full h-full">
                    <motion.img
                        className="absolute top-0 left-0 object-cover w-full h-full"
                        src={
                            imgLoaded
                                ? getOptimizedImageUrl(isHovered && images[1] ? images[1] : images[0])
                                : '/loadingCard.png'
                        }
                        alt={title}
                        loading="lazy"
                        width={imageWidth}
                        height={imageHeight}
                        decoding="async"
                        variants={imageVariants}
                        whileHover="hover"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgLoaded(false)}
                    />
                </div>
            </Link>
            <div className="absolute top-[148px] left-0 right-0 flex lg:hidden justify-between">
                <button onClick={handleAddToCart} className="w-1/2 bg-primary/80 text-white font-semibold py-2 text-[10px] hover:bg-primary transition">
                    Add To Cart
                </button>
                <button onClick={handleByNow} className="w-1/2 bg-secondary/80 text-white font-semibold py-2 text-[10px] hover:bg-secondary transition">
                    Buy Now
                </button>
            </div>

            {freeShipping && (
                <motion.span
                    className="absolute top-0 right-0 bg-secondary rounded-s-sm flex items-center gap-1 text-primary text-[10px] md:text-xs font-medium px-2 py-1 shadow-md will-change-transform"
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <TbTruckDelivery size={18} /> Free Shipping
                </motion.span>
            )}

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-[162px] left-0 right-0 hidden lg:flex justify-between will-change-transform"
                    >
                        <button
                            onClick={handleAddToCart}
                            className="w-1/2 bg-primary/80 text-white font-semibold py-1 text-[12px] hover:bg-primary transition-colors duration-200"
                        >
                            Add To Cart
                        </button>
                        <button
                            onClick={handleByNow}
                            className="w-1/2 bg-secondary/80 text-white font-semibold py-1 text-[12px] hover:bg-secondary transition-colors duration-200"
                        >
                            Buy Now
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="justify-start mx-2 mb-4 font-roboto">
                <Link to={`/product/${slug}`} className='text-black no-underline'>
                    <h2
                        onMouseEnter={() => setIsHovered(true)}
                        className="mb-2 text-sm font-medium">
                        {truncateTitle(title, 45)}
                    </h2>
                </Link>
                <div className="flex items-center gap-1 mb-1">
                    <div className="flex items-center gap-1">
                        {renderStars(averageRating || 0)}
                        {totalReviews > 0 && <span className="ml-2 text-sm font-bold text-primary">({totalReviews})</span>}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-x-2 flex-nowrap">
                    <p className="flex flex-col text-sm font-semibold text-primary/90">
                        {salePrice ? (
                            <span className="text-sm text-gray-400 line-through">Rs. {price}</span>
                        ) : (
                            <span>Rs. {price}</span>
                        )}{' '}
                        Rs.{salePrice}
                    </p>
                    {off && <p className="p-1 text-xs text-primary text-center border-2 sm:text-sm border-secondary">{off}% Off</p>}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;