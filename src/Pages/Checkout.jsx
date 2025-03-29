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
    const cartProducts = useSelector((state) => state.cart.items);
    const userId = user?._id;
    const [cartItems, setCartItems] = useState(null);
    console.log("CartItems-------->", cartItems)
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        province: '',
        city: '',
        streetAddress: '',
        apartment: '',
        mobile: '',
        email: user?.email,
        additionalInstructions: '',
    });

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const cartData = await getMyCart(userId);
                setCartItems(cartData);
                // if (!user) {
                //     setCartItems(cartProducts);
                // }
            } catch (error) {
                console.log('Error fetching cart data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePlaceOrder = async () => {
        const orderData = {
            userId,
            shippingAddress: { ...formData },
            orderedBy: cartItems?.orderedBy,
            cartSummary: cartItems?.products.map((item) => ({
                ...item,
                selectedVariants: item.selectedVariants,
            })),
            totalPrice: calculateTotalPrice() + (cartItems?.deliveryCharges || 0),
            freeShipping: cartItems?.freeShipping,
            deliveryCharges: cartItems?.deliveryCharges,
        };
        console.log('Order Data------->', orderData);
        try {
            setLoading(true);
            const response = await placeOrder(orderData);
            console.log('Order placed successfully', response);
            clearCart(userId);
            setLoading(false);
            toast.success(response?.message || 'Order placed successfully!');
            dispatch(clearCartRedux());
            navigateTo('/order-history');
        } catch (error) {
            setLoading(false);
            console.log('Error in placing order', error);
            toast.error(error?.response?.data?.details || 'Failed to place order. Please check the form data.');
        }
    };

    const calculateTotalPrice = () =>
        cartItems?.products?.reduce((total, item) => total + item.count * item.price, 0);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-main border-t-transparent rounded-full"
                ></motion.div>
            </div>
        );

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
                    className="text-2xl md:text-3xl lg:text-3xl font-roboto font-extrabold text-main text-center mb-2 md:mb-6"
                >
                    Checkout
                </motion.h2>

                {/* Address Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white p-6 rounded-lg shadow-lg mb-8"
                >
                    <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(formData).map((key) => (
                            <motion.div
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {key === 'province' ? (
                                    <select
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleInputChange}
                                        className="border p-2 rounded outline-none max-w-full"
                                        required
                                    >
                                        <option value="" disabled>
                                            Select Province/State
                                        </option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Sindh">Sindh</option>
                                        <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                                        <option value="Balochistan">Balochistan</option>
                                        <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                                    </select>
                                ) : key === 'additionalInstructions' ? null : (
                                    <input
                                        type={key === 'email' ? 'email' : key === 'mobile' ? 'tel' : 'text'}
                                        name={key}
                                        placeholder={
                                            key === 'firstName'
                                                ? 'First Name'
                                                : key === 'lastName'
                                                    ? 'Last Name'
                                                    : key === 'city'
                                                        ? 'City'
                                                        : key === 'streetAddress'
                                                            ? 'Street Address'
                                                            : key === 'apartment'
                                                                ? 'Apartment, Suite, etc. (optional)'
                                                                : key === 'mobile'
                                                                    ? 'Mobile Number'
                                                                    : 'Email Address'
                                        }
                                        value={formData[key]}
                                        onChange={handleInputChange}
                                        className="border outline-none p-2 rounded w-full"
                                        required={key !== 'apartment'}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </form>
                </motion.div>

                {/* Cart Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white p-6 rounded-lg shadow-lg mb-8"
                >
                    <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr>
                                <th className="border p-2 text-left">Product</th>
                                <th className="border p-2 text-left">Quantity</th>
                                <th className="border p-2 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems?.products?.map((item, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td className="border p-2" title={item?.product?.title}>
                                        {truncateTitle(item?.product?.title, 40)}
                                    </td>
                                    <td className="border p-2 text-center">{item.count}</td>
                                    <td className="border p-2  text-right">
                                        Rs.{item.price}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td colSpan="2" className="border p-2 text-right font-bold">
                                    Delivery charges
                                </td>
                                <td className="border p-2 text-right font-bold">
                                    Rs.{cartItems?.deliveryCharges || 0}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="border p-2 text-right font-bold">
                                    Total Price
                                </td>
                                <td className="border p-2 text-right font-bold">
                                    Rs.{calculateTotalPrice() + (cartItems?.deliveryCharges || 0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </motion.div>

                {/* Additional Instructions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-white p-6 rounded-lg shadow-lg mb-8"
                >
                    <h3 className="text-xl font-medium mb-4">Additional Instructions</h3>
                    <textarea
                        name="additionalInstructions"
                        placeholder="Enter any instructions here..."
                        value={formData.additionalInstructions}
                        onChange={handleInputChange}
                        className="border p-2 outline-none rounded w-full h-32"
                    ></textarea>
                </motion.div>

                {/* Place Order Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="text-center mb-2 md:mb-4 lg:mb-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePlaceOrder}
                        className="bg-main opacity-70 hover:opacity-90 w-full md:w-auto lg:w-auto text-white py-2 px-4 rounded-lg shadow-md"
                    >
                        {loading ? 'Placing...' : ' Place Order'}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Checkout;