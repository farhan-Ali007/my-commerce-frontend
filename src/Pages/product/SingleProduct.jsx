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
import { replaceBulletsWithCheck } from "../../helpers/replaceBulletwithCheck";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import SingleProductSkeleton from "../../components/skeletons/SingleProductSkeleton";
import { getProductBySlug, getRelatedProducts } from "../../functions/product";
import { getProductSchemaData } from "../../helpers/getProductSchema";
import { addToCart } from "../../store/cartSlice";
import { addItemToCart } from "../../functions/cart";
import useFacebookPixel from "../../hooks/useFacebookPixel";
import useWhatsAppTracking from "../../hooks/useWhatsAppTracking";
import { AiOutlineClose } from "react-icons/ai";

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

const getTotalVariantPrice = (product, selectedVariants) => {
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
};

const SingleProduct = () => {
  // All hooks here!
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dispatch = useDispatch();
  const { slug } = useParams();
  const navigateTo = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const currentCartItems = useSelector((state) => state.cart.products);
  const { track } = useFacebookPixel();
  const { trackWhatsAppAddToCart, trackWhatsAppOrder } = useWhatsAppTracking();

  // State management
  const [product, setProduct] = useState(null);
  // console.log("product---->", product)
  const [originalPrice, setOriginalPrice] = useState(0);
  const [productVariants, setProductVariants] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  // const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [error, setError] = useState(null);
  const [hoveredVariantImage, setHoveredVariantImage] = useState(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const imageRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [offerCountdown, setOfferCountdown] = useState("");
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState(null);
  const [selectedVariantValue, setSelectedVariantValue] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (product) {
      track("ViewContent", {
        content_ids: [product._id],
        content_name: product.title,
        value: product.salePrice ? product.salePrice : product.price,
        currency: "PKR",
      });
    }
  }, [product]);
  const currentPrice = useMemo(() => {
    if (!product) return 0;

    let variantPriceSum = 0;
    let hasVariantPrice = false;

    for (const [variantName, selectedValues] of Object.entries(selectedVariants)) {
      if (selectedValues && selectedValues.length > 0) {
        const variant = product.variants?.find((v) => v.name === variantName);
        if (variant) {
          for (const value of selectedValues) {
            const variantValue = variant.values?.find((v) => v.value === value);
            if (variantValue && typeof variantValue.price === "number") {
              variantPriceSum += variantValue.price;
              hasVariantPrice = true;
            }
          }
        }
      }
    }

    // If any variant is selected and has a price, use the sum of variant prices
    // Otherwise, use the base price
    return hasVariantPrice ? variantPriceSum : (product.salePrice || product.price);
  }, [selectedVariants, product]);

  // Calculate percentage off
  const percentageOff = useMemo(() => {
    if (!product || !product.salePrice || product.salePrice >= product.price) return 0;
    const discount = ((product.price - product.salePrice) / product.price) * 100;
    return Math.round(discount);
  }, [product]);

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

  const handleVariantImageMouseEnter = useCallback(
    (imageURL, e) => {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      setHoveredVariantImage(imageURL);
      setHoverPreviewPosition({
        x: e.clientX + 20, // Offset 20px to the right of the cursor
        y: e.clientY + 20, // Offset 20px below the cursor
      });
    },
    [hoverTimeout]
  );

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
      if (event.key === "Escape" && showImageModal) {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // Restore scrolling
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
      const currentValues = prev[variantName] || [];
      if (currentValues.includes(value)) {
        // Deselect value
        return {
          ...prev,
          [variantName]: currentValues.filter((v) => v !== value),
        };
      } else {
        // Select value (add to array)
        return {
          ...prev,
          [variantName]: [...currentValues, value],
        };
      }
    });
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

  const generateCombinations = useCallback((variants) => {
    if (variants.length === 0) {
      return [[]];
    }
    const firstVariant = variants[0];
    const restVariants = variants.slice(1);
    const combinations = [];
    const firstVariantValues = firstVariant.values;

    for (const value of firstVariantValues) {
      const restCombinations = generateCombinations(restVariants);
      for (const restCombination of restCombinations) {
        combinations.push([{ name: firstVariant.name, values: [value] }, ...restCombination]);
      }
    }
    return combinations;
  }, []);

  const handleAddToCart = useCallback(async () => {
    // Check if product has variants and no variants are selected
    if (productVariants && productVariants.length > 0) {
      const hasSelectedVariants = Object.values(selectedVariants).some(values => values && values.length > 0);
      if (!hasSelectedVariants) {
        toast.error("Please select at least one variant before adding to cart!");
        return;
      }
    }

    let cartItemsToAdd = [];

    Object.entries(selectedVariants).forEach(([variantName, values]) => {
      const variant = productVariants.find(v => v.name === variantName);
      values.forEach((value) => {
        let price = product.salePrice ?? product.price;
        let image = product?.images?.[0];
        let variantValue;
        if (variant) {
          variantValue = variant.values.find(v => v.value === value);
          if (variantValue && typeof variantValue.price === "number") {
            price = variantValue.price;
          }
          if (variantValue && variantValue.image) {
            image = variantValue.image;
          }
        }
        // Generate unique cartItemId
        const cartItemId = [
          product?._id,
          `${variantName}:${value}`
        ].join("|");
        const cartItem = {
          cartItemId,
          productId: product?._id,
          title: product?.title,
          price,
          image,
          count: selectedQuantity,
          selectedVariants: [{ name: variantName, values: [value] }],
          freeShipping: product?.freeShipping,
          deliveryCharges: product?.deliveryCharges,
        };
        cartItemsToAdd.push(cartItem);
      });
    });

    if (cartItemsToAdd.length === 0) {
      // If no variants selected, add the base product
      cartItemsToAdd.push({
        cartItemId: product?._id,
        productId: product?._id,
        title: product?.title,
        price: product.salePrice ?? product.price,
        image: product?.images?.[0],
        count: selectedQuantity,
        selectedVariants: [],
        freeShipping: product?.freeShipping,
        deliveryCharges: product?.deliveryCharges,
      });
    }

    cartItemsToAdd.forEach((cartItem) => {
      dispatch(addToCart(cartItem));
    });

    toast.success(`${cartItemsToAdd.length} item(s) added to cart!`);
    setIsDrawerOpen(true);
    
    // Facebook Pixel tracking
    track("AddToCart", {
      content_ids: [product._id],
      content_name: product.title,
      value: product.salePrice ? product.salePrice : product.price,
      currency: "PKR",
    });
    
    // WhatsApp tracking for add to cart
    trackWhatsAppAddToCart({
      _id: product._id,
      title: product.title,
      price: product.salePrice ? product.salePrice : product.price
    });
  }, [selectedVariants, product, productVariants, dispatch, setIsDrawerOpen, selectedQuantity, currentPrice, track, trackWhatsAppAddToCart]);

  const handleByNow = useCallback(async () => {
    // Check if product has variants and no variants are selected
    if (productVariants && productVariants.length > 0) {
      const hasSelectedVariants = Object.values(selectedVariants).some(values => values && values.length > 0);
      if (!hasSelectedVariants) {
        toast.error("Please select at least one variant before proceeding to checkout!");
        return;
      }
    }

    // Prepare cart items for each selected variant value
    let cartItemsToAdd = [];
    Object.entries(selectedVariants).forEach(([variantName, values]) => {
      const variant = productVariants.find(v => v.name === variantName);
      values.forEach((value) => {
        let price = product.salePrice ?? product.price;
        let image = product?.images?.[0];
        let variantValue;
        if (variant) {
          variantValue = variant.values.find(v => v.value === value);
          if (variantValue && typeof variantValue.price === "number") {
            price = variantValue.price;
          }
          if (variantValue && variantValue.image) {
            image = variantValue.image;
          }
        }
        // Generate unique cartItemId
        const cartItemId = [
          product?._id,
          `${variantName}:${value}`
        ].join("|");
        const cartItem = {
          cartItemId,
          productId: product?._id,
          title: product?.title,
          price,
          image,
          count: selectedQuantity,
          selectedVariants: [{ name: variantName, values: [value] }],
          freeShipping: product?.freeShipping,
          deliveryCharges: product?.deliveryCharges,
        };
        cartItemsToAdd.push(cartItem);
      });
    });
    if (cartItemsToAdd.length === 0) {
      // If no variants selected, add the base product
      cartItemsToAdd.push({
        cartItemId: product?._id,
        productId: product?._id,
        title: product?.title,
        price: product.salePrice ?? product.price,
        image: product?.images?.[0],
        count: selectedQuantity,
        selectedVariants: [],
        freeShipping: product?.freeShipping,
        deliveryCharges: product?.deliveryCharges,
      });
    }
    try {
      if (userId) {
        // For logged-in users, send all items in one API call
        const cartPayload = {
          products: cartItemsToAdd,
          deliveryCharges: product?.freeShipping ? 0 : product?.deliveryCharges || 200,
        };
        await addItemToCart(userId, cartPayload);
        cartItemsToAdd.forEach(cartItem => dispatch(addToCart(cartItem)));
        track("AddToCart", {
          content_ids: [product._id],
          content_name: product.title,
          value: product.salePrice ? product.salePrice : product.price,
          currency: "PKR",
        });
        toast.success("Proceeding to checkout...");
        navigateTo("/cart/checkout");
      } else {
        // For guest users, just add all to Redux
        cartItemsToAdd.forEach(cartItem => dispatch(addToCart(cartItem)));
        track("AddToCart", {
          content_ids: [product._id],
          content_name: product.title,
          value: product.salePrice ? product.salePrice : product.price,
          currency: "PKR",
        });
        toast.success("Proceeding to checkout...");
        navigateTo("/cart/checkout");
      }
    } catch (error) {
      toast.error("Failed to proceed to checkout. Please try again.");
      console.error("Error during Buy Now:", error);
    }
  }, [selectedVariants, product, productVariants, selectedQuantity, dispatch, userId, navigateTo, track]);

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

  // const toggleDescription = useCallback(() => {
  //   setShowFullDescription(!showFullDescription);
  // }, [showFullDescription]);

  const handleWhatsAppOrder = useCallback(() => {
    // Check if product has variants and no variants are selected
    if (productVariants && productVariants.length > 0) {
      const hasSelectedVariants = Object.values(selectedVariants).some(values => values && values.length > 0);
      if (!hasSelectedVariants) {
        toast.error("Please select at least one variant before ordering via WhatsApp!");
        return;
      }
    }

    const phoneNumber = "923071111832";
    const productLink = window.location.href;
    const imageLink = product?.images?.[0];

    // Format selected variants
    let variantsText = "";
    if (productVariants && Object.keys(selectedVariants).length > 0) {
      variantsText = Object.entries(selectedVariants)
        .filter(([_, values]) => values && values.length > 0)
        .map(([name, values]) => `*${name}:* ${values.join(", ")}`)
        .join("\n");
      if (variantsText)
        variantsText = `\n*Selected Variants:*\n${variantsText}`;
    }

    const message = `*🛒 New Order Request*\n\n*Product:* ${product?.title}\n*Price:* Rs ${currentPrice}\n*Image:* ${imageLink}\n*View Product:* ${productLink}${variantsText}\n\nThank you!`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    
    // Facebook Pixel tracking - AddToCart event
    track("startConversation", {
      content_ids: [product._id],
      content_name: product.title,
      value: product.salePrice ? product.salePrice : product.price,
      currency: "PKR",
    });
    
    // WhatsApp tracking for order
    trackWhatsAppOrder({
      _id: product._id,
      title: product.title,
      price: currentPrice
    });
  }, [product, currentPrice, selectedVariants, productVariants, trackWhatsAppOrder, track]);

  // Memoize schema data to prevent duplicate generation
  const schemaData = useMemo(() => {
    return getProductSchemaData(product, currentPrice);
  }, [product, currentPrice]);

  // Now do early returns
  if (loading) return <SingleProductSkeleton />;
  if (!product)
    return <div className="py-20 text-center">Product not found!</div>;
  if (!schemaData) return null;

  return (
    <div className="px-4 pt-1 max-w-screen md:px-8 lg:px-12 md:pt-3">
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
          content={product?.images?.[0] || selectedImage || "default-image.jpg"}
        />
        <meta property="og:url" content={window.location.href} />
       
        <meta
          name="twitter:image"
          content={product?.images?.[0] || selectedImage || "default-image.jpg"}
        />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <div className="flex flex-col gap-0 lg:flex-row">
        {/* Product Images */}
        <div className="flex flex-col w-full lg:w-1/2 lg:flex-row">
          {/* Main Image */}
          <div className="relative flex-1 order-1 mt-4 lg:order-2 lg:mt-3 ">
            <div
              className="overflow-hidden aspect-square h-[350px] md:h-[400px] lg:w-[400px] w-[350px] border border-red-100 mx-auto relative"
              onMouseMove={isLargeScreen ? handleMouseMove : undefined}
              onMouseLeave={isLargeScreen ? handleMouseLeave : undefined}
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
              {isLargeScreen && zoomStyle.backgroundX !== undefined && (
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
              if (
                product?.specialOfferEnabled &&
                product?.specialOfferStart &&
                product?.specialOfferEnd
              ) {
                const start = new Date(product.specialOfferStart);
                const end = new Date(product.specialOfferEnd);

                // Check if dates are valid
                if (
                  !isNaN(start.getTime()) &&
                  !isNaN(end.getTime()) &&
                  now >= start &&
                  now <= end
                ) {
                  return (
                    <div className="w-full flex justify-center mt-3 mb-1">
                      <div className="flex flex-col w-full max-w-[400px] gap-2">
                        <div className="flex items-center justify-center w-full bg-red-600 border border-yellow-300 shadow-sm px-4 py-2 gap-3">
                          <span className="px-3 py-1 bg-primary text-white font-bold rounded-full text-sm">
                            Special Offer
                          </span>
                          <span className="text-lg font-bold text-white">
                            Rs. {product.specialOfferPrice}
                          </span>
                          <span className="text-base font-semibold text-white">
                            {offerCountdown}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              return null;
            })()}

            {/* Star Rating and Review Count */}
            <motion.div
              className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full w-fit mt-2 mx-auto"
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
                      className="w-3 h-3 text-yellow-400"
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
                      className="w-5 h-5 text-gray-300"
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
          </div>

          {/* Thumbnail List */}
          <div className="relative flex flex-row items-center order-2 mt-8 lg:w-20 lg:order-1 max-h-80 lg:flex-col">
            <button
              onClick={() => scrollThumbnails("up")}
              className="absolute top-0 hidden font-extrabold transform -translate-x-1/2 lg:block left-1/2 bg-none text-secondary "
            >
              <FaChevronUp strokeWidth={24} />
            </button>
            <button
              onClick={() => scrollThumbnails("down")}
              className="absolute bottom-0 hidden font-extrabold transform -translate-x-1/2 lg:block left-1/2 bg-none text-secondary "
            >
              <FaChevronDown strokeWidth={24} />
            </button>

            <div
              ref={thumbnailRef}
              className="relative flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[300px] py-2 lg:py-6 z-10"
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
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollThumbnails("left")}
              className="absolute left-0 font-semibold transform -translate-y-1/2 lg:hidden top-1/2 bg-none text-secondary "
            >
              <FaChevronLeft strokeWidth={24} />
            </button>
            <button
              onClick={() => scrollThumbnails("right")}
              className="absolute right-0 font-semibold transform -translate-y-1/2 lg:hidden top-1/2 bg-none text-secondary "
            >
              <FaChevronRight strokeWidth={24} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <motion.div
          className="w-full max-w-screen-xl py-0 ml-0 lg:w-1/2 lg:ml-2 lg:py-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-[20px] md:text-[24px] lg:text-[26px] font-space capitalize font-semibold text-secondary mb-[2px]"
            variants={itemVariants}
          >
            {product?.title || "Product Title"}
          </motion.h1>

          {/* Mobile Price Block */}
          <motion.div
            className="mb-3 mt-2 flex flex-wrap items-center gap-3 text-xl font-semibold md:text-2xl font-poppins lg:hidden"
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

            {product?.freeShipping && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-green-700 text-xs md:text-sm font-semibold">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13V7a2 2 0 012-2h11a2 2 0 012 2v6m-1 4h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-2 7a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Free Shipping
              </span>
            )}
            
            {percentageOff > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-green-700 text-xs md:text-sm font-semibold">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {percentageOff}% Save
              </span>
            )}
          </motion.div>

          {/* Mobile Variant Images Row (after price, before description) */}
          {productVariants && productVariants.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2 mb-1 lg:hidden">
              {productVariants.map((variant, vIdx) =>
                variant.values.map((val, idx) => (
                  idx === 0 && (
                    <div
                      key={val.value}
                      className="relative flex flex-col items-center cursor-pointer"
                      onClick={() => {
                        setActiveVariant(variant);
                        setVariantDrawerOpen(true);
                      }}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white">
                        <img
                          src={val.image || 'https://via.placeholder.com/50'}
                          className="w-full h-full object-cover"
                          alt={val.value}
                        />
                      </div>
                      <span className="mt-2 inline-block bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {variant.name}
                      </span>
                      {/* <span className="mt-1 text-xs font-semibold">
                        Rs. {val.price ?? product.price}
                      </span> */}
                    </div>
                  )
                ))
              )}
            </div>
          )}

          {/* Mobile Quantity Selector (after variants, before description) */}
          {product?.stock && (
            <motion.div
              className="flex items-center gap-4 mb-3 lg:hidden"
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
                }`}
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
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                +
              </motion.button>
            </motion.div>
          )}

          <motion.p
            className="pl-2 text-[14px] product-description text-black font-space md:pl-0"
            dangerouslySetInnerHTML={{
              __html: replaceBulletsWithCheck(product?.description),
            }}
            variants={itemVariants}
          />

          {/* Desktop Price Block */}
          <motion.div
            className="mb-3 mt-3 flex flex-wrap items-center gap-3 text-xl font-semibold md:text-2xl font-poppins hidden lg:flex"
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

            {product?.freeShipping && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-green-700 text-xs md:text-sm font-semibold">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13V7a2 2 0 012-2h11a2 2 0 012 2v6m-1 4h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-2 7a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Free Shipping
              </span>
            )}
            
            {percentageOff > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200  text-green-700  rounded-full  text-xs md:text-sm font-semibold">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {percentageOff}% OFF
              </span>
            )}
          </motion.div>

          {/* Quantity Selector */}
          {product?.stock && (
            <motion.div
              className="flex items-center gap-4 mb-3 hidden lg:flex"
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
                }`}
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
                }`}
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
                  <h3 className="font-semibold hidden lg:block capitalize text-md text-secondary font-space">
                    {variant.name}
                  </h3>
                  <div className="hidden lg:flex  flex-wrap items-center gap-3">
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
            <div className="hidden lg:flex flex-col w-full gap-4 lg:flex-row lg:justify-start">
              <motion.a
                onClick={handleByNow}
                className="w-full px-6 py-2 text-sm font-bold text-center text-white no-underline bg-primary/80 lg:text-base lg:w-auto lg:flex-2 hover:bg-primary"
                whileHover={{ scale: 1.03, opacity: 0.95 }}
                whileTap={{ scale: 0.98 }}
                href="#"
              >
                Cash on Delivery
              </motion.a>
              <motion.a
                onClick={handleAddToCart}
                className="flex items-center justify-center w-full gap-1 px-6 py-2 text-sm font-bold text-primary no-underline bg-secondary/80 lg:w-auto lg:text-base hover:bg-secondary"
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
              className="hidden lg:flex items-center justify-center w-full gap-2 px-8 py-2 my-3 text-base font-bold text-white bg-[#25CC64] sm:w-auto lg:w-[23rem] hover:bg-green-800 lg:text-xl"
              whileHover={{ scale: 1.03, backgroundColor: "#218B00" }}
              whileTap={{ scale: 0.98 }}
            >
              <FaWhatsapp className="text-2xl" /> Order via WhatsApp
            </motion.button>
            {product?.category?.name && (
              <motion.p
                className="mb-1  capitalize"
                variants={itemVariants}
              >
                <strong></strong>{" "}
                <Link
                  to={`/category/${product?.category?.slug}`}
                  className="text-[20px] text-blue-600 font-semibold no-underline hover:underline"
                >
                  {product.category.name}
                </Link>
              </motion.p>
            )}
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
            className="fixed z-[9998] p-2 bg-white border border-gray-300 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
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

      {/* Mobile Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg lg:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <motion.a
              onClick={handleByNow}
              className="flex-1 px-4 py-3 text-sm font-bold text-center text-white no-underline bg-primary opacity-70 hover:opacity-90 rounded-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#"
            >
              Cash On Delivery
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
      <div className="h-32 lg:hidden"></div>

      {/* Drawer/Modal for variant selection */}
      <AnimatePresence>
        {variantDrawerOpen && activeVariant && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-md bg-white rounded-t-2xl p-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-secondary font-space text-lg">{activeVariant.name}</span>
                <button
                  onClick={() => setVariantDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Close variant drawer"
                >
                  <AiOutlineClose className="w-5 h-5 text-primary font-extrabold" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 justify-start">
                {activeVariant.values.map((val, idx) => {
                  const isSelected = selectedVariants[activeVariant.name]?.includes(val.value);
                  return (
                    <div
                      key={val.value}
                      className="flex flex-col items-center cursor-pointer relative w-20"
                    >
                      <div
                        className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white relative"
                        onClick={() => {
                          if (isSelected) {
                            // Deselect only, do not preview
                            handleVariantChange(activeVariant.name, val.value);
                          } else {
                            // Preview and select
                            setPreviewImage(val.image || 'https://via.placeholder.com/300');
                            handleVariantChange(activeVariant.name, val.value);
                          }
                        }}
                      >
                        <img
                          src={val.image || 'https://via.placeholder.com/50'}
                          className="w-full h-full object-cover"
                          alt={val.value}
                        />
                        {/* Checkmark for selected */}
                        {isSelected && (
                          <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="mt-1 text-xs text-center font-medium max-w-full truncate">{val.value}</span>
                      <span className="text-xs font-semibold text-center">
                        Rs. {val.price ?? product.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              className="relative bg-white rounded-lg shadow-lg p-2 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                aria-label="Close preview"
              >
                <AiOutlineClose className="w-6 h-6 text-gray-700" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-[90vw] max-h-[60vh] rounded-lg object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SingleProduct);