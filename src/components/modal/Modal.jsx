import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6"
                    onClick={onClose} // Close when clicking outside
                >
                    <motion.div
                        initial={{ y: "-100vh", opacity: 0 }}
                        animate={{ y: "0", opacity: 1 }}
                        exit={{ y: "100vh", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="bg-white rounded-lg shadow-xl relative max-w-lg w-full max-h-full overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal; 