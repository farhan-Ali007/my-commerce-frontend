import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100 px-4">
      {/* Animated 404 Text */}
      <motion.h1
        className="text-8xl font-bold text-primary animate-pulse"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        404
      </motion.h1>

      {/* Animated "Page Not Found" Text */}
      <motion.p
        className="text-lg text-gray-600 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Oops! The page you're looking for doesn't exist.
      </motion.p>

      {/* Animated Button to go Home */}
      <motion.div
        className="mt-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-secondary text-primary px-6 py-2 rounded-full shadow-md"
          >
            Go Back Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
