import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { TbTruckDelivery } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { truncateTitle } from "../../helpers/truncateTitle";
import { addToCart } from "../../store/cartSlice";
import { addItemToCart } from "../../functions/cart";
import { AiOutlineLoading } from "react-icons/ai";
import useFacebookPixel from '../../hooks/useFacebookPixel';

const ShopCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const currentCartItems = useSelector((state) => state.cart.products);
  const userId = user?._id;
  const {
    images,
    title,
    averageRating,
    price,
    slug,
    salePrice,
    freeShipping,
    deliveryCharges,
  } = product;
  const id = product._id;
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { track } = useFacebookPixel();

  const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object') return img.url || '';
    return '';
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
            <path
              d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z"
              fill="currentColor"
              style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
            />
            <path
              d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z"
              fill="none"
              stroke="currentColor"
              style={{
                clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
              }}
            />
          </svg>
        </div>
      );
    }

    const remainingStars =
      maxStars - fullStars - (fractionalPart >= 0.5 ? 1 : 0);
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
    // If product has variants, require selection on PDP
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      toast.error("Please select product options first.");
      navigateTo(`/product/${product?.slug}`);
      return;
    }
    const cartItem = {
      cartItemId: id,
      productId: id,
      price: salePrice ? salePrice : price,
      count: 1,
      title: product.title,
      image: getImageUrl(product?.images && product.images[0]),
      freeShipping: product.freeShipping,
      deliveryCharges: product.freeShipping ? 0 : 250,
    };

    try {
      setLoading(true);
      if (userId) {
        const cartPayload = {
          products: [cartItem],
          deliveryCharges: product.freeShipping ? 0 : 250,
        };
        await addItemToCart(userId, cartPayload);
        dispatch(addToCart(cartItem));
      } else {
        dispatch(addToCart(cartItem));
      }
      setLoading(false);
      toast.success("Item added to cart.");
      // Meta Pixel AddToCart event
      track('AddToCart', {
        content_ids: [product._id],
        content_name: product.title,
        value: product.salePrice ? product.salePrice : product.price,
        currency: 'PKR'
      });
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add the product to the cart. Please try again.");
      console.error("Error adding item to cart:", error);
    }
  };

  // console.log("Current Cart Items:", currentCartItems);
  const handleByNow = useCallback(async () => {

    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      toast.error("Please select product options first.");
      navigateTo(`/product/${product?.slug}`);
      return;
    }
    const variantsForBackend = [];
    const cartItem = {
      cartItemId: product._id,
      productId: product._id,
      title: product.title,
      price: product.salePrice ? product.salePrice : product.price,
      image: getImageUrl(product?.images && product.images[0]),
      count: 1,
      selectedVariants: variantsForBackend,
      freeShipping: product.freeShipping,
      deliveryCharges: product.deliveryCharges,
    };

    console.log("Cart Items in shop card ------->", cartItem);
    try {
      setLoading(true);
      // Combine with Redux cart and sync for logged-in users
      const computeKey = (item) => item.cartItemId || `${item.productId}${Array.isArray(item.selectedVariants) && item.selectedVariants.length>0 ? '|' + item.selectedVariants.map(v => `${v.name}:${Array.isArray(v.values)?v.values.join(','):v.values||''}`).join('|') : ''}`;
      const existingItems = Array.isArray(currentCartItems) ? currentCartItems : [];
      const combined = [...existingItems];
      const idx = combined.findIndex(i => computeKey(i) === computeKey(cartItem));
      if (idx >= 0) {
        combined[idx] = { ...combined[idx], count: combined[idx].count + cartItem.count };
      } else {
        combined.push(cartItem);
      }

      dispatch(addToCart(cartItem));
      if (userId) {
        const cartPayload = {
          products: combined,
          deliveryCharges: combined.every(i => i.freeShipping) ? 0 : 250,
        };
        await addItemToCart(userId, cartPayload);
      }
      setLoading(false);
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
  }, [product, dispatch, userId, navigateTo, track, currentCartItems]);

  return (
    <motion.div
      className="max-w-sm bg-white h-[320px] overflow-hidden rounded-lg shadow-md mb-2 hover:shadow-lg hover:border-b-2 border-primary transition-shadow duration-300 flex flex-col items-stretch relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/product/${slug}`}
        className="w-full mb-4 overflow-hidden"
        style={{ height: `180px` }}
      >
        <div className="relative w-full h-full">
          <motion.img
            className="absolute top-0 left-0 object-cover w-full h-full"
            src={
              imgLoaded
                ? (isHovered && images[1] ? getImageUrl(images[1]) : getImageUrl(images[0]))
                : '/loadingCard.png'
            }
            alt={title}
            loading="lazy"
            width={180}
            height={180}
            decoding="async"
            whileHover={{ scale: 1.05 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
          />
        </div>
      </Link>
      <div className="absolute top-[148px] left-0 right-0 flex lg:hidden justify-between">
        <button
          onClick={handleAddToCart}
          className="w-1/2 bg-primary/80 text-white font-semibold py-2 text-[10px] hover:bg-primary transition"
        >
          Add To Cart
        </button>
        <button
          onClick={handleByNow}
          className="w-1/2 bg-secondary/80 text-white font-semibold py-2 text-[10px] hover:bg-secondary transition"
        >
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
              {loading ? (
                <AiOutlineLoading
                  size={24}
                  className="text-white animate-spin"
                />
              ) : (
                " Add To Cart"
              )}
            </button>
            <button
              onClick={handleByNow}
              className="w-1/2 bg-secondary/80 text-white font-semibold py-1 text-[12px] hover:bg-secondary transition-colors duration-200"
            >
              {loading ? (
                <AiOutlineLoading
                  size={24}
                  className="text-white animate-spin"
                />
              ) : (
                "By Now"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="justify-start mx-2 mb-4 font-roboto">
        <Link to={`/product/${slug}`} className="text-black no-underline">
          <h2
            onMouseEnter={() => setIsHovered(true)}
            className="mb-2 text-sm font-medium"
          >
            {truncateTitle(title, 45)}
          </h2>
        </Link>
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center gap-1">
            {renderStars(averageRating || 0)}
            {product?.reviews?.length > 0 && (
              <span className="ml-2 text-sm font-bold text-primary">
                ({product?.reviews?.length})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-x-2 flex-nowrap">
          <p className="flex flex-col text-sm font-semibold text-primary/90">
            {salePrice ? (
              <span className="text-sm text-gray-400 line-through">
                Rs. {price}
              </span>
            ) : (
              <span>Rs. {price}</span>
            )}{" "}
            Rs.{salePrice}
          </p>
          {salePrice && price && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 border border-green-200 rounded-full text-green-700 text-xs font-semibold">
              <svg
                className="w-3 h-3 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {Math.floor(((price - salePrice) / price) * 100)}% Save
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopCard;
