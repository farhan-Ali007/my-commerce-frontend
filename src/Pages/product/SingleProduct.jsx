import { AnimatePresence, motion } from "framer-motion";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-hot-toast";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaWhatsapp,
} from "react-icons/fa6";
import { TiShoppingCart } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import SingleProductSkeleton from "../../components/skeletons/SingleProductSkeleton";
import { getProductBySlug, getRelatedProducts } from "../../functions/product";
import { getProductSchemaData } from "../../helpers/getProductSchema";
import { addToCart } from "../../store/cartSlice";
import { addItemToCart } from "../../functions/cart";

const LazyRelatedProducts = lazy(() =>
  import("../../components/RelatedProducts")
);
const LazyReviewForm = lazy(() => import("../../components/forms/ReviewForm"));
const LazyCartDrawer = lazy(() =>
  import("../../components/drawers/CartDrawer")
);

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function getTotalVariantPrice(product, selectedVariants) {
  let total = 0;
  let hasVariantPrice = false;

  for (const [variantName, selectedValues] of Object.entries(
    selectedVariants
  )) {
    if (selectedValues && selectedValues.length > 0) {
      const variant = product.variants?.find((v) => v.name === variantName);
      if (variant) {
        for (const value of selectedValues) {
          const variantValue = variant.values?.find((v) => v.value === value);
          if (variantValue && typeof variantValue.price === "number") {
            total += variantValue.price;
            hasVariantPrice = true;
          }
        }
      }
    }
  }

  // If at least one variant has a price, return the sum, otherwise use product base price
  return hasVariantPrice ? total : product.salePrice || product.price;
}

const SingleProduct = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const navigateTo = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const currentCartItems = useSelector((state) => state.cart.products);

  // State management
  const [product, setProduct] = useState({});
