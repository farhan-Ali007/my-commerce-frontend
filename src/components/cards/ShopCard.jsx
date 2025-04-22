import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { TiShoppingCart } from 'react-icons/ti';
import { TbTruckDelivery } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart } from '../../store/cartSlice';
import { truncateTitle } from '../../helpers/truncateTitle';
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

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
        </svg>
      );
    }

    if (fractionalPart >= 0.5) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" fill="currentColor" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
            <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" fill="none" stroke="currentColor" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
          </svg>
        </div>
      );
    }

    for (let i = 0; i < maxStars - fullStars - (fractionalPart >= 0.5 ? 1 : 0); i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 20 20" stroke="currentColor">
          <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
        </svg>
      );
    }

    return stars;
  };

  const handleAddToCart = () => {
    const cartItem = {
      productId: id,
      price: salePrice || price,
      count: 1,
      title,
      image: images[0],
      freeShipping,
      deliveryCharges,
    };

    try {
      dispatch(addToCart(cartItem));
      setIsDrawerOpen(true);
    } catch (error) {
      toast.error('Failed to add to cart.');
      console.error(error);
    }
  };

  return (
    <>
      <motion.div
        className="max-w-[300px] w-full relative bg-white shadow-md hover:shadow-lg hover:border-b-2 border-main transition-shadow duration-300 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${slug}`} className="overflow-hidden w-full">
          <motion.img
            className="w-full h-48 object-contain aspect-square transition-transform duration-300"
            src={isHovered && images[1] ? images[1] : images[0]}
            alt={title}
            loading="lazy"
            whileHover={{ scale: 1.05 }}
          />
        </Link>

        {freeShipping && (
          <motion.span
            className="absolute top-0 right-0 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-s-sm flex items-center gap-1 shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TbTruckDelivery size={18} /> Free Shipping
          </motion.span>
        )}

        <div className="px-3 py-2 font-roboto">
          <h2 className="text-sm md:text-base font-bold mb-1">{truncateTitle(title, 45)}</h2>
          <div className="flex items-center gap-1 mb-1">
            {renderStars(averageRating || 0)}
          </div>
          <Link
            to={`/products/${brand?.name}`}
            className="text-main text-sm font-bold uppercase opacity-70 hover:opacity-100 hover:underline"
          >
            {brand?.name?.replace(/-/g, ' ')}
          </Link>
          <p className="text-sm md:text-lg font-semibold mt-1">
            Rs.{' '}
            {salePrice ? (
              <>
                <span className="line-through text-gray-400 text-sm">{price}</span>{' '}
                <span className="text-main">{salePrice}</span>
              </>
            ) : (
              <span>{price}</span>
            )}
          </p>
        </div>

        <div className="px-3 pb-3">
          <motion.button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-main border-2 border-main py-2 hover:bg-main hover:text-white transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <TiShoppingCart className="text-xl" /> Add to Cart
          </motion.button>
        </div>

        <CartDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={() => setIsDrawerOpen(false)} />
      </motion.div>
    </>
  );
};

export default ShopCard;
