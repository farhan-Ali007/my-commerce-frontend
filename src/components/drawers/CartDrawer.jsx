import React, { useEffect, useState } from 'react';
import Drawer from 'react-modern-drawer';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { truncateTitle } from '../../helpers/truncateTitle';
import { motion } from 'framer-motion';

const CartDrawer = ({ isDrawerOpen, setIsDrawerOpen }) => {
    const cartItems = useSelector((state) => state.cart.items);

    const [delayedOpen, setDelayedOpen] = useState(false);

    useEffect(() => {
        if (isDrawerOpen) {
            setTimeout(() => setDelayedOpen(true), 300);
        } else {
            setDelayedOpen(false);
        }
    }, [isDrawerOpen]);

    // Calculate cart total from Redux state
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.count, 0);

    return (
        <Drawer
            open={delayedOpen}
            onClose={() => setIsDrawerOpen(false)}
            direction="right"
            size={400}
            className="relative !z-[1200] max-w-56 md:max-w-64"
        >
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col h-full p-4"
            >
                <h2 className="text-2xl font-extrabold text-main mb-4 text-center">Your Cart</h2>
                <div className="flex-1 overflow-y-auto">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 mb-4">
                                <img
                                    src={item?.image || "https://via.placeholder.com/500"}
                                    alt={truncateTitle(item?.title, 30)}
                                    className="w-20 h-20 object-cover aspect-square"
                                />
                                <div className="w-full flex flex-col">
                                    <h3 className="text-sm text-main font-semibold">
                                        {truncateTitle(item?.title, 30)}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-600">
                                        {item?.count} X Rs. {item?.price}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">Your cart is empty</p>
                    )}
                    <div className="text-xl flex justify-between border-t-2 border-b-2 py-2">
                        <p>Subtotal:</p>
                        <p>Rs. {cartTotal}</p>
                    </div>
                </div>
                <Link
                    to="/cart"
                    className="bg-main absolutet bottom-0 no-underline opacity-70 text-white font-bold py-2 my-1 px-4 text-center hover:opacity-90"
                    onClick={() => setIsDrawerOpen(false)}
                >
                    Go to Cart
                </Link>
            </motion.div>
        </Drawer>
    );
};

export default CartDrawer;
