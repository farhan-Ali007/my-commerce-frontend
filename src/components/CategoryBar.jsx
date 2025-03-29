import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation

const CategoryBar = ({ categories, modalPosition, setModalPosition, modalState, setModalState }) => {
    const navigateTo = useNavigate();
    const location = useLocation(); // Get current URL path
    const [isMouseOverModal, setIsMouseOverModal] = useState(false);

    const categoryRefs = useRef({});
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setModalState({ isOpen: false, selectedCategory: null });
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Function to check if a category is active based on the URL
    const isCategoryActive = (category) => {
        const path = location.pathname; // Current URL path
        return path.startsWith(`/category/${category.slug}`);
    };

    const handleCategoryHover = (category, event) => {
        if (category.subcategories.length > 0) {
            if (modalState.selectedCategory?._id === category._id) {
                setModalState({ isOpen: false, selectedCategory: null });
            } else {
                const categoryElement = categoryRefs.current[category._id];
                if (categoryElement) {
                    const rect = categoryElement.getBoundingClientRect();
                    setModalPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                    });
                }
                setModalState({ isOpen: true, selectedCategory: category });
            }
        }
    };

    const handleSubcategoryClick = (subcategory) => {
        const categorySlug = modalState.selectedCategory.slug;
        const subcategorySlug = subcategory.slug;

        console.log("Category Slug:", categorySlug);
        console.log("Subcategory Slug:", subcategorySlug);

        if (!categorySlug || !subcategorySlug) {
            console.error("Category or Subcategory slug is missing!");
            return;
        }

        navigateTo(`/category/${categorySlug}/subcategory/${subcategorySlug}`);
        console.log("Navigating to:", `/category/${categorySlug}/subcategory/${subcategorySlug}`);

        setModalState({ isOpen: false, selectedCategory: null });
    };

    const handleCategoryClick = (category, event) => {
        if (category.subcategories.length > 0) {
            if (modalState.selectedCategory?._id === category._id) {
                setModalState({ isOpen: false, selectedCategory: null });
            } else {
                const categoryElement = categoryRefs.current[category._id];
                if (categoryElement) {
                    const rect = categoryElement.getBoundingClientRect();
                    setModalPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                    });
                }

                setModalState({ isOpen: true, selectedCategory: category });
            }
        } else {
            // Ensure the category has a valid slug before navigating
            if (category.slug) {
                navigateTo(`/category/${category.slug}`);
            } else {
                console.warn("Category slug is undefined or empty");
            }
        }
    };

    return (
        <>
            <div className="py-4 hidden md:block bg-main">
                <div className="container mx-auto px-2 flex flex-wrap justify-center gap-6">
                    {categories.map((category) => (
                        <div
                            key={category._id}
                            className="relative group"
                            ref={(el) => (categoryRefs.current[category._id] = el)}
                        >
                            <div
                                className={`flex items-center gap-1 cursor-pointer ${isCategoryActive(category)
                                    ? "text-gray-700 "
                                    : ""
                                    }`}
                                onClick={(e) => handleCategoryClick(category, e)}
                                onMouseEnter={(e) => handleCategoryHover(category, e)}
                            >
                                <div
                                    className={`text-white p-1 font-semibold text-xl capitalize hover:text-gray-300 ${isCategoryActive(category)
                                        ? "text-gray-900"
                                        : ""
                                        }`}
                                    onClick={() => navigateTo(`/category/${category.slug}`)}
                                >
                                    {category.name}
                                </div>
                                {category.subcategories.length > 0 && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCategoryClick(category, e);
                                        }}
                                    >
                                        <FaAngleDown className="text-gray-200 font-extrabold cursor-pointer" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Subcategories */}
            <AnimatePresence>
                {modalState.isOpen && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute',
                            top: `${modalPosition.top}px`,
                            left: `${modalPosition.left}px`,
                            borderRadius: "5px",
                            background: 'white',
                            padding: '10px',
                            border: 'none',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                            width: '200px',
                            height: 'fit-content',
                            zIndex: 40,
                        }}
                        ref={modalRef}
                        onMouseEnter={() => setIsMouseOverModal(true)}
                        onMouseLeave={() => {
                            setIsMouseOverModal(false);
                            setModalState({ isOpen: false, selectedCategory: null });
                        }}
                    >
                        <div className="grid grid-cols-1 gap-2">
                            {modalState.selectedCategory?.subcategories.map((subcategory) => (
                                <div
                                    key={subcategory._id}
                                    className="p-2 bg-white rounded cursor-pointer hover:bg-main hover:border-l-4 border-main hover:bg-opacity-20 transition-colors duration-200"
                                    onClick={() => handleSubcategoryClick(subcategory)}
                                >
                                    <span className="font-bold capitalize text-main">{subcategory.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CategoryBar;