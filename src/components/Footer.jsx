import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa6';
import { MdLocationOn, MdPhone, MdMail } from 'react-icons/md';

const Footer = () => {
    return (
        <>
            <div className="bg-gray-100 py-6 px-4 md:pt-10 md:px-6 relative">
                {/* Container to center content */}
                <div className="max-w-screen-xl mx-auto">
                    {/* Mobile: Stacked layout */}
                    <div className="md:hidden flex flex-col space-y-8">
                        {/* Logo and Description */}
                        <div className="text-center">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="bg-transparent mx-auto mb-3 h-16 object-contain"
                            />
                            <p className="text-gray-600 text-sm px-4">
                            Online Shopping in Pakistan at Its Finest.
                            </p>
                        </div>

                        {/* Quick Links - Horizontal Scroll on Mobile */}
                        <div className="overflow-x-auto pb-2">
                            <h3 className="text-lg font-semibold mb-3 text-center">Quick Links</h3>
                            <div className="flex justify-center space-x-6 min-w-max px-4">
                                <a href="/" className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap">
                                    Home
                                </a>
                                <a href="/shop" className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap">
                                    Shop
                                </a>
                                <a href="/about" className="text-gray-600 hover:text-main text-sm font-medium no-underline whitespace-nowrap">
                                    About Us
                                </a>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                            <div className="text-gray-600 space-y-3 text-sm">
                                <div className="flex justify-center items-center space-x-2">
                                    <MdLocationOn className='text-main' size={18} />
                                    <span>123 Street, City, Country</span>
                                </div>
                                <div className="flex justify-center items-center space-x-2">
                                    <a href="https://wa.me/+923337494323" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <FaWhatsapp className='text-main' size={18} />
                                        <span>03337494323</span>
                                    </a>
                                </div>
                                <div className="flex justify-center items-center space-x-2">
                                    <a href="tel:+923337494323" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdPhone className='text-main' size={18} />
                                        <span>03337494323</span>
                                    </a>
                                </div>
                                <div className="flex justify-center items-center space-x-2">
                                    <a href="mailto:info@example.com" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdMail className='text-main' size={18} />
                                        <span>info@example.com</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                            <div className="flex justify-center space-x-5">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FaFacebook className="text-gray-600 hover:text-[#4372E6]" size={24} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group">
                                    <FaInstagram className="transition-all duration-300 fill-gray-500 group-hover:fill-[url(#instaGradient)]" size={24} />
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                                    <FaTiktok className="text-gray-600 hover:text-black" size={24} />
                                </a>
                            </div>
                            <svg width="0" height="0">
                                <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop stopColor="#f58529" offset="0%" />
                                    <stop stopColor="#dd2a7b" offset="50%" />
                                    <stop stopColor="#8134af" offset="100%" />
                                </linearGradient>
                            </svg>
                        </div>
                    </div>

                    {/* Desktop Layout (unchanged) */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* First Div: Image and Text */}
                        <div>
                            <img src="/logo.png" alt="Logo" className="bg-transparent mx-auto mb-4 h-20 md:h-28 lg:h-32 object-cover" />
                            <p className="text-gray-600">Online Shopping in Pakistan at Its Finest.</p>
                        </div>

                        {/* Second Div: Quick Links */}
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-center md:text-start">Quick Links</h3>
                            <ul className="text-gray-600 space-y-2 text-center md:text-start list-none">
                                <li><a href="/" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">Home</a></li>
                                <li><a href="/shop" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">Shop</a></li>
                                <li><a href="/about" className="text-gray-600 hover:text-main text-[1rem] md:text-xl font-medium no-underline">About Us</a></li>
                            </ul>
                        </div>

                        {/* Third Div: Contact Information and Social Links */}
                        <div className='flex flex-col justify-start'>
                            <h3 className="text-2xl text-center md:text-start font-semibold mb-4">Contact Information</h3>
                            <div className="text-gray-600 space-y-4">
                                <div className="flex justify-center items-center md:justify-start space-x-2">
                                    <MdLocationOn className='text-main' size={22} />
                                    <span>123 Street, City, Country</span>
                                </div>
                                <div className="flex justify-center md:justify-start items-center space-x-2">
                                    <a href="https://wa.me/+923337494323" target="_blank" rel="noopener noreferrer" className="flex items-center no-underline space-x-2 hover:text-main">
                                        <FaWhatsapp className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>03337494323</span>
                                    </a>
                                </div>
                                <div className="flex justify-center md:justify-start items-center space-x-2">
                                    <a href="tel:+923337494323" className="flex items-center no-underline space-x-2 hover:text-main">
                                        <MdPhone className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>03337494323</span>
                                    </a>
                                </div>
                                <div className="flex justify-center md:justify-start items-center space-x-2">
                                    <a href="mailto:info@example.com" className="flex items-center space-x-2 no-underline hover:text-main">
                                        <MdMail className='text-main' size={22} />
                                        <span className='text-gray-600 hover:text-main'>info@example.com</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h3 className="text-2xl text-center md:text-start font-semibold mb-4">Follow Us Online</h3>
                            <div className="flex justify-center md:justify-start space-x-5 mt-4">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                    <FaFacebook className="text-gray-600 hover:text-[#4372E6]" size={30} />
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group">
                                    <FaInstagram className="transition-all duration-300 fill-gray-500 group-hover:fill-[url(#instaGradient)]" size={30} />
                                </a>
                                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
                                    <FaTiktok className="text-gray-600 hover:text-black" size={30} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Copyright Section */}
            <div className="text-white bg-main text-center py-3 text-sm md:text-base">
                <p>&copy; 2025. All Rights Reserved.</p>
            </div>
        </>
    );
};

export default Footer;