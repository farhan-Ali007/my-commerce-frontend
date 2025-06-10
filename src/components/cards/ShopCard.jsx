import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { TbTruckDelivery } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { truncateTitle } from '../../helpers/truncateTitle';
import { addToCart } from '../../store/cartSlice';
import CartDrawer from '../drawers/CartDrawer';
import { addItemToCart } from '../../functions/cart'

const ShopCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;
    const { images, title, averageRating, price, slug, salePrice, brand, freeShipping  } = product;
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
            freeShipping: product.freeShipping,
            deliveryCharges: product.deliveryCharges
        };

        // console.log("Cart item before dispatch:", cartItem)
        // console.log("Product object in handleAddToCart:", product)

        try {
            dispatch(addToCart(cartItem));
            // console.log("Cart item after dispatch:", cartItem)
            setIsDrawerOpen(true);
        } catch (error) {
            toast.error('Failed to add the product to the cart. Please try again.');
            console.error('Error adding item to cart:', error);
        }
    };

    const currentCartItems = useSelector((state) => state.cart.products);
    // console.log("Current Cart Items:", currentCartItems);
    const handleByNow = useCallback(async () => {
        const variantsForBackend = []
        const cartItem = {
            productId: product._id,
            title: product.title,
            price: product.salePrice ? product.salePrice : product.price,
            image: product.images[0],
            count: 1,
            selectedVariants: variantsForBackend,
            freeShipping: product.freeShipping,
            deliveryCharges: product.deliveryCharges
        };

        try {
            // 1. Add the new item to Redux cart
            dispatch(addToCart(cartItem));
            // 3. Prepare the payload for the backend
            const updatedCartItems = [...currentCartItems, cartItem];
            const cartPayload = {
                products: updatedCartItems.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    count: item.count,
                    selectedVariants: item.selectedVariants,
                    freeShipping: item.freeShipping,
                    deliveryCharges: item.deliveryCharges
                }))
            };
            await addItemToCart(userId, cartPayload);
            navigateTo("/cart/checkout");
            toast.success("Proceeding to checkout!");
        } catch (error) {
            toast.error("Failed to proceed to checkout. Please try again.");
            console.error("Error during Buy Now:", error);
        }
    }, [, product, dispatch, userId, navigateTo]);

    return (
        <>
            <motion.div
                className=" max-w-[220px] relative min-h-auto rounded-lg bg-white overflow-hidden mb-4 shadow-md hover:shadow-lg hover:border-b-2 border-main transition-shadow duration-300 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link to={`/product/${slug}`} className="overflow-hidden w-full mb-4">
                    <motion.img
                        className="w-full h-48 object-cover aspect-square transform transition-transform duration-300"
                        src={isHovered && images[1] ? images[1] : images[0]}
                        alt={title}
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                    />
                </Link>

                <div className="absolute top-[162px] left-0 right-0 flex lg:hidden justify-between">
                    <button onClick={handleAddToCart} className="w-1/2 bg-red-600 text-white font-semibold py-2 text-[10px] hover:bg-red-700 transition">
                        Add To Cart
                    </button>
                    <button onClick={handleByNow} className="w-1/2 bg-blue-800 text-white font-semibold py-2 text-[10px] hover:bg-blue-900 transition">
                        Buy Now
                    </button>
                </div>

                {/* Free Shipping Tag */}
                {freeShipping && (
                    <motion.span
                        className="absolute top-0 right-0 bg-main/90 flex  rounded-s-sm items-center gap-1 text-white text-[10px] md:text-xs font-semibold px-2 py-1 shadow-md"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <TbTruckDelivery size={20} /> Free Shipping
                    </motion.span>
                )}

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute top-[167px] left-0 right-0 hidden lg:flex justify-between"
                        >
                            <button
                                onClick={handleAddToCart}
                                className="w-1/2 bg-red-600 text-white font-semibold py-1 text-[12px] hover:bg-red-700 transition"
                            >
                                Add To Cart
                            </button>
                            <button
                                onClick={handleByNow}
                                className="w-1/2 bg-main text-white font-semibold py-1 text-[12px] hover:bg-blue-800 transition"
                            >
                                Buy Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mx-2 justify-start font-roboto mb-2">
                    <Link to={`/product/${slug}`} className='no-underline text-black'>
                        <h2
                            onMouseEnter={() => setIsHovered(false)}
                            className="font-medium text-sm mb-2">
                            {truncateTitle(title, 45)}
                        </h2>
                    </Link>
                    <div className="flex items-center mb-1 gap-1">
                        <div className="flex items-center gap-1">
                            {renderStars(averageRating || 0)}
                        </div>
                    </div>
                    <Link
                        to={`/products/${brand?.name}`}
                        className="text-main/70 no-underline hover:text-main/90 hover:underline font-bold text-sm uppercase"
                    >
                        {brand?.name?.replace(/-/g, ' ')}
                    </Link>
                    <p className="text-main/90 text-sm md:text-xl font-semibold">
                        {salePrice ? (
                            <span className="line-through text-gray-400 text-sm">Rs.{price}</span>
                        ) : (
                            <span>Rs.{price}</span>
                        )}{' '}
                        Rs.{salePrice}
                    </p>
                </div>

                <CartDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={() => setIsDrawerOpen(false)} />
            </motion.div>
        </>
    );
};

export default ShopCard;