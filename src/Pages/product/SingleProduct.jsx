import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { toast } from 'react-hot-toast';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaChevronUp, FaWhatsapp } from "react-icons/fa6";
import { TiShoppingCart } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CartDrawer from "../../components/drawers/CartDrawer";
import { Helmet } from 'react-helmet-async'
import ReviewForm from "../../components/forms/ReviewForm";
import RelatedProducts from "../../components/RelatedProducts";
import SingleProductSkeleton from "../../components/skeletons/SingleProductSkeleton";
import { addItemToCart } from "../../functions/cart";
import { getProductBySlug, getRelatedProducts } from "../../functions/product";
import { addToCart } from '../../store/cartSlice';
import { getProductSchemaData } from "../../helpers/getProductSchema";
import { motion, AnimatePresence } from "framer-motion";

const SingleProduct = () => {
    const dispatch = useDispatch();
    const { slug } = useParams();
    const navigateTo = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;

    // State management
    const [product, setProduct] = useState({});
    const [originalPrice, setOriginalPrice] = useState(0);
    const [productVariants, setProductVariants] = useState([]);
    const [totalPages, setTotalPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [loading, setLoading] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [error, setError] = useState(null);
    const [hoveredVariantImage, setHoveredVariantImage] = useState(null); // New state for hovered variant image
    const [hoverPreviewPosition, setHoverPreviewPosition] = useState({ x: 0, y: 0 }); // New state for preview position

    // Refs
    const imageRef = useRef(null);
    const thumbnailRef = useRef(null);

    // Memoized calculations
    const currentPrice = useMemo(() => {
        if (!product) return 0;

        let calculatedPrice = product.salePrice || product.price;

        // Calculate price based on selected variants with prices
        // Check each selected value within each variant type array
        for (const [variantName, selectedValues] of Object.entries(selectedVariants)) {
            if (selectedValues && selectedValues.length > 0) {
                const variant = product.variants?.find(v => v.name === variantName);
                if (variant) {
                    // For simplicity, if multiple values are selected, 
                    // we'll use the price of the *first* selected value that has a price defined.
                    // A more complex logic might sum or average prices if needed.
                    for (const value of selectedValues) {
                        const variantValue = variant.values?.find(v => v.value === value);
                        // Check for explicit price (could be 0 or a number)
                        if (variantValue?.price !== undefined && variantValue?.price !== null) {
                             // Assuming the price of the *first* selected value with a price overrides the base price
                            calculatedPrice = variantValue.price;
                            break; // Stop after finding the first selected value with a price
                        }
                    }
                }
            }
        }

        return calculatedPrice;
    }, [selectedVariants, product]);

    // Animation variants
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.6, 
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
    }), []);

    const itemVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    }), []);

    // Image handling
    const handleImageLoad = useCallback((url) => {
        setLoadedImages(prev => new Set(prev).add(url));
    }, []);

    const handleMouseEnterProduct = useCallback((imageURL) => {
        if (!loadedImages.has(imageURL)) {
            const img = new Image();
            img.src = imageURL;
            img.onload = () => {
                setSelectedImage(imageURL);
                handleImageLoad(imageURL);
            };
        } else {
            setSelectedImage(imageURL);
        }

        // // Removed logic that updates selectedVariants on mouse enter to allow clicking to select variants.
        // let variantValueMatched = false;
        // for(const variant of product?.variants || []) {
        //     for(const value of variant.values) {
        //         if (value.image === imageURL) {
        //             variantValueMatched = true;
        //             break;
        //         }
        //     }
        //     if (variantValueMatched) break;
        // }
        // if (!variantValueMatched || product?.images.includes(imageURL)) {
        //     // Clear selections if it's a main image or unassociated image (on hover) - removed
        // }

    }, [loadedImages, handleImageLoad, product?.variants, product?.images]);

    const handleMouseMove = useCallback((e) => {
        if (imageRef.current) {
            const { naturalWidth, naturalHeight, width, height } = imageRef.current;
            const rect = imageRef.current.getBoundingClientRect();

            // Calculate mouse position relative to the image
            const mouseX = Math.max(0, Math.min(e.clientX - rect.left, width));
            const mouseY = Math.max(0, Math.min(e.clientY - rect.top, height));

            // Calculate percentage position within the image
            const xPercent = (mouseX / width) * 100;
            const yPercent = (mouseY / height) * 100;

            // Calculate background position (centered on cursor)
            const backgroundX = (xPercent / 100) * naturalWidth - 125;
            const backgroundY = (yPercent / 100) * naturalHeight - 125;

            // Ensure we don't go outside image bounds
            const boundedX = Math.max(0, Math.min(backgroundX, naturalWidth - 250));
            const boundedY = Math.max(0, Math.min(backgroundY, naturalHeight - 250));

            setZoomStyle({
                mouseX,
                mouseY,
                backgroundX: boundedX,
                backgroundY: boundedY,
                top: e.clientY - 125, // Adjust position based on cursor
                left: e.clientX - 125, // Adjust position based on cursor
                backgroundSize: `${naturalWidth}px ${naturalHeight}px`,
                display: 'block' // Make sure the zoom lens is visible
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setZoomStyle({}); // Hide the zoom lens
    }, []);

    const handleVariantImageMouseEnter = useCallback((imageURL, e) => {
        setHoveredVariantImage(imageURL);
        setHoverPreviewPosition({
            x: e.clientX + 20, // Offset 20px to the right of the cursor
            y: e.clientY + 20  // Offset 20px below the cursor
        });
    }, []);

    const handleVariantImageMouseLeave = useCallback(() => {
        setHoveredVariantImage(null);
        setHoveredPreviewPosition({ x: 0, y: 0 }); // Reset position
    }, []);

    const scrollThumbnails = useCallback((direction) => {
        if (thumbnailRef.current) {
            const scrollAmount = 100; // Adjust scroll amount as needed
            thumbnailRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    }, []);

    // Data fetching
    const fetchRelatedProducts = useCallback(async () => {
        try {
            const response = await getRelatedProducts(product.category?._id, product._id);
            setRelatedProducts(response?.products);
            setCurrentPage(response?.currentPage);
            setTotalPages(response?.totalPages);
        } catch (error) {
            console.error("Error in fetching related products", error);
        }
    }, [product]);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProductBySlug(slug);
            setProduct(response?.product);
            setOriginalPrice(response?.product?.salePrice || response?.product?.price);
            setProductVariants(response?.product?.variants || []);

            // Preload all product images including variant images
            const allImages = new Set([
                ...(response?.product?.images || []),
                ...(response?.product?.variants?.flatMap(variant => 
                    variant.values.map(val => val.image).filter(Boolean)
                ) || [])
            ].filter(Boolean));

            // Preload all images
            allImages.forEach(img => {
                const image = new Image();
                image.src = img;
                image.onload = () => handleImageLoad(img);
            });

            // Set initial selected image to the first main image if available
            if (response?.product?.images?.length) {
                setSelectedImage(response.product.images[0]);
                 // Clear any potential initial variant selections on product load
                setSelectedVariants({});
            }

            // setLoading(false); // Removed from here
        } catch (error) {
            console.error("Error in fetching product", error);
            // setLoading(false); // Removed from here
            setError("Failed to load product data."); // Add error state setting
        } finally {
             // Ensure loading is false after fetch attempt (success or failure)
             setLoading(false);
        }
    }, [slug, handleImageLoad]);

    // Effects
    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        if (product?.category?._id) {
            fetchRelatedProducts();
        }
    }, [product, fetchRelatedProducts]);

     // Effect to update selected image based on selected variants
    useEffect(() => {
        let imageToSet = product?.images?.[0]; // Default to first main image

        // Look for an image associated with the *first* selected variant value found across all selected variants
        // This logic might need refinement depending on desired image behavior with multiple variant selections.
        outerLoop: for (const [variantName, selectedValues] of Object.entries(selectedVariants)) {
            if (selectedValues && selectedValues.length > 0) {
                 const variant = product.variants?.find(v => v.name === variantName);
                 if (variant) {
                     for (const selectedValue of selectedValues) {
                         const variantValue = variant.values?.find(val => val.value === selectedValue);
                         if (variantValue?.image) {
                            imageToSet = variantValue.image;
                            break outerLoop; // Use the first variant image found across any selected value and stop
                         }
                     }
                 }
            }
        }

        // Only update if the image is different from the current one to prevent unnecessary re-renders
        if (selectedImage !== imageToSet) {
            setSelectedImage(imageToSet);
        }

    }, [selectedVariants, product?.images, product?.variants, selectedImage]);


    // Variant and cart handlers
    const handleVariantChange = useCallback((variantName, value) => {
        setSelectedVariants(prev => {
            const currentSelectedValues = prev[variantName] || [];
            const isSelected = currentSelectedValues.includes(value);

            let newSelectedValues;
            if (isSelected) {
                // If already selected, remove it
                newSelectedValues = currentSelectedValues.filter(v => v !== value);
            } else {
                // If not selected, add it
                newSelectedValues = [...currentSelectedValues, value];
            }

            // If no values are selected for this variant type, remove the variant name from state
            if (newSelectedValues.length === 0) {
                const updatedVariants = { ...prev };
                delete updatedVariants[variantName];
                return updatedVariants;
            } else {
                return {
                    ...prev,
                    [variantName]: newSelectedValues
                };
            }
        });
         // Image and price updates are now handled in useEffect and useMemo respectively

    }, []);

    const prepareVariantsForBackend = useCallback(() => {
        // Transforms { Color: ['Red', 'Blue'], Size: ['M'] } 
        // into [{ name: 'Color', values: ['Red', 'Blue'] }, { name: 'Size', values: ['M'] }]
        return Object.entries(selectedVariants)
            .filter(([variantName, values]) => values && values.length > 0) // Only include variants with selected values
            .map(([variantName, values]) => ({
            name: variantName,
            values: values || [], // Ensure values is an array
        }));
    }, [selectedVariants]);

    const handleAddToCart = useCallback(async () => {
        // Add validation here if certain variants are required before adding to cart

        const variantsForBackend = prepareVariantsForBackend();

        // Determine the image for the cart item. Use the image of the first selected variant value found across any selected variant,
        // or the first main product image if no variant image is found.
        let cartItemImage = product?.images?.[0];

         outerLoop: for (const [variantName, selectedValues] of Object.entries(selectedVariants)) {
            if (selectedValues && selectedValues.length > 0) {
                 const variant = product.variants?.find(v => v.name === variantName);
                 if (variant) {
                     for (const selectedValue of selectedValues) {
                         const variantValue = variant.values?.find(val => val.value === selectedValue);
                         if (variantValue?.image) {
                            cartItemImage = variantValue.image;
                            break outerLoop; // Use the first variant image found and stop
                         }
                     }
                 }
            }
        }


        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: currentPrice, // Use the calculated current price
            image: cartItemImage, // Use the determined cart item image
            count: selectedQuantity,
            selectedVariants: variantsForBackend, // Pass the array of {name, values} objects
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.deliveryCharges
        };

        try {
            // Dispatch to Redux store
            dispatch(addToCart(cartItem));

            // Backend cart update is a separate step and depends on how your backend API handles it.
            // It should be designed to receive the array of selectedVariants as part of the item data.

            toast.success(`${product?.title} added to cart!`);
            setIsDrawerOpen(true);
        } catch (error) {
            toast.error("Failed to add the product to the cart. Please try again.");
            console.error("Error adding item to cart:", error);
        }
    }, [prepareVariantsForBackend, selectedVariants, product,
        currentPrice, selectedQuantity, dispatch]);

     const currentCartItems = useSelector((state) => state.cart.products);


    const handleByNow = useCallback(async () => {
        // Add validation here if certain variants are required before proceeding

        const variantsForBackend = prepareVariantsForBackend();

        // Determine the image for the cart item.
        let cartItemImage = product?.images?.[0];

        outerLoop: for (const [variantName, selectedValues] of Object.entries(selectedVariants)) {
            if (selectedValues && selectedValues.length > 0) {
                 const variant = product.variants?.find(v => v.name === variantName);
                 if (variant) {
                     for (const selectedValue of selectedValues) {
                         const variantValue = variant.values?.find(val => val.value === selectedValue);
                         if (variantValue?.image) {
                            cartItemImage = variantValue.image;
                            break outerLoop; // Use the first variant image found and stop
                         }
                     }
                 }
            }
        }

        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: currentPrice,
            image: cartItemImage,
            count: selectedQuantity,
            selectedVariants: variantsForBackend,
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.deliveryCharges
        };

        try {
             // Add the new item to Redux cart
            dispatch(addToCart(cartItem));

            toast.success("Proceeding to checkout...");
            // Adding a small delay to allow Redux state update before navigation
            setTimeout(() => {
                 navigateTo("/cart/checkout");
            }, 50);

        } catch (error) {
            toast.error("Failed to proceed to checkout. Please try again.");
            console.error("Error during Buy Now:", error);
        }
    }, [prepareVariantsForBackend, selectedVariants, product, currentPrice, selectedQuantity, dispatch, navigateTo]);


    const handleQuantityChange = useCallback((operation) => {
        setSelectedQuantity((prev) =>
            operation === "increase"
                ? Math.min(prev + 1, product?.stock || Infinity)
                : Math.max(1, prev - 1)
        );
    }, [product?.stock]);

    const toggleDescription = useCallback(() => {
        setShowFullDescription(!showFullDescription);
    }, [showFullDescription]);

    const handleWhatsAppOrder = useCallback(() => {
        const phoneNumber = "923337494323";
        const productLink = window.location.href;
        const imageLink = product?.image;

        const message = `*🛒 New Order Request*\n\n*Product:* ${product?.title}\n*Price:* Rs ${currentPrice}\n*Image:* ${imageLink}\n*View Product:* ${productLink}\n\nThank you!`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }, [product, currentPrice]);

    // Render
    if (loading) return <SingleProductSkeleton />;
    if (!product) return <div className="py-20 text-center">Product not found!</div>;

    const schemaData = getProductSchemaData(product, currentPrice);
    if (!schemaData) return null;

    return (
        <div className="px-4 pt-1 max-w-screen md:px-5 md:pt-3">
            <Helmet>
                <title>{`${product?.title || "Product"} | Etimad Mart`}</title>
                <meta name="description" content={product?.description?.substring(0, 160) || ""} />
                <meta property="og:type" content="product" />
                <meta property="og:title" content={product?.title || "Product"} />
                <meta property="og:description" content={product?.description?.substring(0, 160) || ""} />
                <meta property="og:image" content={selectedImage || product?.images?.[0] || "default-image.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={product?.title || "Product"} />
                <meta name="twitter:description" content={product?.description?.substring(0, 160) || ""} />
                <meta name="twitter:image" content={selectedImage || product?.images?.[0] || "default-image.jpg"} />
                <link rel="canonical" href={`https://yourstore.com/products/${slug}`} />
            </Helmet>

            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>

            <div className="flex flex-col gap-10 md:flex-row">
                {/* Product Images */}
                <div className="flex flex-col w-full md:w-1/2 md:flex-row">
                    {/* Main Image */}
                    <div className="relative flex-1 order-1 mt-4 md:order-2 md:mt-3 ">
                        <div
                            className="overflow-hidden aspect-square h-[350px] md:h-[400px] md:w-[400px] w-[350px] border border-red-100 mx-auto relative"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                ref={imageRef}
                                src={selectedImage || "https://via.placeholder.com/500"}
                                alt={product?.title || "Product Image"}
                                className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${loadedImages.has(selectedImage) ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onLoad={() => handleImageLoad(selectedImage)}
                            />
                            {!loadedImages.has(selectedImage) && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                            )}
                            {zoomStyle.backgroundX !== undefined && (
                                <div
                                    style={{
                                        position: "fixed",
                                        border: "1px solid #ccc",
                                        borderRadius: "50%",
                                        width: "280px",
                                        height: "280px",
                                        zIndex: 2000,
                                        backgroundImage: `url(${selectedImage || "https://via.placeholder.com/500"})`,
                                        backgroundSize: `${zoomStyle.backgroundSize || 'auto'}`,
                                        backgroundPosition: `-${zoomStyle.backgroundX}px -${zoomStyle.backgroundY}px`,
                                        pointerEvents: "none",
                                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                                        backgroundColor: "white",
                                        display: "block",
                                        top: `${zoomStyle.top}px`,
                                        left: `${zoomStyle.left}px`,
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Thumbnail List */}
                    <div className="relative flex flex-row items-center order-2 mt-8 md:w-20 md:order-1 max-h-72 md:flex-col">
                        <button
                            onClick={() => scrollThumbnails("up")}
                            className="absolute top-0 hidden font-extrabold transform -translate-x-1/2 md:block left-1/2 bg-none text-main "
                        >
                            <FaChevronUp strokeWidth={24} />
                        </button>
                        <button
                            onClick={() => scrollThumbnails("down")}
                            className="absolute bottom-0 hidden font-extrabold transform -translate-x-1/2 md:block left-1/2 bg-none text-main "
                        >
                            <FaChevronDown strokeWidth={24} />
                        </button>

                        <div
                            ref={thumbnailRef}
                            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[300px] py-2 md:py-6 "
                        >
                            {product?.images?.map((image, index) => (
                                <div
                                    key={index}
                                    className={`h-16 w-16 bg-slate-200 rounded p-1 cursor-pointer flex-shrink-0 ${selectedImage === image ? 'border-2 border-main' : 'border-none'
                                        }`}
                                    onMouseEnter={() => handleMouseEnterProduct(image)}
                                    onClick={() => {
                                        setSelectedImage(image);
                                        // Also select the corresponding variant if this thumbnail is a variant image
                                        for (const variant of product?.variants || []) {
                                            const variantValue = variant.values?.find(val => val.image === image);
                                            if (variantValue) {
                                                handleVariantChange(variant.name, variantValue.value);
                                                break; // Assume one variant image corresponds to one value
                                            }
                                        }
                                    }}
                                >
                                    <img
                                        src={image}
                                        className="object-cover w-full h-full rounded"
                                        loading="lazy"
                                        alt={`Thumbnail ${index}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollThumbnails("left")}
                            className="absolute left-0 font-semibold transform -translate-y-1/2 md:hidden top-1/2 bg-none text-main "
                        >
                            <FaChevronLeft strokeWidth={24} />
                        </button>
                        <button
                            onClick={() => scrollThumbnails("right")}
                            className="absolute right-0 font-semibold transform -translate-y-1/2 md:hidden top-1/2 bg-none text-main "
                        >
                            <FaChevronRight strokeWidth={24} />
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <motion.div 
                    className="w-full max-w-screen-xl py-0 ml-0 md:w-1/2 md:ml-5 md:py-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 
                        className="text-[20px] md:text-[26px]  font-space capitalize font-semibold text-gray-900 mb-[6px]"
                        variants={itemVariants}
                    >
                        {product?.title || "Product Title"}
                    </motion.h1>
                    {product?.category?.name && (
                        <motion.p 
                            className="mb-1 text-sm capitalize"
                            variants={itemVariants}
                        >
                            <strong></strong> <Link to={`/category/${product?.category?.slug}`} className="text-base font-medium no-underline">{product.category.name}</Link>
                        </motion.p>
                    )}
                    <motion.p className="pl-2 text-base text-black font-space md:pl-0"
                        dangerouslySetInnerHTML={{
                            __html: showFullDescription
                                ? product?.description
                                : product?.description?.slice(0, 100) + "..."
                        }}
                        variants={itemVariants}
                    />
                    <motion.button
                        onClick={toggleDescription}
                        className="mb-1 text-sm font-semibold text-main"
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {showFullDescription ? "See less" : "See more"}
                    </motion.button>
                    <motion.p 
                        className="mb-3 text-xl font-semibold md:text-2xl font-poppins"
                        variants={itemVariants}
                    >
                        {product.salePrice && currentPrice === originalPrice ? (
                            <>
                                <span className="text-base text-gray-500 line-through decoration-1">Rs. {product.price}</span>
                                <span className="ml-2 text-main">Rs. {currentPrice}</span>
                            </>
                        ) : (
                            <span>Rs. {currentPrice}</span>
                        )}
                    </motion.p>

                    {/* Quantity Selector */}
                    {product?.stock && (
                        <motion.div 
                            className="flex items-center gap-4 mb-3"
                            variants={itemVariants}
                        >
                            <motion.button
                                onClick={() => handleQuantityChange("decrease")}
                                disabled={selectedQuantity === 1}
                                aria-label="Decrease quantity"
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === 1 ? "bg-gray-300" : "bg-main opacity-70"}
                                    `}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                -
                            </motion.button>
                            <span className="text-xl">{selectedQuantity}</span>
                            <motion.button
                                onClick={() => handleQuantityChange("increase")}
                                aria-label="Increase quantity"
                                disabled={selectedQuantity === product.stock}
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === product.stock ? "bg-gray-300" : "bg-main opacity-70"}
                                    `}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                +
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Variants */}
                    {productVariants && productVariants.length > 0 ? (
                        productVariants.map((variant, index) => (
                            <motion.div key={index} className="gap-2 mb-3 " variants={itemVariants}>
                                <h3 className="font-semibold capitalize text-md text-main font-poppins">
                                    {variant.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    {variant.values.map((value, idx) => (
                                        value.image ? (
                                            <motion.div
                                                key={idx}
                                                className="flex flex-col items-center cursor-pointer"
                                                onClick={() => handleVariantChange(variant.name, value.value)}
                                                onMouseEnter={(e) => handleVariantImageMouseEnter(value.image, e)} // Pass event object
                                                onMouseLeave={handleVariantImageMouseLeave}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <div 
                                                    className={`relative overflow-hidden ${selectedVariants[variant.name]?.includes(value.value) ? 'ring-2 ring-main ring-offset-1' : 'border border-gray-300'}`}
                                                >
                                                    <img
                                                        src={value.image || variant.image || "https://via.placeholder.com/50"}
                                                        alt={value.value}
                                                        className="object-cover w-12 h-12"
                                                        onError={(e) => e.target.src = "https://via.placeholder.com/50"} // Fallback image on error
                                                    />
                                                    {selectedVariants[variant.name]?.includes(value.value) && (
                                                        <div className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 bg-main">
                                                            <svg 
                                                                className="w-3 h-3 text-white" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path 
                                                                    strokeLinecap="round" 
                                                                    strokeLinejoin="round" 
                                                                    strokeWidth="3" // Make stroke slightly thicker for visibility on small icon
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="mt-1 text-sm text-gray-700 capitalize font-poppins">{value.value}</span>
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                key={idx}
                                                onClick={() => handleVariantChange(variant.name, value.value)}
                                                className={`px-4 py-2 capitalize border  transition duration-200 ease-in-out
                                                ${selectedVariants[variant.name]?.includes(value.value)
                                                    ? "bg-main text-white shadow-md border-main border-2"
                                                    : "bg-gray-200 text-gray-800 border-gray-300"}
                                                `}
                                                whileHover={{
                                                    scale: 1.05,
                                                    backgroundColor: selectedVariants[variant.name]?.includes(value.value) ? undefined : "#d1d5db",
                                                    color: selectedVariants[variant.name]?.includes(value.value) ? undefined : "#1f2937"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {value.value}
                                            </motion.button>
                                        )
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    ) : null}

                    {/* Actions */}
                    <motion.div variants={itemVariants}>
                        <div className="flex flex-col w-full gap-4 md:flex-row md:justify-start">
                            <motion.a
                                onClick={handleByNow}
                                className="w-full px-6 py-2 text-sm font-bold text-center text-white no-underline bg-main opacity-70 lg:text-base md:w-auto md:flex-2 hover:opacity-90"
                                whileHover={{ scale: 1.03, opacity: 0.95 }}
                                whileTap={{ scale: 0.98 }}
                                href="#" // Added href for accessibility, will be handled by onClick
                            >
                                Buy Now
                            </motion.a>
                            <motion.a
                                onClick={handleAddToCart}
                                className="flex items-center justify-center w-full gap-1 px-6 py-2 text-sm font-bold text-white no-underline bg-main opacity-70 md:w-auto lg:text-base hover:bg-main hover:opacity-90"
                                whileHover={{ scale: 1.03, opacity: 0.95 }}
                                whileTap={{ scale: 0.98 }}
                                href="#" // Added href for accessibility, will be handled by onClick
                            >
                                <TiShoppingCart className="text-xl" />
                                Add to Cart
                            </motion.a>
                        </div>
                        <motion.button
                            onClick={handleWhatsAppOrder}
                            className="flex items-center justify-center w-full gap-2 px-8 py-2 my-3 text-base font-bold text-white bg-green-600 sm:w-auto md:max-w-screen-md hover:bg-green-800 md:text-xl"
                            whileHover={{ scale: 1.03, backgroundColor: "#34D399" }} // subtle green change
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaWhatsapp className="text-2xl" /> Order via WhatsApp
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />

            {/* Reviews Section */}
            <ReviewForm slug={slug} product={product} />
            <hr />
            {/* Related Products */}
            <RelatedProducts
                relatedProducts={relatedProducts}
                currentPage={currentPage}
                totalPages={totalPages}
            />

            {/* Image Preview Overlay */}
            <AnimatePresence>
                {hoveredVariantImage && (
                    <motion.div
                        className="fixed z-[9999] p-2 bg-white border border-gray-300  shadow-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            top: hoverPreviewPosition.y,
                            left: hoverPreviewPosition.x,
                            pointerEvents: 'none', // Allow clicks/hovers to pass through to elements below
                            width: '150px', 
                            height: '150px', 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <img
                            src={hoveredVariantImage}
                            alt="Variant Preview"
                            className="object-contain w-full h-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default React.memo(SingleProduct);