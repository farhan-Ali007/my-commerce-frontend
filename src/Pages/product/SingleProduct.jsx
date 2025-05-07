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

    // Refs
    const imageRef = useRef(null);
    const thumbnailRef = useRef(null);

    // Memoized calculations
    const currentPrice = useMemo(() => {
        if (!product) return 0;

        if (Object.keys(selectedVariants).length === 0) {
            return product.salePrice || product.price;
        }

        for (const [name, value] of Object.entries(selectedVariants)) {
            const variant = product.variants?.find(v => v.name === name);
            const variantValue = variant?.values?.find(v => v.value === value);
            if (variantValue?.price) {
                return variantValue.price;
            }
        }

        return product.salePrice || product.price;
    }, [selectedVariants, product]);

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

        const matchedVariant = product.variants?.find(
            (variant) => variant.image === imageURL
        );
        if (!matchedVariant) {
            setSelectedVariants({});
        }
    }, [loadedImages, handleImageLoad, product?.variants]);
    // Inside your SingleProduct component

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
                top: e.clientY - 125,
                left: e.clientX - 125,
                backgroundSize: `${naturalWidth}px ${naturalHeight}px`,
                display: 'block'
            });
        }
    }, []);

    // In your JSX, update the zoom lens div as shown above

    const handleMouseLeave = useCallback(() => {
        setZoomStyle({});
    }, []);

    const scrollThumbnails = useCallback((direction) => {
        if (thumbnailRef.current) {
            const scrollAmount = 100;
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
            const response = await getProductBySlug(slug);
            setProduct(response?.product);
            setOriginalPrice(response?.product?.salePrice || response?.product?.price);
            setProductVariants(response?.product?.variants || []);

            // Preload images when product data is fetched
            if (response?.product?.images?.length) {
                response.product.images.forEach(img => {
                    const image = new Image();
                    image.src = img;
                });
                setSelectedImage(response.product.images[0]);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error in fetching product", error);
        }
    }, [slug]);

    // Effects
    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        if (product?.category?._id) {
            fetchRelatedProducts();
        }
    }, [product, fetchRelatedProducts]);

    // Variant and cart handlers
    const handleVariantChange = useCallback((variantName, value) => {
        if (selectedVariants[variantName] === value) {
            const updatedVariants = { ...selectedVariants };
            delete updatedVariants[variantName];
            setSelectedVariants(updatedVariants);
            setSelectedImage(product.images[0]);
        } else {
            const updatedVariants = { ...selectedVariants, [variantName]: value };
            setSelectedVariants(updatedVariants);

            const selectedVariant = product.variants?.find(
                (variant) => variant.name === variantName
            );
            const selectedValue = selectedVariant?.values.find(
                (val) => val.value === value
            );

            if (selectedValue?.image) {
                setSelectedImage(selectedValue.image);
            } else if (selectedVariant?.image) {
                setSelectedImage(selectedVariant.image);
            }
        }
    }, [selectedVariants, product]);

    const prepareVariantsForBackend = useCallback(() => {
        return Object.entries(selectedVariants).map(([variantName, value]) => ({
            name: variantName,
            values: [value],
        }));
    }, [selectedVariants]);

    const handleAddToCart = useCallback(async () => {
        const variantsForBackend = prepareVariantsForBackend();
        let selectedVariantImage = product.images[0];

        for (const [variantName, value] of Object.entries(selectedVariants)) {
            const selectedVariant = product.variants?.find((variant) => variant.name === variantName);
            if (selectedVariant) {
                const selectedValue = selectedVariant.values.find((val) => val.value === value);
                if (selectedValue?.image) {
                    selectedVariantImage = selectedValue.image;
                    break;
                } else if (selectedVariant?.image) {
                    selectedVariantImage = selectedVariant.image;
                    break;
                }
            }
        }

        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: currentPrice,
            image: selectedVariantImage || product?.images[0],
            count: selectedQuantity,
            selectedVariants: variantsForBackend,
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.deliveryCharges
        };

        try {
            dispatch(addToCart(cartItem));
            setIsDrawerOpen(true);
        } catch (error) {
            toast.error("Failed to add the product to the cart. Please try again.");
            console.error("Error adding item to cart:", error);
        }
    }, [prepareVariantsForBackend, selectedVariants, product,
        currentPrice, selectedQuantity, dispatch]);

    const currentCartItems = useSelector((state) => state.cart.products);
    console.log("Current Cart Items:", currentCartItems);


    const handleByNow = useCallback(async () => {
        const variantsForBackend = prepareVariantsForBackend();
        let selectedVariantImage = product.images[0];

        for (const [variantName, value] of Object.entries(selectedVariants)) {
            const selectedVariant = product.variants?.find((variant) => variant.name === variantName);
            if (selectedVariant) {
                const selectedValue = selectedVariant.values.find((val) => val.value === value);
                if (selectedValue?.image) {
                    selectedVariantImage = selectedValue.image;
                    break;
                } else if (selectedVariant?.image) {
                    selectedVariantImage = selectedVariant.image;
                    break;
                }
            }
        }

        const cartItem = {
            productId: product?._id,
            title: product?.title,
            price: currentPrice,
            image: selectedVariantImage || product?.images[0],
            count: selectedQuantity,
            selectedVariants: variantsForBackend,
            freeShipping: product?.freeShipping,
            deliveryCharges: product?.deliveryCharges
        };

        try {
            // 1. Add the new item to Redux cart
            dispatch(addToCart(cartItem));
            // 3. Prepare the payload for the backend
            const updatedCartItems = [...currentCartItems, cartItem];
            const cartPayload = {
                products: updatedCartItems.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    count: item.count,
                    selectedVariants: item.selectedVariants,
                    freeShipping: item.freeShipping,
                    deliveryCharges: item.deliveryCharges
                }))
            };
            await addItemToCart(userId, cartPayload);
            setTimeout(() => {
                navigateTo("/cart/checkout");
            }, 1000);
        } catch (error) {
            toast.error("Failed to proceed to checkout. Please try again.");
            console.error("Error during Buy Now:", error);
        }
    }, [prepareVariantsForBackend, selectedVariants, product, currentPrice, selectedQuantity, dispatch, userId, navigateTo]);


    const handleQuantityChange = useCallback((operation) => {
        setSelectedQuantity((prev) =>
            operation === "increase"
                ? Math.min(prev + 1, product?.stock)
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
    if (!product) return <div className="text-center py-20">Product not found!</div>;

    const schemaData = getProductSchemaData(product, currentPrice);
    if (!schemaData) return null;

    return (
        <div className="max-w-screen px-4 md:px-5 pt-1 md:pt-3">
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

            <div className="flex flex-col md:flex-row gap-10">
                {/* Product Images */}
                <div className="w-full md:w-1/2 flex flex-col md:flex-row">
                    {/* Main Image */}
                    <div className="relative flex-1 order-1 md:order-2 mt-4 md:mt-3  ">
                        <div
                            className="overflow-hidden aspect-square h-[350px] w-[350px] border border-red-100 mx-auto relative"
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
                    <div className="relative md:w-20 flex order-2 items-center md:order-1 max-h-72 flex-row md:flex-col mt-8">
                        <button
                            onClick={() => scrollThumbnails("up")}
                            className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 bg-none text-main font-extrabold "
                        >
                            <FaChevronUp strokeWidth={24} />
                        </button>
                        <button
                            onClick={() => scrollThumbnails("down")}
                            className="hidden md:block absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-none text-main font-extrabold "
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
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        className="w-full h-full object-cover rounded"
                                        loading="lazy"
                                        alt={`Thumbnail ${index}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollThumbnails("left")}
                            className="md:hidden absolute left-0 top-1/2 transform -translate-y-1/2 bg-none text-main font-semibold "
                        >
                            <FaChevronLeft strokeWidth={24} />
                        </button>
                        <button
                            onClick={() => scrollThumbnails("right")}
                            className="md:hidden absolute right-0 top-1/2 transform -translate-y-1/2 bg-none text-main font-semibold "
                        >
                            <FaChevronRight strokeWidth={24} />
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full md:w-1/2 ml-0 md:ml-5 py-0 md:py-4 max-w-screen-xl">
                    <h1 className="text-[26px]  font-space capitalize font-semibold text-gray-900 mb-[6px]">
                        {product?.title || "Product Title"}
                    </h1>
                    {product?.category?.name && (
                        <p className="text-sm capitalize mb-1">
                            <strong>Category:</strong> <Link to={`/category/${product?.category?.slug}`} className="no-underline text-base font-medium">{product.category.name}</Link>
                        </p>
                    )}
                    <p className="text-base font-space pl-2 md:pl-0 text-black"
                        dangerouslySetInnerHTML={{
                            __html: showFullDescription
                                ? product?.description
                                : product?.description?.slice(0, 100) + "..."
                        }}
                    />
                    <button
                        onClick={toggleDescription}
                        className="text-main text-sm mb-1 font-semibold"
                    >
                        {showFullDescription ? "See less" : "See more"}
                    </button>
                    <p className="text-xl md:text-2xl font-poppins font-semibold mb-3">
                        {product.salePrice && currentPrice === originalPrice ? (
                            <>
                                <span className="text-gray-500 line-through decoration-1 text-base">Rs. {product.price}</span>
                                <span className="text-main ml-2">Rs. {currentPrice}</span>
                            </>
                        ) : (
                            <span>Rs. {currentPrice}</span>
                        )}
                    </p>

                    {/* Quantity Selector */}
                    {product?.stock && (
                        <div className="flex items-center gap-4 mb-3">
                            <button
                                onClick={() => handleQuantityChange("decrease")}
                                disabled={selectedQuantity === 1}
                                aria-label="Decrease quantity"
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === 1 ? "bg-gray-300" : "bg-main opacity-70"
                                    }`}
                            >
                                -
                            </button>
                            <span className="text-xl">{selectedQuantity}</span>
                            <button
                                onClick={() => handleQuantityChange("increase")}
                                aria-label="Increase quantity"
                                disabled={selectedQuantity === product.stock}
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === product.stock ? "bg-gray-300" : "bg-main opacity-70"
                                    }`}
                            >
                                +
                            </button>
                        </div>
                    )}

                    {/* Variants */}
                    {productVariants && productVariants.length > 0 ? (
                        productVariants.map((variant, index) => (
                            <div key={index} className="mb-3 gap-2 ">
                                <h3 className="text-md capitalize font-semibold text-main font-poppins">
                                    {variant.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 items-center ">
                                    {variant.values.map((value, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleVariantChange(variant.name, value.value)}
                                            className={`px-4 py-2 capitalize max-w-full border ${selectedVariants[variant.name] === value.value
                                                ? "bg-main text-white"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            {value.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : null}

                    {/* Actions */}
                    <div>
                        <div className="flex w-full flex-col md:flex-row md:justify-start gap-4">
                            <Link
                                onClick={handleByNow}
                                className="bg-main opacity-70 no-underline text-sm lg:text-base w-full md:w-auto md:flex-2 text-center hover:opacity-90 text-white font-bold py-2 px-6"
                            >
                                Buy Now
                            </Link>
                            <Link
                                onClick={handleAddToCart}
                                className="bg-main opacity-70 no-underline w-full md:w-auto gap-1 text-sm lg:text-base flex items-center justify-center hover:bg-main hover:opacity-90 text-white font-bold py-2 px-6"
                            >
                                <TiShoppingCart className="text-xl" />
                                Add to Cart
                            </Link>
                        </div>
                        <button
                            onClick={handleWhatsAppOrder}
                            className="bg-green-600 my-3 w-full sm:w-auto md:max-w-screen-md hover:bg-green-800 text-white font-bold py-2 px-8 gap-2 flex items-center justify-center text-base md:text-xl">
                            <FaWhatsapp className="text-2xl" /> Order via WhatsApp
                        </button>
                    </div>
                </div>
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
        </div>
    );
};

export default React.memo(SingleProduct);