import React, { useEffect, useRef, useState, useMemo } from "react";
import { toast } from 'react-hot-toast';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaChevronUp, FaWhatsapp } from "react-icons/fa6";
import { TiShoppingCart } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CartDrawer from "../../components/drawers/CartDrawer";
import ReviewForm from "../../components/forms/ReviewForm";
import RelatedProducts from "../../components/RelatedProducts";
import SingleProductSkeleton from "../../components/skeletons/SingleProductSkeleton";
import { addItemToCart } from "../../functions/cart";
import { getProductBySlug, getRelatedProducts } from "../../functions/product";
import { addToCart } from '../../store/cartSlice';

const SingleProduct = () => {
    const dispatch = useDispatch();
    const { slug } = useParams();
    const navigateTo = useNavigate()
    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;
    const [product, setProduct] = useState({});
    const [originalPrice, setOriginalPrice] = useState(0); 
    const [productVariants, setProductVariants] = useState([])
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
    const imageRef = useRef(null);

    // Calculate current price based on selected variants
    const currentPrice = useMemo(() => {
        if (!product) return 0;
        
        // If no variants selected, return sale price or regular price
        if (Object.keys(selectedVariants).length === 0) {
            return product.salePrice || product.price;
        }
        
        // Check if any selected variant affects price
        for (const [name, value] of Object.entries(selectedVariants)) {
            const variant = product.variants?.find(v => v.name === name);
            const variantValue = variant?.values?.find(v => v.value === value);
            if (variantValue?.price) {
                return variantValue.price;
            }
        }
        
        // Default to sale price or regular price
        return product.salePrice || product.price;
    }, [selectedVariants, product]);

    const handleMouseMove = (e) => {
        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const backgroundX = (mouseX / rect.width) * imageRef.current.naturalWidth - 50;
            const backgroundY = (mouseY / rect.height) * imageRef.current.naturalHeight - 50;

            setZoomStyle({
                mouseX,
                mouseY,
                backgroundX,
                backgroundY,
                top: e.clientY - 50,
                left: e.clientX - 50,
            });
        }
    };

    const handleMouseLeave = () => {
        setZoomStyle({});
    };

    const thumbnailRef = useRef(null);

    const scrollThumbnails = (direction) => {
        if (thumbnailRef.current) {
            const scrollAmount = 100;
            thumbnailRef.current.scrollBy({ 
                left: direction === "left" ? -scrollAmount : scrollAmount, 
                behavior: "smooth" 
            });
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const response = await getRelatedProducts(product.category?._id, product._id);
            setRelatedProducts(response?.products);
            setCurrentPage(response?.currentPage);
            setTotalPages(response?.totalPages);
        } catch (error) {
            console.log("Error in fetching related products", error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await getProductBySlug(slug);
            setProduct(response?.product);
            setOriginalPrice(response?.product?.salePrice || response?.product?.price);
            setProductVariants(response?.product?.variants || []);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log("Error in fetching product", error);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (product?.category?._id) {
            fetchRelatedProducts();
        }
    }, [product, slug]);

    useEffect(() => {
        if (product?.images?.length > 0 && !selectedImage) {
            setSelectedImage(product.images[0]);
        }
    }, [product]);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const handleWhatsAppOrder = () => {
        const phoneNumber = "923277053836";
        const productLink = window.location.href;
        const message = `Hello Etimad, I want to buy:\n\n*${product?.title}*\n*Price:* Rs ${currentPrice}\n*URL:* ${productLink}\n\nThank you!`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleMouseEnterProduct = (imageURL) => {
        setSelectedImage(imageURL);
        const matchedVariant = product.variants?.find(
            (variant) => variant.image === imageURL
        );
        if (!matchedVariant) {
            setSelectedVariants({});
        }
    };

    const handleVariantChange = (variantName, value) => {
        // Check if the clicked variant is already selected
        if (selectedVariants[variantName] === value) {
            // Deselect the variant
            const updatedVariants = { ...selectedVariants };
            delete updatedVariants[variantName];
            setSelectedVariants(updatedVariants);
            
            // Reset the image to the default product image
            setSelectedImage(product.images[0]);
        } else {
            // Select the variant
            const updatedVariants = { ...selectedVariants, [variantName]: value };
            setSelectedVariants(updatedVariants);

            // Find the selected variant object
            const selectedVariant = product.variants?.find(
                (variant) => variant.name === variantName
            );

            // Find the selected value object within the variant
            const selectedValue = selectedVariant?.values.find(
                (val) => val.value === value
            );

            // Update the selected image if the variant value has an image
            if (selectedValue?.image) {
                setSelectedImage(selectedValue.image);
            } else if (selectedVariant?.image) {
                setSelectedImage(selectedVariant.image);
            }
        }
    };

    const prepareVariantsForBackend = () => {
        return Object.entries(selectedVariants).map(([variantName, value]) => ({
            name: variantName,
            values: [value],
        }));
    };

    const handleAddToCart = async () => {
        const variantsForBackend = prepareVariantsForBackend();
        let selectedVariantImage = product.images[0]; // Default to the first product image

        // Loop through the selected variants to find the correct image
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
    };

    const handleByNow = async () => {
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
            await addItemToCart(userId, { products: [cartItem] });
            navigateTo("/cart/checkout");
        } catch (error) {
            toast.error("Failed to proceed to checkout. Please try again.");
            console.error("Error during Buy Now:", error);
        }
    };

    const handleQuantityChange = (operation) => {
        setSelectedQuantity((prev) =>
            operation === "increase"
                ? Math.min(prev + 1, product?.stock)
                : Math.max(1, prev - 1)
        );
    };

    if (loading) return <SingleProductSkeleton />;
    if (!product) return <div className="text-center py-20">Product not found!</div>;

    return (
        <div className="max-w-screen px-4 md:px-5 pt-1 md:pt-3">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Product Images */}
                <div className="w-full md:w-1/2 flex flex-col md:flex-row">
                    {/* Main Image */}
                    <div className="relative flex-1 order-1 md:order-2 mt-4 md:mt-0 md:ml-4">
                        <div
                            className="overflow-hidden aspect-square h-[300px] w-[300px] border border-red-100 mx-auto relative"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                ref={imageRef}
                                src={selectedImage || "https://via.placeholder.com/500"}
                                alt={product?.title || "Product Image"}
                                loading="lazy"
                                className="w-full h-full object-contain cursor-pointer"
                            />
                            {zoomStyle.backgroundX !== undefined && (
                                <div
                                    style={{
                                        position: "fixed",
                                        border: "1px solid #ccc",
                                        borderRadius: "50%",
                                        width: "250px",
                                        zIndex: 2000,
                                        height: "250px",
                                        background: `url(${selectedImage || "https://via.placeholder.com/500"}) no-repeat`,
                                        backgroundSize: `${imageRef.current?.width * 2}px ${imageRef.current?.height * 2}px`,
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
                    <div className="relative md:w-20 flex order-2 items-center md:order-1 max-h-72 flex-row md:flex-col mt-4 md:mt-0">
                        <button
                            onClick={() => scrollThumbnails("up")}
                            className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 bg-none text-main font-semibold "
                        >
                            <FaChevronUp strokeWidth={24} />
                        </button>
                        <button
                            onClick={() => scrollThumbnails("down")}
                            className="hidden md:block absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-none text-main font-semibold "
                        >
                            <FaChevronDown strokeWidth={24} />
                        </button>

                        <div
                            ref={thumbnailRef}
                            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto whitespace-nowrap scrollbar-hide max-h-[300px] py-2 md:py-6"
                        >
                            {product?.images?.map((image, index) => (
                                <div
                                    key={index}
                                    className={`h-16 w-16 bg-slate-200 rounded p-1 cursor-pointer flex-shrink-0 ${selectedImage === image ? 'border-2 border-main' : 'border-none'}`}
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
                <div className="w-full md:w-1/2 ml-0 md:ml-5 py-4 max-w-screen-xl">
                    <h1 className="text-2xl md:text-3xl font-space capitalize font-semibold text-gray-900 mb-2">
                        {product?.title || "Product Title"}
                    </h1>
                    {product?.category?.name && (
                        <p className="text-sm text-gray-700">
                            <strong>Category:</strong> {product.category.name}
                        </p>
                    )}
                    <p className="text-base pl-2 md:pl-0 text-black"
                        dangerouslySetInnerHTML={{
                            __html: showFullDescription
                                ? product?.description
                                : product?.description?.slice(0, 100) + "..."
                        }}
                    />
                    <button
                        onClick={toggleDescription}
                        className="text-main text-sm mb-2 font-semibold"
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
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === 1 ? "bg-gray-300" : "bg-main opacity-70"}`}
                            >
                                -
                            </button>
                            <span className="text-xl">{selectedQuantity}</span>
                            <button
                                onClick={() => handleQuantityChange("increase")}
                                disabled={selectedQuantity === product.stock}
                                className={`p-1 rounded-full text-2xl w-8 h-8 flex items-center justify-center ${selectedQuantity === product.stock ? "bg-gray-300" : "bg-main opacity-70"}`}
                            >
                                +
                            </button>
                        </div>
                    )}

                    {/* Variants */}
                    {productVariants && productVariants.length > 0 ? (
                        productVariants.map((variant, index) => (
                            <div key={index} className="mb-3 gap-2">
                                <h3 className="text-md capitalize font-semibold text-main font-poppins">
                                    {variant.name}
                                </h3>
                                <div className="flex gap-2 items-center">
                                    {variant.values.map((value, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleVariantChange(variant.name, value.value)}
                                            className={`px-4 py-2 capitalize  border ${selectedVariants[variant.name] === value.value
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
                                className="bg-main opacity-70 no-underline text-sm lg:text-base  w-full md:w-auto  md:flex-2 text-center hover:opacity-90 text-white font-bold py-2 px-6"
                            >
                                Buy Now
                            </Link>
                            <Link
                                onClick={handleAddToCart}
                                className="bg-main opacity-70 no-underline  w-full md:w-auto  gap-1 text-sm lg:text-base flex items-center justify-center  hover:bg-main hover:opacity-90 text-white font-bold py-2 px-6 "
                            >
                                <TiShoppingCart className="text-xl" />
                                Add to Cart
                            </Link>
                        </div>
                        <button
                            onClick={handleWhatsAppOrder}
                            className="bg-green-600 my-3 w-full sm:w-auto md:max-w-screen-md hover:bg-green-800 text-white font-bold py-2 px-8 gap-2  flex items-center justify-center  text-base md:text-xl">
                            <FaWhatsapp className="text-2xl" /> Order via WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
            {/* Reviews Section */}
            <ReviewForm slug={slug} product={product} />
            <RelatedProducts
                relatedProducts={relatedProducts}
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
};

export default React.memo(SingleProduct);