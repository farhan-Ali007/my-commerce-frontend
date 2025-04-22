import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addItemToCart } from '../functions/cart';
import { clearCartRedux, removeFromCart, updateQuantity, removeVariant } from '../store/cartSlice';
import { truncateTitle } from '../helpers/truncateTitle'

const Cart = () => {
    const dispatch = useDispatch();
    const navigateTo = useNavigate()
    const location = useLocation();
    const [data, setData] = useState({ products: [] });
    const [cartData, setCartData] = useState([])
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;
    const cartItems = useSelector((state) => state.cart.items);
    console.log("cart items in redux---->", cartItems)

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
        <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:gap-6 lg:justify-between p-4">
                {/* View product */}
                <div className="max-w-full lg:w-[60%] px-2 md:px-4 lg:px-5">
                    <h2 className="font-bold text-center text-xl md:text-2xl text-main py-2 md:py-4 lg:py-6">
                        {cartData?.length > 0 ? "Your cart" : (
                            <p className='font-bold text-xl md:text-2xl text-gray-600'>
                                Empty cart. <Link to={"/shop"} className='text-main font-semibold underline'>Continue</Link>
                            </p>
                        )}
                    </h2>
                    {cartData.map((product) => (
                        <div
                            key={product.productId}
                            className="w-full bg-white h-auto my-2 border border-slate-300 rounded grid grid-cols-[96px,1fr] sm:grid-cols-[128px,1fr] p-2 sm:p-4"
                        >
                            {/* Product Image */}
                            <div className="w-24 sm:w-32 h-24 sm:h-32 bg-slate-200 overflow-hidden">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    alt={product.title}
                                    loading="lazy"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="px-2 sm:px-4 py-2 relative">
                                {/* Remove Button */}
                                <div
                                    onClick={() => handleRemoveItem(product.productId)}
                                    className="absolute right-0 top-0 text-white bg-main opacity-70 hover:opacity-90 mx-1 sm:mx-2 mt-2 rounded cursor-pointer"
                                >
                                    <button className="flex justify-center items-center bg-white text-sm sm:text-lg">
                                        <MdDeleteOutline size={24} className="text-main" />
                                    </button>
                                </div>

                                {/* Product Title */}
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-ellipsis line-clamp-1">
                                    {truncateTitle(product?.title, 30)}
                                </h2>
                                {/* Price Section */}
                                <div className="flex items-center justify-between ">
                                    <p className="text-red-600 font-medium text-sm sm:text-base md:text-base">
                                        {getEffectivePrice(product)}
                                    </p>
                                    <p className="text-slate-600 font-semibold text-sm sm:text-base md:text-lg">
                                        {getEffectivePrice(product) * product.count}
                                    </p>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                                    <button
                                        onClick={() => handleQuantityChange(product.productId, 'decrement')}
                                        className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 md:w-7 md:h-7 flex justify-center items-center rounded"
                                        disabled={product?.count <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="text-sm sm:text-base">{product?.count}</span>
                                    <button
                                        onClick={() => handleQuantityChange(product.productId, 'increment')}
                                        className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 md:w-7 md:h-7  flex justify-center items-center rounded"
                                        disabled={product.count >= 200}
                                    >
                                        +
                                    </button>
                                </div>
                                {/* Display Variants */}
                                {product?.selectedVariants?.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            {product.selectedVariants.map((variant, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 bg-gray-100 px-3 py-1  shadow-sm"
                                                >
                                                    <span className="text-main font-medium uppercase">{variant?.values}</span>
                                                    {/* <button
                                                        onClick={() => handleRemoveVariant(product.productId, variant?.values)}
                                                        className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 p-1 rounded-full"
                                                    >
                                                        ✕
                                                    </button> */}
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
                <div className="w-full lg:w-[40%] flex mt-2 md:mt-0 flex-col items-center ">
                    <h2 className="font-extrabold text-2xl md:text-2xl lg:text-3xl text-main mb-0 md:mb-4 lg:mb-2 pt-0 md:pt-4">
                        Summary
                    </h2>
                    <div className="mt-0 lg:mt-2 mb-4 md:mb-0 w-full max-h-auto max-w-sm shadow-lg hover:shadow-2xl rounded items-center relative md:sticky top-20">
                        <div className="h-52 md:h-52 mb-16 md:pb-0  p-1 w-full gap-2 md:p-4 lg:p-4">
                            <div className="flex items-center my-1 md:my-2 lg:md-2 justify-between px-4 gap-2 font-medium text-lg text-slate-600">
                                <p>SubTotal</p>
                                <p>{totalPrice}</p>
                            </div>
                            <div className="flex items-center my-1 md:my-2 lg:md-2 justify-between px-4 gap-4 font-medium text-lg text-slate-600">
                                <p>Delivery Charges</p>
                                <p>{deliveryCharges}</p>
                            </div>
                            <hr></hr>
                            <div className="flex items-center text-main my-1 md:my-2 lg:md-2 justify-between px-4 gap-4 font-medium text-lg ">
                                <p>Total Bill</p>
                                <p>{totalBill}</p>
                            </div>
                            <hr></hr>
                            <Link
                                // to={user ? "/cart/checkout" : "/login"}
                                // state={{ from: location.pathname }}
                                onClick={handleCheckout}
                                className="bg-main opacity-70 no-underline hover:opacity-90 my-1 md:my-2 lg:md-2 mx-2 ml-0 lg:mx-2  hover:bg-main opacity-6 p-2 text-white w-full mt-2 inline-block text-center"
                            >
                                Proceed to Payment
                            </Link>
                            <button
                                onClick={handleClearCart}
                                className="bg-red-500 hover:bg-red-700 my-1 md:my-2 lg:md-2 mx-2 ml-0  lg:mx-2 p-2 text-white w-full mt-2 inline-block text-center"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;