import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getMyCart } from '../functions/cart';
import { truncateTitle } from '../helpers/truncateTitle';
import { placeOrder } from '../functions/order';
import { motion } from 'framer-motion';
import { clearCartRedux } from '../store/cartSlice';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const cartState = useSelector((state) => state.cart);
    const userId = user?._id;
    const [cartItems, setCartItems] = useState(null);
    console.log("Cart items in checkout", cartItems)
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        province: '',
        city: '',
        streetAddress: '',
        apartment: '',
        mobile: '',
        email: user?.email || '',
        additionalInstructions: '',
    });

    const calculateGuestDeliveryCharges = (products) => {
        if (!products || !Array.isArray(products) || products.length === 0) return 0;
        // Free shipping if total is over 2000, otherwise 200 flat rate
        const total = products.reduce((sum, item) => sum + (item.price * item.count), 0);
        return total >= 2000 ? 0 : 200;
    };
    const normalizeCartData = (data, isLoggedIn) => {
        if (!data) return null;

        if (isLoggedIn) {
            // For logged-in users: flatten product structure
            return {
                ...data,
                products: data.products.map(item => ({
                    ...item,
                    title: item.product?.title || item.title,
                    image: item.product?.image || item.image,
                    price: item.product?.salePrice || item.price,
                    productId: item.product?._id || item.productId
                })),
                deliveryCharges: data.deliveryCharges || 0
            };
        } else {
            // For guests: use the Redux cart state values
            const productsArray = Array.isArray(data) ? data : data.products || [];
            return {
                products: productsArray,
                deliveryCharges: data.deliveryCharges || 0,
                freeShipping: data.freeShipping || false,
                cartTotal: data.cartTotal || productsArray.reduce((sum, item) => sum + (item.price * item.count), 0)
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

                // console.log('Normalized Cart Data:', cartData);
                setCartItems(cartData);
            } catch (error) {
                console.error('Error fetching cart data:', error);
                toast.error('Failed to load cart data');
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
            return total + (item.count * item.price);
        }, 0);
    };

    const handlePlaceOrder = async () => {

            if (!formData.firstName) {
                toast.error('First Name is required');
                return;
            }
            if (!formData.lastName) {
                toast.error('Last Name is required');
                return;
            }
            if (!formData.province) {
                toast.error('Province is required');
                return;
            }
            if (!formData.city) {
                toast.error('City is required');
                return;
            }
            if (!formData.streetAddress) {
                toast.error('Street Address is required');
                return;
            }
            const pakistaniMobileRegex = /^03[0-9]{9}$/;

            if (!formData.mobile || !pakistaniMobileRegex.test(formData.mobile)) {
                toast.error('Please enter a valid Pakistani mobile number');
                return;
            }
            
            if (!formData.email) {
                toast.error('Email is required');
                return;
            }

        // Prepare products data consistently
        const productsForOrder = cartItems.products.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            count: item.count,
            image: item.image,
            selectedVariants: item.selectedVariants || []
        }));
        console.log('Products for Order:', productsForOrder);

        const orderData = {
            userId,
            shippingAddress: { ...formData },
            orderedBy: userId || 'guest',
            cartSummary: productsForOrder,
            totalPrice: calculateTotalPrice() + (cartItems?.deliveryCharges || 0),
            freeShipping: cartItems?.freeShipping || false,
            deliveryCharges: cartItems?.deliveryCharges || 0,
        };

        console.log('Submitting Order:', orderData);

        try {
            setLoading(true);
            const response = await placeOrder(orderData);

            // Clear cart after successful order
            if (userId) {
                await clearCart(userId);
                dispatch(clearCartRedux());
            } else {
                dispatch(clearCartRedux());
            }

            toast.success(response?.data?.message || 'Order placed successfully!');
            navigateTo('/order-history', { state: { orderId: response?.order?._id } });
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error?.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 rounded-full border-main border-t-transparent"
                ></motion.div>
            </div>
        );
    }

    if (!cartItems?.products?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="mb-4 text-2xl font-bold text-gray-700">Your cart is empty</h2>
                <button
                    onClick={() => navigateTo('/shop')}
                    className="px-6 py-2 text-white transition rounded-lg bg-main hover:bg-main-dark"
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
            className="p-5"
        >
            <div className="max-w-5xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-2 text-2xl font-extrabold text-center md:text-3xl lg:text-3xl font-roboto text-main md:mb-6"
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
                    <div className="overflow-x-auto">
                        <table className="w-full border border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-2 text-left border">Product</th>
                                    <th className="p-2 text-center border">Quantity</th>
                                    <th className="p-2 text-right border">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.products.map((item, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="flex items-center p-2 border">
                                            <img
                                                src={item.image || item.product.images[0]}
                                                alt={item.title}
                                                className="object-cover w-16 h-16 mr-3 rounded"
                                            />
                                            <span title={item.title}>
                                                {truncateTitle(item.title, 40)}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center border">{item.count}</td>
                                        <td className="p-2 text-right border">
                                            Rs.{(item.price * item.count).toLocaleString()}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2" className="p-2 font-bold text-right border">
                                        Subtotal
                                    </td>
                                    <td className="p-2 text-right border">
                                        Rs.{calculateTotalPrice().toLocaleString()}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="p-2 font-bold text-right border">
                                        Delivery charges
                                    </td>
                                    <td className="p-2 text-right border">
                                        {cartItems.freeShipping ? (
                                            <span className="text-green-600">Free Shipping</span>
                                        ) : (
                                            `Rs.${cartItems.deliveryCharges.toLocaleString()}`
                                        )}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td colSpan="2" className="p-2 text-lg font-bold text-right border">
                                        Total Price
                                    </td>
                                    <td className="p-2 text-lg font-bold text-right border">
                                        Rs.{(calculateTotalPrice() + cartItems.deliveryCharges).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
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
                    <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Province/State *</label>
                            <select
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select Province/State</option>
                                <option value="Punjab">Punjab</option>
                                <option value="Sindh">Sindh</option>
                                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                                <option value="Balochistan">Balochistan</option>
                                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Street Address *</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 text-sm font-medium text-gray-700">Apartment, Suite, etc. (optional)</label>
                            <input
                                type="text"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Mobile Number *</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
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
                        className="w-full px-8 py-3 text-lg font-medium text-white rounded-lg shadow-md bg-main hover:bg-main-dark md:w-auto"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            'Place Order'
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Checkout;