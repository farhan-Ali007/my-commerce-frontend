import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import toast from 'react-hot-toast';
import { AiOutlineShopping } from 'react-icons/ai';
import { CgMenu } from 'react-icons/cg';
import { FaUserShield, FaMobileAlt } from "react-icons/fa";
import { FiSearch } from 'react-icons/fi'
import { IoCartOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { truncateTitle } from '../helpers/truncateTitle'
import { logoutAPI } from '../functions/auth';
import { setUser } from '../store/authSlice';
import { fetchSearchResults, setSearchQuery } from '../store/searchSlice';
import CategoryBar from './CategoryBar';
import NavDrawer from './drawers/NavDrawer';
import { menuCategories } from '../functions/categories';

const Navbar = () => {
    const location = useLocation();
    const hideCategoryBarOn = ['/admin-dashboard', '/shop', '/cart', '/order-history', '/category/:categorySlug', '/cart/checkout', '*', '/add-product', '/edit-product']
    const cart = useSelector((state) => state.cart);
    const searchState = useSelector((state) => state.search);
    const [selectedCategories, setSelectedCategories] = useState([]);
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
        const fetchSelecetedCategories = async () => {
            try {
                const response = await menuCategories();
                setSelectedCategories(response.categories);
            } catch (error) {
                console.error('Error fetching selected categories:', error);
            }
        }
        fetchSelecetedCategories();
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

        if (value.trim() === '') {
            // Clear search results when input is empty
            dispatch(setSearchQuery(''));
            setMenuDisplay(false);
        } else {
            dispatch(setSearchQuery(value));
            setMenuDisplay(true);
        }
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
            <div className="bg-gradient-to-r from-[#020024]  via-[#090979] to-[#00d4ff] text-white py-2 px-1 md:px-4 text-center text-sm md:flex md:justify-between md:items-center lg:items-center ">
                <div className="mb-2 md:mb-0 pr-3 ">
                    <Marquee className='text-sm font-bold' speed={50} gradient={false}>Welcome to our store! Enjoy the best deals.</Marquee>
                </div>
                <div className="flex gap-4 justify-center text-sm md:text-base">
                    <Link to="/about" className=" hover:text-white no-underline hover:underline text-gray-200">About Us</Link>
                    <Link to="/contact" className=" hover:text-white no-underline hover:underline text-gray-200">Become a Seller</Link>
                    <Link to="/order-history" className=" hover:text-white no-underline hover:underline text-gray-200">Track Your orders</Link>
                    <Link onClick={user && handleLogout} to={!user && "/login"} className="underline font-poppins text-gray-200 md:text-main hover:text-white">{user ? "Logout" : "Sign In"}</Link>
                </div>
            </div>
            <header className="bg-white backdrop-blur-lg w-full z-[1050] shadow-md sticky top-0 py-0 md:py-2">
                <div className="container min-w-auto mx-auto px-4 md:px-2 lg:px-4 pt-2 pb-0 flex flex-col items-center lg:flex-row justify-between relative z-10">
                    <div className="flex items-center justify-between w-full pr-0 md:pr-2 lg:pr-0">
                        <CgMenu className="text-[26px] md:hidden text-main font-bold cursor-pointer" onClick={toggleDrawer} />
                        <a href="/" className="flex-shrink-0 bg-contain">
                            <img src="/logo.png" alt="Logo" className="w-full h-12 md:h-14" />
                        </a>
                        <div className="flex items-center gap-4 lg:gap-5">
                            <div className='hidden md:hidden lg:flex text-orange-700 font-bold text-base items-center gap-1'>
                                <span className='font-semibold text-xl'><FaMobileAlt size={32} /></span>
                                <div className='flex flex-col items-center '>
                                    <div className='text-black font-medium text-sm'>24<span className='text-xs'>/</span>7 Support</div>
                                    <a href="tel:0333-7494323" className='text-main text-sm opacity-80 font-medium no-underline'>0333-7494323</a>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 lg:gap-4 cursor-pointer relative">
                                {user && user.role === "admin" ? (
                                    <Link to="/admin-dashboard" className="relative group">
                                        <FaUserShield className="text-3xl text-main" />
                                    </Link>
                                ) : (
                                    ""
                                )}
                                <Link to="/shop" className="relative group z-20 cursor-pointer">
                                    <AiOutlineShopping className="text-3xl text-main " />
                                </Link>

                                <Link to="/cart" className="relative group z-20 cursor-pointer">
                                    <IoCartOutline className="text-3xl text-main " />
                                    <span className="absolute -top-2 -right-2 bg-main bg-opacity-90 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cart.products?.length || 0}
                                    </span>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Search bar */}
                <div className="container px-2 pt-2 md:pt-0 mb-3 md:mb-0 md:absolute top-3 md:top-6 rounded-full lg:top-[18px]" ref={searchBarRef}>
                    <div className="relative flex items-center bg-gray-50 rounded-full shadow-md w-full md:max-w-sm lg:max-w-md ml-0 md:ml-[230px] lg:ml-[400px] z-10">
                        <input
                            type="text"
                            placeholder="Search product here..."
                            className="w-full bg-transparent outline-none px-3 py-2 md:py-2 lg:py-[0.6rem] rounded-full"
                            value={search}
                            onKeyDown={handleSearchKeyDown}
                            onChange={handleSearchChange}
                        />
                        <div className="absolute right-1  h-8 w-8 md:h-7 md:w-7 lg:h-9 lg:w-9 bg-main text-white flex items-center justify-center rounded-full transition-transform transform hover:scale-105">
                            <FiSearch className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                        </div>
                    </div>
                </div>

                {menuDisplay && searchState.results.length > 0 && (
                    <div ref={searchMenuRef} className="absolute top-[7rem] md:top-[calc(100%+0.5rem)] left-0 gap-1 right-0 pb-1 mx-auto bg-transparent w-[97%] md:w-[40%] overflow-hidden backdrop-blur-md z-10">
                        {searchState.results.map((product, index) => (
                            <Link
                                key={product._id}
                                to={`/product/${product.slug}`}
                                className={`block px-4 py-2 no-underline hover:bg-gray-100 shadow-sm rounded-full mt-1 bg-white ${selectedIndex === index ? "bg-gray-200" : ""
                                    }`}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onClick={() => handleProductSelect(product.slug)}
                            >
                                {truncateTitle(product.title, 35)}
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