import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { addItemToCart } from '../functions/cart';
import { truncateTitle } from '../helpers/truncateTitle';
import { clearCartRedux, removeFromCart, removeVariant, updateQuantity } from '../store/cartSlice';
import { motion } from 'framer-motion';

const Cart = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigate()
    const [data, setData] = useState({ products: [] });
    const [cartData, setCartData] = useState([])
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;
    const cartItems = useSelector((state) => state.cart.products);
    // console.log("cart items in redux---->", cartItems)

    useEffect(() => {
        setCartData(cartItems);
    }, [cartItems]);


    const getEffectivePrice = (product) => {
        if (!product) {
            return 0;
        }
        return product.salePrice != null ? product.salePrice : product.price;
    };



    // console.log("Total Price:------>", totalPrice);
    // console.log("Cart Data------->", cartData);




    const handleQuantityChange = (id, type) => {
        const product = cartItems.find((item) => item.productId === id);
        if (!product) return;

        const newQuantity = type === 'increment' ? product.count + 1 : product.count - 1;

        if (newQuantity > 0) {
            dispatch(updateQuantity({ id, count: newQuantity }));
        }
    };


    const handleRemoveItem = async (id) => {
        dispatch(removeFromCart({ id }));
        toast.success('Product removed from cart.');
    };

    const handleRemoveVariant = (productId, variantValue) => {
        dispatch(removeVariant({ productId, variantValue }));
    };

    const handleClearCart = async () => {
        try {
            dispatch(clearCartRedux());
            setData({ products: [] });
            setCartData([])
            toast.success('Cart cleared successfully.');
        } catch (error) {
            console.log('Error in clearing the cart', error);
            toast.error('Failed to clear the cart');
        }
    };

    // Check if any product has freeShipping set to true
    const hasFreeShipping = cartItems.some(item => item.freeShipping);

    const totalPrice = cartData.reduce(
        (prev, curr) => prev + curr.count * (curr.salePrice != null ? curr.salePrice : curr.price),
        0
    );

    const deliveryCharges = cartData.length === 0 || totalPrice >= 2000
        ? 0
        : cartData.every(item => item.freeShipping)  // If all products have freeShipping
            ? 0
            : 200; // Flat delivery charge if any product has freeShipping false


    const totalBill = totalPrice + deliveryCharges;

    const handleCheckout = async () => {
        // if (!user) {
        //     toast.error("Please log in to proceed.");
        //     navigateTo("/login", { state: { from: location.pathname } })
        //     return;
        // }
        try {
            setLoading(true);
            const cartPayload = {
                products: cartItems.map(({ productId, title, count, price, salePrice, image, selectedVariants }) => ({
                    productId,
                    title,
                    count,
                    price: salePrice != null ? salePrice : price,
                    image,
                    selectedVariants,
                })),
                deliveryCharges: deliveryCharges
            };
            console.log("Cart payload---->", cartPayload)

            await addItemToCart(userId, cartPayload);
            toast.success("Cart saved successfully! Proceeding to checkout...");
            navigateTo("/cart/checkout");
        } catch (error) {
            console.log("Error during checkout:", error);
            toast.error("Failed to proceed to checkout.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container min-h-screen mx-auto">
            {cartData.length === 0 ? (
                <div className="flex flex-col items-center  min-h-[70vh] px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-[300px] max-h-[300px] w-full"
                    >
                        <img 
                            src="/empty-cart.jpg" 
                            alt="Empty Cart"
                            loading='lazy' 
                            className="object-contain w-full h-auto"
                        />
                        <div className="text-center">
                            <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl font-space">
                                Your Cart is Empty
                            </h2>
                            <Link 
                                to="/shop"
                                className="inline-block px-8 py-3 font-semibold text-white no-underline transition duration-300 transform rounded-full bg-main hover:bg-main-dark hover:scale-105"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="flex flex-col p-4 lg:flex-row lg:gap-6 lg:justify-between">
                    {/* View product */}
                    <div className="max-w-full lg:w-[60%] px-0 md:px-4 lg:px-5">
                        <h2 className="py-2 text-xl font-bold text-center md:text-2xl text-main md:py-4 lg:py-6">
                            {cartData?.length > 0 ? "" : (
                                <p className='text-xl font-bold text-gray-600 md:text-2xl'>
                                    Empty cart. <Link to={"/shop"} className='font-semibold underline text-main'>Continue</Link>
                                </p>
                            )}
                        </h2>
                        {cartData.map((product) => (
                            <div
                                key={product.productId}
                                className="w-full bg-white h-auto my-2 border border-slate-300 rounded grid grid-cols-[96px,1fr] sm:grid-cols-[128px,1fr] p-2 sm:p-4"
                            >
                                {/* Product Image */}
                                <div className="w-24 h-24 overflow-hidden md:w-28 md:h-28 bg-slate-200">
                                    <img
                                        src={product.image}
                                        className="object-contain w-full h-full mix-blend-multiply"
                                        alt={product.title}
                                        loading="lazy"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="relative px-2 py-2">
                                    {/* Remove Button */}
                                    <div
                                        onClick={() => handleRemoveItem(product.productId)}
                                        className="absolute top-0 right-0 mx-1 mt-2 text-white rounded cursor-pointer bg-main opacity-70 hover:opacity-90 sm:mx-2"
                                    >
                                        <button className="flex items-center justify-center text-sm bg-white sm:text-lg">
                                            <MdDeleteOutline size={24} className="text-main" />
                                        </button>
                                    </div>

                                    {/* Product Title */}
                                    <h2 className="text-base font-medium text-ellipsis line-clamp-1">
                                        {truncateTitle(product?.title, 50)}
                                    </h2>
                                    {/* Price Section */}
                                    <div className="flex items-center justify-between ">
                                        <p className="text-sm font-medium text-red-600 sm:text-base md:text-base">
                                            Rs. {getEffectivePrice(product)}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-600 sm:text-base md:text-lg">
                                            Rs. {getEffectivePrice(product) * product.count}
                                        </p>
                                    </div>

                                    {/* Quantity Control */}
                                    <div className="flex items-center gap-2 mt-2 sm:gap-3">
                                        <button
                                            onClick={() => handleQuantityChange(product.productId, 'decrement')}
                                            className="flex items-center justify-center w-6 h-6 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white md:w-7 md:h-7"
                                            disabled={product?.count <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="text-sm sm:text-base">{product?.count}</span>
                                        <button
                                            onClick={() => handleQuantityChange(product.productId, 'increment')}
                                            className="flex items-center justify-center w-6 h-6 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white md:w-7 md:h-7"
                                            disabled={product.count >= 200}
                                        >
                                            +
                                        </button>
                                    </div>
                                    {/* Display Variants */}
                                    {product?.selectedVariants?.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-700">
                                            <div className="flex flex-col gap-2">
                                                {/* Iterate through each variant type (e.g., Color, Size) */}
                                                {product.selectedVariants.map((variant) => (
                                                    <div key={variant.name} className="flex items-center gap-2">
                                                        {/* Display variant name with improved styling */}
                                                        <span className="font-semibold text-gray-900 capitalize">{variant.name}:</span>
                                                        {/* Display selected values for this variant as badges */}
                                                        <div className="flex flex-wrap gap-1">
                                                            {variant.values.map((value, valueIndex) => (
                                                                <span
                                                                    key={`${variant.name}-${valueIndex}`}
                                                                    className="px-3 py-1 text-xs font-medium bg-main/10 text-main"
                                                                >
                                                                    {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    {cartData && cartData.length > 0 && <div className="w-full lg:w-[40%] flex mt-4 flex-col items-center">
                        <h2 className="mb-2 text-xl font-extrabold md:text-2xl lg:text-3xl text-main md:mb-4">
                            Summary
                        </h2>
                        <div className="w-full max-w-sm mt-0 mb-4 bg-white shadow-md md:sticky md:top-20">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between text-base md:text-lg text-slate-600">
                                    <p>SubTotal</p>
                                    <p>Rs. {totalPrice}</p>
                                </div>
                                <div className="flex justify-between text-base md:text-lg text-slate-600">
                                    <p>Delivery Charges</p>
                                    <p>Rs. {deliveryCharges}</p>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between text-lg font-semibold md:text-xl text-main">
                                    <p>Total Bill</p>
                                    <p>Rs. {totalBill}</p>
                                </div>
                                <hr className="my-2" />
                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-2 text-white transition duration-200 bg-main hover:bg-main-dark"
                                >
                                    Proceed to Payment
                                </button>
                                <button
                                    onClick={handleClearCart}
                                    className="w-full py-2 text-white transition duration-200 bg-red-500 hover:bg-red-700"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>}
                </div>
            )}
        </div>
    );
};

export default Cart;