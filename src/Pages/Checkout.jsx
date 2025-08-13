import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getMyCart } from "../functions/cart";
import { truncateTitle } from "../helpers/truncateTitle";
import { placeOrder } from "../functions/order";
import { motion } from "framer-motion";
import { clearCartRedux } from "../store/cartSlice";
import useFacebookPixel from '../hooks/useFacebookPixel';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartState = useSelector((state) => state.cart);
  const userId = user?._id;
  const [cartItems, setCartItems] = useState(null);
  // console.log("Cart items in checkout", cartItems);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    mobile: "",
    additionalInstructions: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const { track } = useFacebookPixel();

  const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object') return img.url || '';
    return '';
  };

  const calculateGuestDeliveryCharges = (products) => {
    if (!products || !Array.isArray(products) || products.length === 0) return 0;
    const allFree = products.every((item) => item.freeShipping);
    return allFree ? 0 : 250;
  };
  const normalizeCartData = (data, isLoggedIn) => {
    if (!data) return null;

    if (isLoggedIn) {
      // For logged-in users: flatten product structure
      return {
        ...data,
        products: data.products.map((item) => ({
          ...item,
          title: item.product?.title || item.title,
          image:
            getImageUrl((item.product?.images && item.product.images[0])) ||
            getImageUrl(item.image),
          price: item.product?.salePrice || item.price,
          productId: item.product?._id || item.productId,
        })),
        deliveryCharges: data.deliveryCharges || 0,
      };
    } else {
      // For guests: use the Redux cart state values
      const productsArray = Array.isArray(data) ? data : data.products || [];
      const computedDelivery = data.deliveryCharges != null
        ? data.deliveryCharges
        : calculateGuestDeliveryCharges(productsArray);
      const freeShippingAll = productsArray.every((p) => p.freeShipping);
      return {
        products: productsArray,
        deliveryCharges: computedDelivery,
        freeShipping: freeShippingAll,
        cartTotal:
          data.cartTotal ||
          productsArray.reduce((sum, item) => sum + item.price * item.count, 0),
      };
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        let cartData;

        if (userId) {
          const dbCart = await getMyCart(userId);
          cartData = normalizeCartData(dbCart, true);
        } else {
          cartData = normalizeCartData(cartState, false);
        }

        setCartItems(cartData);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Cart not found, set to empty and do not retry
          setCartItems({ products: [] });
        } else {
          console.error("Error fetching cart data:", error);
          // Optionally show a toast or error message
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, [userId, cartState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateTotalPrice = () => {
    if (!cartItems?.products) return 0;
    return cartItems.products.reduce((total, item) => {
      return total + item.count * item.price;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!formData.fullName) {
      toast.error("Full Name is required");
      return;
    }
    if (!formData.streetAddress) {
      toast.error("Street Address is required");
      return;
    }
    if (!formData.city) {
      toast.error("City is required");
      return;
    }
    const pakistaniMobileRegex = /^03[0-9]{9}$/;

    if (!formData.mobile || !pakistaniMobileRegex.test(formData.mobile)) {
      toast.error("Please enter a valid Pakistani mobile number");
      return;
    }
    if (!formData.mobile) {
      toast.error("Mobile Number is required");
      return;
    }

    // Prepare products data consistently
    const productsForOrder = cartItems.products.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      count: item.count,
      image: item.image,
      selectedVariants: item.selectedVariants || [],
    }));
    // console.log("Products for Order:", productsForOrder);

    const orderData = {
      userId,
      shippingAddress: { ...formData },
      orderedBy: userId || "guest",
      cartSummary: productsForOrder,
      totalPrice: calculateTotalPrice() + (cartItems?.deliveryCharges || 0),
      freeShipping: cartItems?.freeShipping || false,
      deliveryCharges: cartItems?.deliveryCharges || 0,
    };

    console.log("Submitting Order:", orderData);

    try {
      setLoading(true);
      const response = await placeOrder(orderData);

      // Meta Pixel Purchase event
      track('Purchase', {
        value: orderData.totalPrice,
        currency: 'PKR',
        content_ids: orderData.cartSummary.map(item => item.productId)
      });

      // Clear cart after successful order
      if (userId) {
        await clearCart(userId);
        dispatch(clearCartRedux());
      } else {
        dispatch(clearCartRedux());
      }
      setCartItems(null);
      setFormData({
        fullName: "",
        streetAddress: "",
        city: "",
        mobile: "",
        additionalInstructions: "",
      });
      toast.success(response?.data?.message || "Order placed successfully!");
      navigateTo("/order-history", {
        state: { orderId: response?.order?._id },
      });
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 rounded-full border-main border-t-transparent"
        ></motion.div>
      </div>
    );
  }

  if (!cartItems?.products?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="mb-4 text-2xl font-bold text-gray-700">
          Your cart is empty
        </h2>
        <button
          onClick={() => navigateTo("/shop")}
          className="px-6 py-2  transition rounded-lg bg-secondary text-primary "
        >
          Continue Shopping
        </button>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-5 py-5 md:px-20 "
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-2 text-2xl font-extrabold text-center md:text-3xl lg:text-3xl font-roboto text-secondary md:mb-6"
        >
          Checkout
        </motion.h2>

        {/* Cart Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 mb-8 bg-white rounded-lg shadow-lg"
        >
          <h3 className="mb-4 text-xl font-bold">Order Summary</h3>
          <div className="flex flex-col">
            {cartItems.products.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center p-2 mb-2 bg-white border rounded-lg shadow-sm sm:p-4"
              >
                <div className="relative w-16 h-16 mr-3 flex-shrink-0">
                  <img
                    src={getImageUrl(item.image) || getImageUrl(item.product?.images && item.product.images[0])}
                    alt={item.title}
                    className="object-cover w-full h-full rounded"
                  />
                  <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-secondary rounded-full md:w-6 md:h-6 md:text-sm">
                    {item.count}
                  </span>
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <span
                    title={item.title}
                    className="text-sm font-medium line-clamp-2 sm:text-base"
                  >
                    {truncateTitle(item.title, 60)}
                  </span>
                  <span className="mt-1 text-sm font-semibold text-right text-gray-800 sm:text-base">
                    Rs.{(item.price * item.count).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col mt-4">
            <div className="flex justify-between p-2 border-b border-gray-200">
              <span className="font-semibold text-gray-700">
                Delivery charges:
              </span>
              <span className="font-semibold text-gray-900">
                {cartItems.freeShipping ? (
                  <span className="text-green-600">Free Shipping</span>
                ) : (
                  `Rs.${cartItems.deliveryCharges.toLocaleString()}`
                )}
              </span>
            </div>
            <div className="flex justify-between p-2 pt-4 text-lg font-bold bg-gray-50 rounded-b-lg">
              <span className="text-secondary">Total Price:</span>
              <span className="text-primary">
                Rs.
                {(
                  calculateTotalPrice() + cartItems.deliveryCharges
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Address Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 mb-8 bg-white rounded-lg shadow-lg"
        >
          <h3 className="mb-4 text-xl font-bold">Shipping Address</h3>
                      <form autoComplete="on" className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Full Name * (پورا نام)"
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="mobile"
                  autoComplete="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Mobile Number * (موبائل نمبر)"
                  required
                />
              </div>
              <div>
              <input
                type="text"
                name="city"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="City * (شہر)"
                required
              />
            </div>
            <div>
              <input
                type="text"
                name="streetAddress"
                autoComplete="address-line1"
                value={formData.streetAddress}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Street Address * (مکمل پتہ)"
                required
              />
            </div>
            <div className="flex gap-1 font-space text-primary ">
              <input
                type="checkbox"
                className="text-secondary"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              /> Remember Me
            </div>
          </form>
        </motion.div>

        {/* Additional Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="p-6 mb-8 bg-white rounded-lg shadow-lg"
        >
          <h3 className="mb-4 text-xl font-medium">Additional Instructions</h3>
          <textarea
            name="additionalInstructions"
            placeholder="Enter any special instructions here..."
            value={formData.additionalInstructions}
            onChange={handleInputChange}
            className="w-full h-32 p-2 border rounded"
          ></textarea>
        </motion.div>

        {/* Place Order Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mb-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full px-8 py-3 text-lg font-medium text-secondary rounded shadow-md bg-primary/80 hover:bg-primary md:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Place Order"
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Checkout;
