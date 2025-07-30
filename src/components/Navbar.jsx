import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Marquee from "react-fast-marquee";
import toast from "react-hot-toast";
import { AiOutlineShopping } from "react-icons/ai";
import { CgMenu } from "react-icons/cg";
import { FaUserShield, FaMobileAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { IoCartOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { truncateTitle } from "../helpers/truncateTitle";
import { logoutAPI } from "../functions/auth";
import { setUser } from "../store/authSlice";
import { fetchSearchResults, setSearchQuery } from "../store/searchSlice";
import CategoryBar from "./CategoryBar";
import NavDrawer from "./drawers/NavDrawer";
import { menuCategories } from "../functions/categories";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveBars } from "../functions/topbar";
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

  useEffect(() => {
    const fetchSelectedCategories = async () => {
      try {
        const response = await menuCategories();
        // console.log("Response from menuCategories:", response);
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
    },
    [searchState.results, selectedIndex]
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
            className="absolute top-[7rem] md:top-[calc(100%+0.5rem)] left-0 gap-1 md:gap-0 rounded-lg right-0 pb-1 mx-auto bg-transparent w-[97%] md:w-[70%] lg:w-[50%] overflow-hidden backdrop-blur-md z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {searchState.results.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/product/${product.slug}`}
                  className={`block px-4 py-2 no-underline hover:bg-gray-100 shadow-sm rounded-full md:rounded-none bg-white ${
                    selectedIndex === index ? "bg-gray-200" : ""
                  }
                                    }`}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onClick={() => handleProductSelect(product.slug)}
                >
                  <span className="md:hidden">
                    {truncateTitle(product.title, 35)}
                  </span>
                  <span className="hidden text-sm md:inline">
                    {truncateTitle(product.title, 60)}
                  </span>
                </Link>
              </motion.div>
            ))}
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
          className="absolute top-[calc(100%+0.5rem)] left-0 right-0 mx-auto bg-white shadow-lg max-w-lg w-3/4 rounded-full overflow-hidden backdrop-blur-md z-10"
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
        className="bg-gradient-to-r from-[#000000] to-[#FFB828] text-white py-2 px-1 md:px-4 text-center text-sm md:flex md:justify-between md:items-center lg:items-center"
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

      <header className="bg-white backdrop-blur-lg w-full z-[1050] shadow-md sticky top-0 py-0 md:py-2">
        <div className="container relative z-10 flex flex-col items-center justify-between px-4 pt-2 pb-0 mx-auto min-w-auto md:px-2 lg:px-4 lg:flex-row">
          <div className="flex items-center justify-between w-full pr-0 md:pr-2 lg:pr-0">
            <CgMenu
              className="text-[26px] md:hidden text-primary font-bold cursor-pointer"
              onClick={toggleDrawer}
            />
            <motion.a
              href="/"
              className="flex-shrink-0 w-40 h-12 sm:w-48 sm:h-14 md:w-auto md:h-auto"
              variants={logoVariants}
              initial="hidden"
              animate="visible"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-12 md:h-14"
                loading="eager"
              />
            </motion.a>
            <motion.div
              className="flex items-center gap-4 lg:gap-5"
              variants={supportVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="items-center hidden gap-1 text-base font-bold text-secondary md:hidden lg:flex">
                <span className="text-xl font-semibold">
                  <FaMobileAlt size={32} />
                </span>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-black">
                    24<span className="text-xs">/</span>7 Support
                  </div>
                  <a
                    href="tel:0307-1111832"
                    className="text-sm font-medium no-underline text-primary hover:text-secondary opacity-80"
                  >
                    0307-1111832
                  </a>
                </div>
              </div>

              <div className="relative flex items-center gap-2 cursor-pointer md:gap-4 lg:gap-4">
                {user?.role === "admin" && (
                  <Link to="/admin-dashboard" className="relative group">
                    <FaUserShield className="text-3xl text-secondary" />
                  </Link>
                )}
                {user && <NotificationBell />}
                <Link to="/shop" className="relative z-20 cursor-pointer group">
                  <AiOutlineShopping className="text-3xl text-secondary" />
                </Link>

                <Link to="/cart" className="relative z-20 cursor-pointer group">
                  <IoCartOutline className="text-3xl text-secondary" />
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -top-2 -right-2 bg-primary bg-opacity-90">
                    {cart.products?.length || 0}
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="container px-2 pt-2 md:pt-0 mb-3 md:mb-0 md:absolute top-3 md:top-6 rounded-full lg:top-[18px]"
          ref={searchBarRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="relative flex items-center bg-gray-50 rounded-full border md:border-[1.5px] border-secondary shadow-md w-full md:max-w-sm lg:max-w-md ml-0 md:ml-[230px] lg:ml-[400px] z-10"
            variants={inputVariants}
            animate={isFocused ? "focused" : "unfocused"}
          >
            <input
              type="text"
              placeholder="Search product here..."
              className="w-full bg-transparent outline-none px-3 py-2 md:py-2 lg:py-[0.6rem] rounded-full placeholder-primary/70"
              value={search}
              onKeyDown={handleSearchKeyDown}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Search products"
            />
            <div className="absolute flex items-center justify-center w-8 h-8 text-white transition-transform transform rounded-full right-1 md:h-7 md:w-7 lg:h-9 lg:w-9 bg-primary hover:scale-105">
              <FiSearch className="w-4 h-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
            </div>
          </motion.div>
        </motion.div>

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
