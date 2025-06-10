import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

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
            if (category.slug) {
                navigateTo(`/category/${category.slug}`);
            } else {
                console.warn("Category slug is undefined or empty");
            }
        }
    };

    const modalVariants = {
        hidden: { 
            opacity: 0,
            y: -10,
            scale: 0.8,
            transformOrigin: "top left",
            filter: "blur(10px)"
        },
        visible: { 
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 20,
                duration: 0.2,
                staggerChildren: 0.05
            }
        },
        exit: { 
            opacity: 0,
            y: -5,
            scale: 0.9,
            filter: "blur(5px)",
            transition: {
                duration: 0.15,
                ease: "easeInOut"
            }
        }
    };

    const subcategoryVariants = {
        hidden: { 
            opacity: 0, 
            x: -10,
            scale: 0.9
        },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                delay: i * 0.03, // Faster stagger
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1] // Custom easing
            }
        })
    };

    return (
        <>
            {categories && categories.length > 0 && (
                <div className="hidden py-4 md:block bg-main">
                    <div className="container flex flex-wrap justify-center gap-6 px-2 mx-auto">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="relative group"
                                ref={(el) => (categoryRefs.current[category._id] = el)}
                            >
                                <div
                                    className={`flex items-center justify-center gap-1 cursor-pointer transition-all duration-200 ${isCategoryActive(category)
                                        ? "text-gray-700"
                                        : ""
                                        }`}
                                    onClick={(e) => handleCategoryClick(category, e)}
                                    onMouseEnter={(e) => handleCategoryHover(category, e)}
                                >
                                    <div
                                        className={`text-white p-1 text-base lg:text-[18px] capitalize hover:text-gray-300 transition-colors duration-200 ${isCategoryActive(category)
                                            ? "text-gray-900"
                                            : ""
                                            }`}
                                        onClick={() => navigateTo(`/category/${category.slug}`)}
                                    >
                                        {category.name}
                                    </div>
                                    {category?.subcategories?.length > 0 && (
                                        <motion.div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCategoryClick(category, e);
                                            }}
                                            whileHover={{ rotate: 180 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <FaAngleDown className="font-extrabold text-gray-200 cursor-pointer" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Enhanced Modal for Subcategories */}
            <AnimatePresence>
                {modalState.isOpen && (
                    <motion.div
                        key="modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            position: 'absolute',
                            top: `${modalPosition.top}px`,
                            left: `${modalPosition.left}px`,
                            borderRadius: "8px",
                            background: 'white',
                            padding: '15px',
                            border: 'none',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            maxWidth: '500px',
                            maxHeight: '400px',
                            zIndex: 40,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        }}
                        ref={modalRef}
                        onMouseEnter={() => setIsMouseOverModal(true)}
                        onMouseLeave={() => {
                            setIsMouseOverModal(false);
                            setModalState({ isOpen: false, selectedCategory: null });
                        }}
                    >
                        <motion.div 
                            className="flex flex-col flex-wrap gap-2"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { 
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.03
                                    }
                                }
                            }}
                        >
                            {modalState.selectedCategory?.subcategories.map((subcategory, index) => (
                                <motion.div
                                    key={subcategory._id}
                                    custom={index}
                                    variants={subcategoryVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ 
                                        x: 5,
                                        backgroundColor: 'rgba(var(--main-color-rgb), 0.1)',
                                        transition: { duration: 0.2 }
                                    }}
                                    className="p-3 transition-all duration-200 bg-white rounded-lg cursor-pointer hover:border-l-4 border-main"
                                    onClick={() => handleSubcategoryClick(subcategory)}
                                >
                                    <span className="font-semibold capitalize text-main text-[15px]">{subcategory.name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CategoryBar;