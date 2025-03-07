import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import toast from 'react-hot-toast';
import { AiOutlineShopping } from 'react-icons/ai';
import { CgMenu } from 'react-icons/cg';
import { FaUserShield } from "react-icons/fa";
import { GrSearch } from "react-icons/gr";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutAPI } from '../functions/auth';
import { setUser } from '../store/authSlice';
import { fetchSearchResults, setSearchQuery } from '../store/searchSlice';
import CategoryBar from './CategoryBar';
import NavDrawer from './drawers/NavDrawer';

const Navbar = () => {
    const location = useLocation();
    const hideCategoryBarOn = ['/admin-dashboard', '/shop', '/cart/checkout', '*', '/add-product', '/edit-product']
    const cart = useSelector((state) => state.cart);
    const searchState = useSelector((state) => state.search);
    const selectedCategories = useSelector((state) => state.selectedCategories.selectedCategories);
    // console.log("Categories got from redux store------>", selectedCategories)
    const navigateTo = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [menuDisplay, setMenuDisplay] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        selectedCategory: null,
    });
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isMouseOverModal, setIsMouseOverModal] = useState(false);

    useEffect(() => {
        setCategories(selectedCategories)
    }, []);

    const searchMenuRef = useRef(null);
    const searchBarRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchState.query) {
                dispatch(fetchSearchResults(searchState.query));
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchState.query, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchMenuRef.current && !searchMenuRef.current.contains(event.target)) {
                setMenuDisplay(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalState({ isOpen: false, selectedCategory: null });
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearch(value);
        dispatch(setSearchQuery(value));
        setMenuDisplay(true);
    }, [dispatch]);

    const handleSearchKeyDown = useCallback((e) => {
        if (searchState.results.length === 0) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex((prevIndex) =>
                prevIndex < searchState.results.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : searchState.results.length - 1
            );
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleProductSelect(searchState.results[selectedIndex].slug);
        }
    }, [searchState.results, selectedIndex]);

    const handleMouseEnter = useCallback((index) => {
        setSelectedIndex(index);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logoutAPI();
            dispatch(setUser(null));
            toast.success("Logout successful");
            navigateTo("/");
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleProductSelect = useCallback((slug) => {
        setMenuDisplay(false);
        dispatch(setSearchQuery(''));
        setSearch('');
        navigateTo(`/product/${slug}`);
        setModalState({
            isOpen: false,
            selectedCategory: null,
        });
    }, [dispatch, navigateTo]);

    const toggleDrawer = useCallback(() => {
        setIsDrawerOpen(!isDrawerOpen);
    }, [isDrawerOpen]);


    const memoizedCategories = useMemo(() => selectedCategories, [selectedCategories]);
    return (
        <>
            <div className="bg-gradient-to-r from-[#020024]  via-[#090979] to-[#00d4ff] text-white py-2 px-1 md:px-4 text-center text-sm md:flex md:justify-between md:items-center">
                <div className="mb-2 md:mb-0 pr-3">
                    <Marquee speed={50} gradient={false}>Welcome to our store! Enjoy the best deals.</Marquee>
                </div>
                <div className="flex gap-4 justify-center text-sm md:text-base">
                    <Link to="/about" className=" hover:text-main">About Us</Link>
                    <Link to="/contact" className=" hover:text-main">Become a Seller</Link>
                    <Link to="/order-history" className=" hover:text-main">Track Your orders</Link>
                    <Link onClick={user && handleLogout} to={!user && "/login"} className="underline font-poppins text-main hover:text-white">{user ? "Logout" : "Sign In"}</Link>
                </div>
            </div>
            <header className="bg-white backdrop-blur-lg w-full z-[1050] shadow-md sticky top-0 py-0 md:py-2">
                <div className="container min-w-auto mx-auto px-4 md:px-2 lg:px-4 pt-2 pb-0 flex flex-col items-center lg:flex-row justify-between relative z-10">
                    <div className="flex items-center justify-between w-full pr-0 md:pr-2 lg:pr-0">
                        <CgMenu className="text-2xl md:hidden cursor-pointer" onClick={toggleDrawer} />
                        <a href="/" className="flex-shrink-0 bg-contain">
                            <img src="/logo.png" alt="Logo" className="w-full h-12 md:h-14" />
                        </a>
                        <div className="flex items-center gap-4 lg:gap-5">
                            {/* {user && (
                                <img src="/user.jpg" alt="User" className="w-12 h-12 rounded-full" />
                            )} */}
                            <div className='hidden md:hidden lg:flex text-green-800 font-bold text-base items-center gap-1'>
                                <span className='font-semibold text-xl'><IoLogoWhatsapp /></span> +92300-0000000
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 lg:gap-4 cursor-pointer relative">
                                {user && user.role === "admin" ? (
                                    <Link to="/admin-dashboard" className="relative group">
                                        <FaUserShield className="text-2xl md:text-3xl" />
                                        <span className="absolute hidden text-sm text-white bg-black rounded-md p-2 group-hover:block -bottom-14 left-1/2 transform -translate-x-1/2">Admin Dashboard</span>
                                    </Link>
                                ) : (
                                    ""
                                )}
                                <Link to="/shop" className="relative group z-20 cursor-pointer">
                                    <AiOutlineShopping className="text-2xl md:text-3xl" />
                                </Link>

                                <Link to="/cart" className="relative group z-20 cursor-pointer">
                                    <IoCartOutline className="text-2xl md:text-3xl" />
                                    <span className="absolute -top-2 -right-2 bg-main bg-opacity-90 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cart.items?.length || 0}
                                    </span>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Search bar */}
                <div className="container px-2 pt-2 md:pt-0 mb-3  md:mb-0 md:absolute top-3 md:top-5 lg:top-4" ref={searchBarRef}>
                    <div className="relative flex items-center bg-gray-100 rounded-full shadow-md w-full md:max-w-sm lg:max-w-md mx-auto z-10">
                        <input
                            type="text"
                            placeholder="Search product here..."
                            className="w-full bg-transparent outline-none px-3 py-2 md:py-2 lg:py-[0.6rem] rounded-full"
                            value={search}
                            onKeyDown={handleSearchKeyDown}
                            onChange={handleSearchChange}
                        />
                        <GrSearch className="absolute right-3 font-extrabold h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 rounded-full text-main" />
                    </div>
                </div>

                {menuDisplay && searchState.results.length > 0 && (
                    <div ref={searchMenuRef} className="absolute top-[8rem] md:top-[calc(100%+0.5rem)] left-0 gap-1 right-0 pb-1 mx-auto bg-transparent max-w-lg w-3/4 overflow-hidden backdrop-blur-md z-10">
                        {searchState.results.map((product, index) => (
                            <Link
                                key={product._id}
                                to={`/product/${product.slug}`}
                                className={`block px-4 py-2 hover:bg-gray-100 shadow-sm rounded-full mt-1 bg-white ${selectedIndex === index ? "bg-gray-200" : ""
                                    }`}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onClick={() => handleProductSelect(product.slug)}
                            >
                                {product.title}
                            </Link>
                        ))}
                    </div>
                )}

                {menuDisplay && searchState.results.length === 0 && (
                    <div ref={searchMenuRef} className="absolute top-[calc(100%+0.5rem)] left-0 right-0 mx-auto bg-white shadow-lg max-w-lg w-3/4 rounded-full overflow-hidden backdrop-blur-md z-10">
                        <p className="block px-4 py-2 text-center text-gray-500">No product matched</p>
                    </div>
                )}
            </header>

            {!hideCategoryBarOn.includes(location.pathname) &&
                < CategoryBar
                    categories={memoizedCategories}
                    modalState={modalState}
                    modalPosition={modalPosition}
                    setModalPosition={setModalPosition}
                    setModalState={setModalState} />
            }

            {/* Drawer for Mobile */}
            <NavDrawer
                isDrawerOpen={isDrawerOpen}
                toggleDrawer={toggleDrawer}
                categories={memoizedCategories}
                closeDrawer={handleCloseDrawer}
            />
        </>
    );
};

export default React.memo(Navbar);