//   console.log("Product in single product page------>", product)
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
  const [hoveredVariantImage, setHoveredVariantImage] = useState(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState({ x: 0, y: 0 });
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const imageRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [offerCountdown, setOfferCountdown] = useState("");

  const currentPrice = useMemo(() => {
    if (!product) return 0;

    let calculatedPrice = product.salePrice || product.price;

    // Calculate price based on selected variants with prices
    // Check each selected value within each variant type array
    for (const [variantName, selectedValues] of Object.entries(
      selectedVariants
    )) {
      if (selectedValues && selectedValues.length > 0) {
        const variant = product.variants?.find((v) => v.name === variantName);
        if (variant) {
          // For simplicity, if multiple values are selected,
          // we'll use the price of the *first* selected value that has a price defined.
          // A more complex logic might sum or average prices if needed.
          for (const value of selectedValues) {
            const variantValue = variant.values?.find((v) => v.value === value);
            // Check for explicit price (could be 0 or a number)
            if (
              variantValue?.price !== undefined &&
              variantValue?.price !== null
            ) {
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
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: "easeOut",
          when: "beforeChildren",
          staggerChildren: 0.1,
        },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      },
    }),
    []
  );

  // Image handling
  const handleImageLoad = useCallback((url) => {
    setLoadedImages((prev) => new Set(prev).add(url));
  }, []);

  const handleMouseEnterProduct = useCallback(
    (imageURL) => {
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
    },
    [loadedImages, handleImageLoad, product?.variants, product?.images]
  );

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
        display: "block", // Make sure the zoom lens is visible
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoomStyle({}); // Hide the zoom lens
  }, []);

  const handleVariantImageMouseEnter = useCallback((imageURL, e) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    setHoveredVariantImage(imageURL);
    setHoverPreviewPosition({
      x: e.clientX + 20, // Offset 20px to the right of the cursor
      y: e.clientY + 20, // Offset 20px below the cursor
    });
  }, [hoverTimeout]);

  const handleVariantImageMouseLeave = useCallback(() => {
    // Add a delay before hiding the preview
    const timeout = setTimeout(() => {
      setHoveredVariantImage(null);
      setHoverPreviewPosition({ x: 0, y: 0 }); // Reset position
    }, 300); // 300ms delay
    
    setHoverTimeout(timeout);
  }, []);

  const handlePreviewMouseEnter = useCallback(() => {
    // Clear the timeout when hovering over the preview
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }, [hoverTimeout]);

  const handlePreviewMouseLeave = useCallback(() => {
    // Add a delay before hiding the preview when leaving it
    const timeout = setTimeout(() => {
      setHoveredVariantImage(null);
      setHoverPreviewPosition({ x: 0, y: 0 });
    }, 200); // 200ms delay
    
    setHoverTimeout(timeout);
  }, []);

  const handleImagePreviewClick = useCallback(() => {
    if (hoveredVariantImage) {
      setModalImage(hoveredVariantImage);
      setShowImageModal(true);
    }
  }, [hoveredVariantImage]);

  // Add keyboard support for closing modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showImageModal]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const scrollThumbnails = useCallback((direction) => {
    if (thumbnailRef.current) {
      const scrollAmount = 100; // Adjust scroll amount as needed
      thumbnailRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  // Data fetching
  const fetchRelatedProducts = useCallback(async () => {
    try {
      const response = await getRelatedProducts(
        product.category?._id,
        product._id
      );
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
      setOriginalPrice(
        response?.product?.salePrice || response?.product?.price
      );
      setProductVariants(response?.product?.variants || []);

      // Preload all product images including variant images
      const allImages = new Set(
        [
          ...(response?.product?.images || []),
          ...(response?.product?.variants?.flatMap((variant) =>
            variant.values.map((val) => val.image).filter(Boolean)
          ) || []),
        ].filter(Boolean)
      );

      // Preload all images
      allImages.forEach((img) => {
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
    outerLoop: for (const [variantName, selectedValues] of Object.entries(
      selectedVariants
    )) {
      if (selectedValues && selectedValues.length > 0) {
        const variant = product.variants?.find((v) => v.name === variantName);
        if (variant) {
          for (const selectedValue of selectedValues) {
            const variantValue = variant.values?.find(
              (val) => val.value === selectedValue
            );
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
    } else {
      // console.log("useEffect: selectedImage is already set to:", selectedImage);
    }
  }, [selectedVariants, product?.images, product?.variants]);

  useEffect(() => {
    // Only run if product exists and has the required properties
    if (!product || !product.specialOfferEnabled) {
      setOfferCountdown("");
      return;
    }

    if (
      product?.specialOfferEnabled &&
      product?.specialOfferStart &&
      product?.specialOfferEnd
    ) {
      const start = new Date(product.specialOfferStart);
      const end = new Date(product.specialOfferEnd);
      const now = new Date();
      if (now >= start && now <= end) {
        const interval = setInterval(() => {
          const now = new Date();
          const diff = end - now;
          if (diff <= 0) {
            setOfferCountdown("Offer ended");
            clearInterval(interval);
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setOfferCountdown(`${hours}h ${minutes}m ${seconds}s left`);
          }
        }, 1000);
        return () => clearInterval(interval);
      } else if (now < start) {
        setOfferCountdown("Offer not started");
      } else {
        setOfferCountdown("");
      }
    } else {
      setOfferCountdown("");
    }
  }, [
    product?.specialOfferEnabled,
    product?.specialOfferStart,
    product?.specialOfferEnd,
  ]);

  // Variant and cart handlers
  const handleVariantChange = useCallback((variantName, value) => {
    setSelectedVariants((prev) => {
      // Only allow one value per variant
      return {
        ...prev,
        [variantName]: [value],
      };
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

    outerLoop: for (const [variantName, selectedValues] of Object.entries(
      selectedVariants
    )) {
      if (selectedValues && selectedValues.length > 0) {
        const variant = product.variants?.find((v) => v.name === variantName);
        if (variant) {
          for (const selectedValue of selectedValues) {
            const variantValue = variant.values?.find(
              (val) => val.value === selectedValue
            );
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
      price: getTotalVariantPrice(product, selectedVariants),
      image: cartItemImage, // Use the determined cart item image
      count: selectedQuantity,
      selectedVariants: variantsForBackend, // Pass the array of {name, values} objects
      freeShipping: product?.freeShipping,
      deliveryCharges: product?.deliveryCharges,
    };

    try {
      // For logged-in users, call API first, then update Redux
      if (userId) {
        const cartPayload = {
          products: [cartItem],
          deliveryCharges: product?.freeShipping
            ? 0
            : product?.deliveryCharges || 200,
        };
        await addItemToCart(userId, cartPayload);
        // Only add to Redux after successful API call
        dispatch(addToCart(cartItem));
        toast.success(`${product?.title} added to cart!`);
        setIsDrawerOpen(true);
      } else {
        // For guest users, just add to Redux
        dispatch(addToCart(cartItem));
        toast.success(`${product?.title} added to cart!`);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      toast.error("Failed to add the product to the cart. Please try again.");
      console.error("Error adding item to cart:", error);
    }
  }, [
    prepareVariantsForBackend,
    selectedVariants,
    product,
    selectedQuantity,
    dispatch,
    userId,
  ]);

  const handleByNow = useCallback(async () => {
    // Add validation here if certain variants are required before proceeding

    const variantsForBackend = prepareVariantsForBackend();

    // Determine the image for the cart item.
    let cartItemImage = product?.images?.[0];

    outerLoop: for (const [variantName, selectedValues] of Object.entries(
      selectedVariants
    )) {
      if (selectedValues && selectedValues.length > 0) {
        const variant = product.variants?.find((v) => v.name === variantName);
        if (variant) {
          for (const selectedValue of selectedValues) {
            const variantValue = variant.values?.find(
              (val) => val.value === selectedValue
            );
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
      price: getTotalVariantPrice(product, selectedVariants),
      image: cartItemImage,
      count: selectedQuantity,
      selectedVariants: variantsForBackend,
      freeShipping: product?.freeShipping,
      deliveryCharges: product?.deliveryCharges,
    };

    try {
      // For logged-in users, call API first, then update Redux
      if (userId) {
        const cartPayload = {
          products: [cartItem],
          deliveryCharges: product?.freeShipping
            ? 0
            : product?.deliveryCharges || 200,
        };
        await addItemToCart(userId, cartPayload);
        // Only add to Redux after successful API call
        dispatch(addToCart(cartItem));
        toast.success("Proceeding to checkout...");
        navigateTo("/cart/checkout");
      } else {
        // For guest users, just add to Redux
        dispatch(addToCart(cartItem));
        toast.success("Proceeding to checkout...");
        navigateTo("/cart/checkout");
      }
    } catch (error) {
      toast.error("Failed to proceed to checkout. Please try again.");
      console.error("Error during Buy Now:", error);
    }
  }, [
    prepareVariantsForBackend,
    selectedVariants,
    product,
    selectedQuantity,
    dispatch,
    userId,
    navigateTo,
  ]);

  const handleQuantityChange = useCallback(
    (operation) => {
      setSelectedQuantity((prev) =>
        operation === "increase"
          ? Math.min(prev + 1, product?.stock || Infinity)
          : Math.max(1, prev - 1)
      );
    },
    [product?.stock]
  );

  const toggleDescription = useCallback(() => {
    setShowFullDescription(!showFullDescription);
  }, [showFullDescription]);

  const handleWhatsAppOrder = useCallback(() => {
    const phoneNumber = "923071111832";
    const productLink = window.location.href;
    const imageLink = product?.image;

    const message = `*🛒 New Order Request*\n\n*Product:* ${product?.title}\n*Price:* Rs ${currentPrice}\n*Image:* ${imageLink}\n*View Product:* ${productLink}\n\nThank you!`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  }, [product, currentPrice]);

  // Render
  if (loading) return <SingleProductSkeleton />;
  if (!product)
    return <div className="py-20 text-center">Product not found!</div>;

  // Memoize schema data to prevent duplicate generation
  const schemaData = useMemo(() => {
    return getProductSchemaData(product, currentPrice);
  }, [product, currentPrice]);

  if (!schemaData) return null;

  return (
    <div className="px-4 pt-1 max-w-screen md:px-5 md:pt-3">
      <Helmet>
        <title>
          {product.title
            ? `${product.title} | Etimad Mart`
            : "Product | Etimad Mart"}
        </title>
        <meta
          name="description"
          content={product.metaDescription || product.description || ""}
        />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product?.title || "Product"} />
        <meta
          property="og:description"
          content={product?.description?.substring(0, 160) || ""}
        />
        <meta
          property="og:image"
          content={selectedImage || product?.images?.[0] || "default-image.jpg"}
        />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.title || "Product"} />
        <meta
          name="twitter:description"
          content={product?.description?.substring(0, 160) || ""}
        />
        <meta
          name="twitter:image"
          content={selectedImage || product?.images?.[0] || "default-image.jpg"}
        />
        <link rel="canonical" href={`https://yourstore.com/products/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

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
                width="350"
                height="350"
                className={`w-full h-full object-cover cursor-pointer transition-opacity duration-300 ${
                  loadedImages.has(selectedImage) ? "opacity-100" : "opacity-0"
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
                    backgroundImage: `url(${
                      selectedImage || "https://via.placeholder.com/500"
                    })`,
                    backgroundSize: `${zoomStyle.backgroundSize || "auto"}`,
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
            {/* Special Offer Section below main image */}
            {(() => {
              const now = new Date();
              // Only check for special offer if it's enabled and has valid dates
              if (product?.specialOfferEnabled && product?.specialOfferStart && product?.specialOfferEnd) {
                const start = new Date(product.specialOfferStart);
                const end = new Date(product.specialOfferEnd);
                
                // Check if dates are valid
                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && now >= start && now <= end) {
                  return (
                    <div className="w-full flex justify-center mt-3 mb-1">
                      <div className="flex flex-col w-full max-w-[400px] gap-2">
                        <div className="flex items-center justify-center w-full bg-yellow-50 border border-yellow-300 shadow-sm px-4 py-2 gap-3">
                          <span className="px-3 py-1 bg-yellow-400 text-white font-bold rounded-full text-sm">
                            Special Offer
                          </span>
                          <span className="text-lg font-bold text-yellow-700">
                            Rs. {product.specialOfferPrice}
                          </span>
                          <span className="text-base font-semibold text-yellow-600">
                            {offerCountdown}
                          </span>
                        </div>
                        {product?.freeShipping && (
                          <span className="flex items-center justify-center w-full  bg-green-100 border border-green-200 shadow-sm px-4 py-2 gap-2 font-semibold text-green-700 text-sm">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 13V7a2 2 0 012-2h11a2 2 0 012 2v6m-1 4h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-2 7a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Free Delivery
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              }
              
              // Show free shipping if no active special offer and product has free shipping
              if (product?.freeShipping) {
                return (
                  <div className="w-full flex justify-center mt-3 mb-1">
                    <span className="flex items-center justify-center w-full  bg-green-100 border border-green-200 shadow-sm px-4 py-2 gap-2 font-semibold text-green-700 text-sm">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 13V7a2 2 0 012-2h11a2 2 0 012 2v6m-1 4h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-2 7a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Free Delivery
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Thumbnail List */}
          <div className="relative flex flex-row items-center order-2 mt-8 md:w-20 md:order-1 max-h-80 md:flex-col">
            <button
              onClick={() => scrollThumbnails("up")}
              className="absolute top-0 hidden font-extrabold transform -translate-x-1/2 md:block left-1/2 bg-none text-secondary "
            >
              <FaChevronUp strokeWidth={24} />
            </button>
            <button
              onClick={() => scrollThumbnails("down")}
              className="absolute bottom-0 hidden font-extrabold transform -translate-x-1/2 md:block left-1/2 bg-none text-secondary "
            >
              <FaChevronDown strokeWidth={24} />
            </button>

            <div
              ref={thumbnailRef}
              className="relative flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[300px] py-2 md:py-6 z-10"
            >
              {product?.images?.map((image, index) => (
                <div
                  key={index}
                  className={`h-16 w-16 bg-slate-200 rounded p-1 cursor-pointer flex-shrink-0 ${
                    selectedImage === image
                      ? "border-2 border-primary"
                      : "border-none"
                  }`}
                  onMouseEnter={() => handleMouseEnterProduct(image)}
                  onClick={() => {
                    console.log("Thumbnail clicked:", image);
                    let isVariantImage = false;
                    for (const variant of product?.variants || []) {
                      const variantValue = variant.values?.find(
                        (val) => val.image === image
                      );
                      if (variantValue) {
                        handleVariantChange(variant.name, variantValue.value);
                        isVariantImage = true;
                        break;
                      }
                    }
                    if (!isVariantImage) {
                      setSelectedImage(image);
                    }
                  }}
                >
                  <img
                    src={image}
                    className="object-cover w-full h-full rounded"
                    loading="lazy"
                    alt={`Thumbnail ${index}`}
                    width="64"
                    height="64"
                  />
                  {/* Magnifying glass icon for main product images */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer group rounded"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent thumbnail selection
                      setModalImage(image);
                      setShowImageModal(true);
                    }}
                    title="Click to view full size"
                  >
                    <div className="bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollThumbnails("left")}
              className="absolute left-0 font-semibold transform -translate-y-1/2 md:hidden top-1/2 bg-none text-secondary "
            >
              <FaChevronLeft strokeWidth={24} />
            </button>
            <button
              onClick={() => scrollThumbnails("right")}
              className="absolute right-0 font-semibold transform -translate-y-1/2 md:hidden top-1/2 bg-none text-secondary "
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
            className="text-[20px] md:text-[26px]  font-space capitalize font-semibold text-secondary mb-[2px]"
            variants={itemVariants}
          >
            {product?.title || "Product Title"}
          </motion.h1>
          {/* Star Rating and Review Count */}
          <motion.div
            className="flex items-center gap-2  bg-yellow-50 px-3 py-1 rounded-full w-fit"
            variants={itemVariants}
          >
            {/* Inline renderStars function */}
            {(() => {
              const rating = product?.averageRating || 0;
              const maxStars = 5;
              const fullStars = Math.floor(rating);
              const fractionalPart = rating % 1;
              const stars = [];
              for (let i = 1; i <= fullStars; i++) {
                stars.push(
                  <svg
                    key={`full-${i}`}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                  </svg>
                );
              }
              if (fractionalPart >= 0.5) {
                stars.push(
                  <svg
                    key="half-star"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-yellow-400"
                    viewBox="0 0 20 20"
                  >
                    <defs>
                      <linearGradient id="half-gradient">
                        <stop offset="50%" stopColor="#facc15" />
                        <stop offset="50%" stopColor="#e5e7eb" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z"
                      fill="url(#half-gradient)"
                    />
                  </svg>
                );
              }
              const remainingStars =
                maxStars - fullStars - (fractionalPart >= 0.5 ? 1 : 0);
              for (let i = 1; i <= remainingStars; i++) {
                stars.push(
                  <svg
                    key={`empty-${i}`}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 20 20"
                    stroke="currentColor"
                  >
                    <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                  </svg>
                );
              }
              return stars;
            })()}
            <span className="ml-1 text-base font-semibold text-gray-700">
              {(product?.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-base font-bold text-gray-400">|</span>
            <span className="text-base font-bold text-gray-700">
              {product?.reviews?.length || 0} Reviews
            </span>
          </motion.div>
          {product?.category?.name && (
            <motion.p
              className="mb-1 text-sm capitalize"
              variants={itemVariants}
            >
              <strong></strong>{" "}
              <Link
                to={`/category/${product?.category?.slug}`}
                className="text-sm text-blue-600 font-medium no-underline hover:underline"
              >
                {product.category.name}
              </Link>
            </motion.p>
          )}
          <motion.p
            className="pl-2 text-base text-black font-space md:pl-0"
            dangerouslySetInnerHTML={{
              __html: showFullDescription
                ? product?.description
                : product?.description?.slice(0, 100) + "...",
            }}
            variants={itemVariants}
          />
          <motion.button
            onClick={toggleDescription}
            className="mb-1 text-sm font-semibold text-secondary"
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
                <span className="text-base text-gray-500 line-through decoration-1">
                  Rs. {product.price}
                </span>
                <span className="ml-2 text-primary">Rs. {currentPrice}</span>
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
                className={`p-1 text-primary rounded-full text-2xl w-8 h-8 flex items-center justify-center ${
                  selectedQuantity === 1
                    ? "bg-gray-300"
                    : "bg-secondary opacity-70"
                }
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
                className={`p-1 text-primary rounded-full text-2xl w-8 h-8 flex items-center justify-center ${
                  selectedQuantity === product.stock
                    ? "bg-gray-300"
                    : "bg-secondary opacity-70"
                }
                                    `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </motion.div>
          )}

          {/* Variants */}
          {productVariants && productVariants.length > 0
            ? productVariants.map((variant, index) => (
                <motion.div
                  key={index}
                  className="gap-2 mb-3 "
                  variants={itemVariants}
                >
                  <h3 className="font-semibold capitalize text-md text-primary font-poppins">
                    {variant.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    {variant.values.map((value, idx) =>
                      value.image ? (
                        <motion.div
                          key={idx}
                          className="flex flex-col items-center cursor-pointer"
                          onClick={() =>
                            handleVariantChange(variant.name, value.value)
                          }
                          onMouseEnter={(e) =>
                            handleVariantImageMouseEnter(value.image, e)
                          } // Pass event object
                          onMouseLeave={handleVariantImageMouseLeave}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div
                            className={`relative overflow-hidden ${
                              selectedVariants[variant.name]?.includes(
                                value.value
                              )
                                ? "ring-2 ring-primary ring-offset-1"
                                : "border border-gray-300"
                            }`}
                          >
                            <img
                              src={
                                value.image ||
                                variant.image ||
                                "https://via.placeholder.com/50"
                              }
                              alt={value.value}
                              className="object-cover w-12 h-12"
                              onError={(e) =>
                                (e.target.src =
                                  "https://via.placeholder.com/50")
                              } // Fallback image on error
                              width="48"
                              height="48"
                            />
                            {selectedVariants[variant.name]?.includes(
                              value.value
                            ) && (
                              <div className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 bg-secondary">
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
                            {/* Magnifying glass icon for full preview */}
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent variant selection
                                if (value.image) {
                                  setModalImage(value.image);
                                  setShowImageModal(true);
                                }
                              }}
                              title="Click to view full size"
                            >
                              <div className="bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <span className="mt-1 text-sm text-primary capitalize font-poppins">
                            {value.value}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.button
                          key={idx}
                          onClick={() =>
                            handleVariantChange(variant.name, value.value)
                          }
                          className={`px-4 py-2 capitalize border  transition duration-200 ease-in-out
                                                ${
                                                  selectedVariants[
                                                    variant.name
                                                  ]?.includes(value.value)
                                                    ? "bg-secondary text-white shadow-md border-primary border-2"
                                                    : "bg-secondary text-primary border-gray-300"
                                                }
                                                `}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: selectedVariants[
                              variant.name
                            ]?.includes(value.value)
                              ? undefined
                              : "#FFB829",
                            color: selectedVariants[variant.name]?.includes(
                              value.value
                            )
                              ? undefined
                              : "#000000",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {value.value}
                        </motion.button>
                      )
                    )}
                  </div>
                </motion.div>
              ))
            : null}

          {/* Actions */}
          <motion.div variants={itemVariants}>
            {/* Desktop Actions */}
            <div className="hidden md:flex flex-col w-full gap-4 md:flex-row md:justify-start">
              <motion.a
                onClick={handleByNow}
                className="w-full px-6 py-2 text-sm font-bold text-center text-white no-underline bg-primary opacity-70 lg:text-base md:w-auto md:flex-2 hover:opacity-90"
                whileHover={{ scale: 1.03, opacity: 0.95 }}
                whileTap={{ scale: 0.98 }}
                href="#"
              >
                Cash ON Delivery
              </motion.a>
              <motion.a
                onClick={handleAddToCart}
                className="flex items-center justify-center w-full gap-1 px-6 py-2 text-sm font-bold text-primary no-underline bg-secondary/80 md:w-auto lg:text-base hover:bg-secondary/90"
                whileHover={{ scale: 1.03, opacity: 0.95 }}
                whileTap={{ scale: 0.98 }}
                href="#"
              >
                <TiShoppingCart className="text-xl" />
                Add to Cart
              </motion.a>
            </div>
            <motion.button
              onClick={handleWhatsAppOrder}
              className="hidden md:flex items-center justify-center w-full gap-2 px-8 py-2 my-3 text-base font-bold text-white bg-[#25CC64] sm:w-auto md:w-[23rem] hover:bg-green-800 md:text-xl"
              whileHover={{ scale: 1.03, backgroundColor: "#218B00" }}
              whileTap={{ scale: 0.98 }}
            >
              <FaWhatsapp className="text-2xl" /> Order via WhatsApp
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Cart Drawer */}
      <Suspense fallback={<SingleProductSkeleton />}>
        <LazyCartDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
        <LazyReviewForm slug={slug} product={product} />
        <hr />
        <LazyRelatedProducts
          relatedProducts={relatedProducts}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </Suspense>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {hoveredVariantImage && (
          <motion.div
            className="fixed z-[9999] p-2 bg-white border border-gray-300 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              top: hoverPreviewPosition.y,
              left: hoverPreviewPosition.x,
              width: "250px",
              height: "250px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
            onClick={handleImagePreviewClick}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
          >
            <img
              src={hoveredVariantImage}
              alt="Variant Preview"
              className="object-contain w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Page Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 z-[99999] bg-black bg-opacity-90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-4 -right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors z-10"
              >
                ×
              </button>
              
              {/* Image */}
              <img
                src={modalImage}
                alt="Full Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <motion.a
              onClick={handleByNow}
              className="flex-1 px-4 py-3 text-sm font-bold text-center text-white no-underline bg-primary opacity-70 hover:opacity-90 rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#"
            >
              Cash ON Delivery
            </motion.a>
            <motion.a
              onClick={handleAddToCart}
              className="flex items-center justify-center flex-1 gap-1 px-4 py-3 text-sm font-bold text-primary no-underline bg-secondary/80 hover:bg-secondary/90 rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#"
            >
              <TiShoppingCart className="text-lg" />
              Add to Cart
            </motion.a>
          </div>
          <motion.button
            onClick={handleWhatsAppOrder}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold text-white bg-[#25CC64] hover:bg-green-800 rounded-lg"
            whileHover={{ scale: 1.02, backgroundColor: "#218B00" }}
            whileTap={{ scale: 0.98 }}
          >
            <FaWhatsapp className="text-xl" /> Order via WhatsApp
          </motion.button>
        </div>
      </div>

      {/* Add bottom padding to prevent content from being hidden behind sticky buttons on mobile */}
      <div className="h-32 md:hidden"></div>
    </div>
  );
};

export default React.memo(SingleProduct);
