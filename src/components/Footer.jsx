import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa6';
import { MdLocationOn, MdPhone, MdMail } from 'react-icons/md';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const socialIconVariants = {
  hover: {
    scale: 1.2,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.9 }
};

const linkVariants = {
  hover: {
    x: 5,
    color: "#4F46E5" // Your main color
  }
};

const Footer = () => {
    return (
        <>
            <div className="bg-main/20 py-6 px-4 md:pt-10 md:px-6 relative">
                {/* Container to center content */}
                <motion.div 
                  className="max-w-screen-xl mx-auto"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={containerVariants}
                >
                    {/* Mobile: Stacked layout */}
                    <div className="md:hidden flex flex-col space-y-8">
                        {/* Logo and Description */}
                        <motion.div 
                          className="text-center"
                          variants={itemVariants}
                        >
                            <motion.img
                                src="/logo.png"
                                alt="Logo"
                                className="bg-transparent mx-auto mb-3 h-16 object-contain"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            />
                            <motion.p 
                              className="text-gray-600 text-sm px-4"
                              whileHover={{ scale: 1.02 }}
                            >
                                Online Shopping in Pakistan at Its Finest.
                            </motion.p>
                        </motion.div>

                        {/* Quick Links - Horizontal Scroll on Mobile */}
                        <motion.div 
                          className="overflow-x-auto pb-2"
                          variants={itemVariants}
                        >
                            <motion.h3 
                              className="text-lg font-semibold mb-3 text-center"
                              whileHover={{ scale: 1.02 }}
                            >
                                Quick Links
                            </motion.h3>
                            <div className="flex justify-center space-x-6 min-w-max px-4">
                                <motion.a 
                                  href="/" 
                                  className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap"
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    Home
                                </motion.a>
                                <motion.a 
                                  href="/shop" 
                                  className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap"
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    Shop
                                </motion.a>
                                <motion.a 
                                  href="/about" 
                                  className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap"
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    About Us
                                </motion.a>
                            </div>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div 
                          className="text-center"
                          variants={itemVariants}
                        >
                            <motion.h3 
                              className="text-lg font-semibold mb-3"
                              whileHover={{ scale: 1.02 }}
                            >
                                Contact Us
                            </motion.h3>
                            <div className="text-gray-600 space-y-3 text-sm">
                                <motion.div 
                                  className="flex justify-center items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <MdLocationOn className='text-main' size={18} />
                                    <span>123 Street, City, Country</span>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="https://wa.me/+923337494323" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <FaWhatsapp className='text-main' size={18} />
                                        <span>03337494323</span>
                                    </a>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="tel:+923337494323" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdPhone className='text-main' size={18} />
                                        <span>03337494323</span>
                                    </a>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="mailto:info@example.com" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdMail className='text-main' size={18} />
                                        <span>info@example.com</span>
                                    </a>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Social Media Links */}
                        <motion.div 
                          className="text-center"
                          variants={itemVariants}
                        >
                            <motion.h3 
                              className="text-lg font-semibold mb-3"
                              whileHover={{ scale: 1.02 }}
                            >
                                Follow Us
                            </motion.h3>
                            <div className="flex justify-center space-x-5">
                                <motion.a 
                                  href="https://facebook.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaFacebook className="text-gray-600 hover:text-[#4372E6]" size={24} />
                                </motion.a>
                                <motion.a 
                                  href="https://instagram.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="group"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaInstagram className="transition-all duration-300 fill-gray-500 group-hover:fill-[url(#instaGradient)]" size={24} />
                                </motion.a>
                                <motion.a 
                                  href="https://tiktok.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaTiktok className="text-gray-600 hover:text-black" size={24} />
                                </motion.a>
                            </div>
                            <svg width="0" height="0">
                                <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop stopColor="#f58529" offset="0%" />
                                    <stop stopColor="#dd2a7b" offset="50%" />
                                    <stop stopColor="#8134af" offset="100%" />
                                </linearGradient>
                            </svg>
                        </motion.div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* First Div: Image and Text */}
                        <motion.div variants={itemVariants}>
                            <motion.img 
                              src="/logo.png" 
                              alt="Logo" 
                              className="bg-transparent mx-auto mb-4 h-20 md:h-28 lg:h-32 object-cover"
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            />
                            <motion.p 
                              className="text-gray-800 font-semibold text-base"
                              whileHover={{ scale: 1.02 }}
                            >
                                Online Shopping in Pakistan at Its Finest.
                            </motion.p>
                        </motion.div>

                        {/* Second Div: Quick Links */}
                        <motion.div variants={itemVariants}>
                            <motion.h3 
                              className="text-2xl font-semibold mb-4 text-center md:text-start"
                              whileHover={{ scale: 1.02 }}
                            >
                                Quick Links
                            </motion.h3>
                            <ul className="text-gray-600 space-y-2 text-center md:text-start list-none">
                                <motion.li
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    <a href="/" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">Home</a>
                                </motion.li>
                                <motion.li
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    <a href="/shop" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">Shop</a>
                                </motion.li>
                                <motion.li
                                  variants={linkVariants}
                                  whileHover="hover"
                                >
                                    <a href="/about" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">About Us</a>
                                </motion.li>
                            </ul>
                        </motion.div>

                        {/* Third Div: Contact Information and Social Links */}
                        <motion.div 
                          className='flex flex-col justify-start'
                          variants={itemVariants}
                        >
                            <motion.h3 
                              className="text-2xl text-center md:text-start font-semibold mb-4"
                              whileHover={{ scale: 1.02 }}
                            >
                                Contact Information
                            </motion.h3>
                            <div className="text-gray-600 space-y-4">
                                <motion.div 
                                  className="flex justify-center items-center md:justify-start space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <MdLocationOn className='text-main' size={22} />
                                    <span>123 Street, City, Country</span>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center md:justify-start items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="https://wa.me/+923337494323" target="_blank" rel="noopener noreferrer" className="flex items-center no-underline space-x-2 hover:text-main">
                                        <FaWhatsapp className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>03337494323</span>
                                    </a>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center md:justify-start items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="tel:+923337494323" className="flex items-center no-underline space-x-2 hover:text-main">
                                        <MdPhone className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>03337494323</span>
                                    </a>
                                </motion.div>
                                <motion.div 
                                  className="flex justify-center md:justify-start items-center space-x-2"
                                  whileHover={{ x: 5 }}
                                >
                                    <a href="mailto:info@example.com" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdMail className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>info@example.com</span>
                                    </a>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Social Media Links */}
                        <motion.div variants={itemVariants}>
                            <motion.h3 
                              className="text-2xl text-center md:text-start font-semibold mb-4"
                              whileHover={{ scale: 1.02 }}
                            >
                                Follow Us Online
                            </motion.h3>
                            <div className="flex justify-center md:justify-start space-x-5 mt-4">
                                <motion.a 
                                  href="https://facebook.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaFacebook className="text-gray-600 hover:text-[#4372E6]" size={30} />
                                </motion.a>
                                <motion.a 
                                  href="https://instagram.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="group"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaInstagram className="transition-all duration-300 fill-gray-500 hover:fill-[#E1306C]" size={30} />
                                </motion.a>
                                <motion.a 
                                  href="https://tiktok.com" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  variants={socialIconVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                    <FaTiktok className="text-gray-600 hover:text-black" size={30} />
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
            {/* Copyright Section */}
            <motion.div 
              className="text-white bg-main text-center py-3 text-sm md:text-base"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
                <p>&copy; 2025. All Rights Reserved.</p>
            </motion.div>
        </>
    );
};

export default Footer;