import { AnimatePresence, motion } from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Marquee from "react-fast-marquee";
import toast from "react-hot-toast";
import { CgMenu } from "react-icons/cg";
import { CiMobile3 } from "react-icons/ci";
import { FaUserShield } from "react-icons/fa";
import { FiSearch   } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineShoppingCart } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutAPI } from "../functions/auth";
import { menuCategories } from "../functions/categories";
import { getUserLogo } from "../functions/logo";
import { getActiveBars } from "../functions/topbar";
import { truncateTitle } from "../helpers/truncateTitle";
import { setUser } from "../store/authSlice";
import { fetchSearchResults, setSearchQuery } from "../store/searchSlice";
import CategoryBar from "./CategoryBar";
import NavDrawer from "./drawers/NavDrawer";
import NotificationBell from "./NotificationBell";
const Navbar = React.memo(() => {
  const hideCategoryBarOn = useMemo(
    () => [
      "/admin-dashboard",
      "/shop",
      "/cart",
      "/order-history",
      "/cart/checkout",
      "/add-product",
      "/404",
      "*",
      "/pages/",
      "/category/",
      "/admin/orders",
      "/admin/sections",
    ],
    []
  );

  const location = useLocation();
  const cart = useSelector((state) => state.cart);
  const searchState = useSelector((state) => state.search);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [logo, setLogo] = useState(null);
  const [topBar, setTopBar] = useState([]);
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedCategory: null,
  });
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMouseOverModal, setIsMouseOverModal] = useState(false);

  const searchMenuRef = useRef(null);
  const searchBarRef = useRef(null);
  const modalRef = useRef(null);

  const hideCategoryBar = useMemo(
    () =>
      hideCategoryBarOn.includes(location.pathname) ||
      location.pathname.startsWith("/pages/") ||
      /^\/edit-product\/[^/]+$/.test(location.pathname) ||
      /^\/product\/[^/]+$/.test(location.pathname) ||
      location.pathname.startsWith("/admin/orders/") ||
      location.pathname.startsWith("/admin/new-orders") ||
      location.pathname.startsWith("/category/"),
    [hideCategoryBarOn, location.pathname]
  );

  const fetchBarTexts = async () => {
    try {
      const response = await getActiveBars();
      setTopBar(response?.activeBars);
    } catch (error) {
      console.log("Error in fetching bar texts.");
    }
  };
  useEffect(() => {
    fetchBarTexts();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await getUserLogo();
      setLogo(response?.logo);
    } catch (error) {
      console.log("Error in fetching logo.");
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  useEffect(() => {
    const fetchSelectedCategories = async () => {
      try {
        const response = await menuCategories();
        setSelectedCategories(response.categories);
      } catch (error) {
        console.error("Error fetching selected categories:", error);
      }
    };
    fetchSelectedCategories();
  }, []);

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
      if (
        searchMenuRef.current &&
        !searchMenuRef.current.contains(event.target)
      ) {
        setMenuDisplay(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalState({ isOpen: false, selectedCategory: null });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearch(value);

      if (value.trim() === "") {
        dispatch(setSearchQuery(""));
        setMenuDisplay(false);
      } else {
        dispatch(setSearchQuery(value));
        setMenuDisplay(true);
      }
    },
    [dispatch]
  );

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (selectedIndex >= 0 && searchState.results.length > 0) {
          handleProductSelect(searchState.results[selectedIndex].slug);
        } else if (search.trim()) {
          setMenuDisplay(false);
          dispatch(setSearchQuery(""));
          setSearch("");
          navigateTo(`/search?query=${encodeURIComponent(search.trim())}`);
        }
        return;
      }

      if (searchState.results.length === 0) return;

      if (e.key === "ArrowDown") {
        setSelectedIndex((prevIndex) =>
          prevIndex < searchState.results.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : searchState.results.length - 1
        );
      }
    },
    [searchState.results, selectedIndex, search, dispatch, navigateTo]
  );

  const handleMouseEnter = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutAPI();
      dispatch(setUser(null));
      toast.success("Logout successful");
      navigateTo("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigateTo]);

  const handleProductSelect = useCallback(
    (slug) => {
      setMenuDisplay(false);
      dispatch(setSearchQuery(""));
      setSearch("");
      navigateTo(`/product/${slug}`);
      setModalState({
        isOpen: false,
        selectedCategory: null,
      });
    },
    [dispatch, navigateTo]
  );

  const handleSearchIconClick = useCallback(() => {
    if (search.trim()) {
      setMenuDisplay(false);
      dispatch(setSearchQuery(""));
      setSearch("");
      navigateTo(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  }, [search, dispatch, navigateTo]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(!isDrawerOpen);
  }, [isDrawerOpen]);

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    }),
    []
  );

  const inputVariants = useMemo(
    () => ({
      focused: { scale: 1.02, transition: { type: "spring", stiffness: 300 } },
      unfocused: { scale: 1 },
    }),
    []
  );

  const memoizedCategories = useMemo(
    () => selectedCategories,
    [selectedCategories]
  );

  const logoVariants = useMemo(
    () => ({
      hidden: { x: -100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.8,
        },
      },
    }),
    []
  );

  const supportVariants = useMemo(
    () => ({
      hidden: { x: 100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.8,
        },
      },
    }),
    []
  );

  const topBarVariants = useMemo(
    () => ({
      hidden: { y: -50, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut",
        },
      },
    }),
    []
  );

  const renderSearchResults = useMemo(
    () => (
      <AnimatePresence>
        {menuDisplay && searchState.results.length > 0 && (
          <motion.div
            ref={searchMenuRef}
            className="absolute top-full left-0 right-0 mt-2 mx-auto bg-transparent w-full max-w-md lg:max-w-lg xl:max-w-lg overflow-hidden backdrop-blur-md z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto bg-white rounded shadow-lg">
              {searchState.results.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/product/${product.slug}`}
                    className={`block px-4 py-2 no-underline hover:bg-gray-100 hover:border-primary hover:border-l-[6px] font-medium font-poppins shadow-sm rounded-full md:rounded bg-white ${
                      selectedIndex === index ? "bg-gray-200" : ""
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onClick={() => handleProductSelect(product.slug)}
                  >
                    <span className="md:hidden text-secondary">
                      {truncateTitle(product.title, 35)}
                    </span>
                    <span className="hidden text-[15px] text-secondary md:inline">
                      {truncateTitle(product.title, 60)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [
      menuDisplay,
      searchState.results,
      selectedIndex,
      handleMouseEnter,
      handleProductSelect,
    ]
  );

  const renderNoResults = useMemo(
    () =>
      menuDisplay &&
      searchState.results.length === 0 && (
        <div
          ref={searchMenuRef}
          className="absolute top-full left-0 right-0 mt-2 mx-auto bg-white shadow-lg w-full max-w-md lg:max-w-lg xl:max-w-lg rounded-lg overflow-hidden backdrop-blur-md z-10"
        >
          <p className="block px-4 py-2 text-center text-gray-500">
            No product matched
          </p>
        </div>
      ),
    [menuDisplay, searchState.results.length]
  );

  return (
    <>
      {/* Top bar */}
      <motion.div
        className="text-white py-2 px-1 md:px-4 text-center text-sm md:flex md:justify-between md:items-center lg:items-center"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary, #5a67d8), var(--color-secondary, #3182ce))",
        }}
        variants={topBarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="pr-3 hidden md:flex mb-2 md:mb-0">
          <Marquee className="text-sm font-bold" speed={50} gradient={false}>
            {topBar && topBar.length > 0
              ? topBar.map((bar, idx) => (
                  <span key={bar._id || idx} className="mx-6">
                    {bar.text}
                  </span>
                ))
              : "Welcome to our store! Enjoy the best deals."}
          </Marquee>
        </div>
        <div className="flex justify-center gap-4 text-sm md:text-base">
          {/* <Link to="/about" className="text-gray-200 no-underline hover:text-white hover:underline">About Us</Link>
                    <Link to="/contact" className="text-gray-200 no-underline hover:text-white hover:underline">Become a Seller</Link> */}
          <Link
            to="/order-history"
            className="text-gray-200 no-underline hover:text-white hover:underline"
          >
            Track Your orders
          </Link>
          <Link
            onClick={user && handleLogout}
            to={!user && "/login"}
            className="text-gray-200 underline font-poppins md:text-primary hover:text-white"
          >
            {user ? "Logout" : "Sign In"}
          </Link>
        </div>
      </motion.div>

      <header className="bg-white backdrop-blur-lg w-full z-[1050] shadow-md sticky top-0">
        <div className="container mx-auto px-4 py-2">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-[auto,1fr,auto] items-center gap-4 lg:gap-6">
            {/* Left Section - Logo */}
            <div className="flex-shrink-0">
              <motion.a
                href="/"
                className="block"
                variants={logoVariants}
                initial="hidden"
                animate="visible"
              >
                <img
                  src={logo?.image || "/logo.png"}
                  alt="Logo"
                  className="h-12"
                  loading="eager"
                />
              </motion.a>
            </div>

            {/* Center Section - Search Bar */}
            <div className="flex justify-center items-center">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-[32rem]">
                <motion.div
                  className="relative flex items-center bg-gray-50 rounded-full border border-secondary shadow-md w-full"
                  variants={inputVariants}
                  animate={isFocused ? "focused" : "unfocused"}
                >
                  <input
                    type="text"
                    placeholder="Search product here..."
                    className="w-full bg-transparent outline-none px-3 py-2 lg:px-4 lg:py-3 rounded-l-full placeholder-primary/70 text-sm"
                    value={search}
                    onKeyDown={handleSearchKeyDown}
                    onChange={handleSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    aria-label="Search products"
                  />
                  <div
                    className="absolute flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 text-white transition-transform transform rounded-full right-1 bg-primary hover:scale-105 cursor-pointer"
                    onClick={handleSearchIconClick}
                  >
                    <FiSearch className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right Section - Support & Icons */}
            <motion.div
              className="flex items-center gap-2 md:gap-4 lg:gap-6"
              variants={supportVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Support Info - Hidden on mobile, shown on medium+ screens */}
              <div className="items-center hidden gap-2 text-base font-bold text-secondary md:flex">
                <span className="text-xl font-semibold">
                  <CiMobile3
                    size={28}
                    className="md:w-7 md:h-7 lg:w-8 lg:h-8"
                  />
                </span>
                <div className="flex flex-col items-center">
                  <div className="text-xs md:text-sm font-medium text-black">
                    24<span className="text-xs">/</span>7 Support
                  </div>
                  <a
                    href="tel:0307-1111832"
                    className="text-xs md:text-sm font-medium no-underline text-primary hover:text-secondary opacity-80"
                  >
                    0307-1111832
                  </a>
                </div>
              </div>

              {/* Action Icons */}
              <div className="relative flex items-center gap-3 lg:gap-4">
                {user?.role === "admin" && (
                  <Link to="/admin-dashboard" className="relative group">
                    <FaUserShield className="text-2xl lg:text-3xl text-secondary" />
                  </Link>
                )}
                {user?.role === "admin" && <NotificationBell />}
                <Link to="/shop" className="relative z-20 cursor-pointer group">
                  <HiOutlineShoppingBag className="text-2xl lg:text-3xl text-secondary" />
                </Link>

                <Link to="/cart" className="relative z-20 cursor-pointer group">
                  <HiOutlineShoppingCart className="text-2xl lg:text-3xl text-secondary" />
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-2 -right-2 bg-primary bg-opacity-90">
                    {cart.products?.length || 0}
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between">
            <CgMenu
              className="text-2xl text-primary cursor-pointer"
              onClick={toggleDrawer}
            />

            <motion.a
              href="/"
              className="flex-shrink-0"
              variants={logoVariants}
              initial="hidden"
              animate="visible"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10"
                loading="eager"
              />
            </motion.a>

            <motion.div
              className="flex items-center gap-3"
              variants={supportVariants}
              initial="hidden"
              animate="visible"
            >
              {user?.role === "admin" && (
                <Link to="/admin-dashboard" className="relative group">
                  <FaUserShield className="text-2xl text-secondary" />
                </Link>
              )}
              {user?.role === "admin" && <NotificationBell />}
              <Link to="/shop" className="relative z-20 cursor-pointer group">
                <HiOutlineShoppingBag className="text-2xl text-secondary" />
              </Link>

              <Link to="/cart" className="relative z-20 cursor-pointer group">
                <HiOutlineShoppingCart className="text-2xl text-secondary" />
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-2 -right-2 bg-primary bg-opacity-90">
                  {cart.products?.length || 0}
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search Bar - Only shown on mobile */}
        <div className="md:hidden px-4 py-2">
          <motion.div
            className="relative flex items-center bg-gray-50 rounded-full border border-secondary shadow-md w-full"
            variants={inputVariants}
            animate={isFocused ? "focused" : "unfocused"}
          >
            <input
              type="text"
              placeholder="Search product here..."
              className="w-full bg-transparent outline-none px-3 py-2.5 rounded-l-full placeholder-primary/70 text-sm"
              value={search}
              onKeyDown={handleSearchKeyDown}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Search products"
            />
            <div
              className="absolute flex items-center justify-center w-8 h-8 text-white transition-transform transform rounded-full right-1 bg-primary hover:scale-105 cursor-pointer"
              onClick={handleSearchIconClick}
            >
              <FiSearch className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {renderSearchResults}
        {renderNoResults}
      </header>

      {!hideCategoryBar && (
        <CategoryBar
          categories={memoizedCategories}
          modalState={modalState}
          modalPosition={modalPosition}
          setModalPosition={setModalPosition}
          setModalState={setModalState}
        />
      )}

      <NavDrawer
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        categories={memoizedCategories}
        closeDrawer={handleCloseDrawer}
      />
    </>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
