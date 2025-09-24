import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BiSolidChevronLeft, BiSolidChevronRight , } from "react-icons/bi";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getFeaturedProducts } from "../functions/product";
import ProductCard from "./cards/ProductCard";
import ProductCardSkeleton from "./skeletons/ProductCardSkeleton";
import { motion } from "framer-motion";

const FeaturedProducts = React.memo(() => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [mountSlider, setMountSlider] = useState(false);
  const [sliderContainerRef, instanceRef] = useKeenSlider({
    loop: true,
    renderMode: 'precision',
    slides: { 
      perView: 2,
      spacing: 8,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 3, spacing: 12 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 5, spacing: 16 },
      },
      "(min-width: 1280px)": {
        slides: { perView: 5, spacing: 16 },
      },
    },
  });

  // Motion gating: skip animations on touch devices or when user prefers reduced motion
  const allowMotion = useMemo(() => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    return !(prefersReduced || isCoarse);
  }, []);

  const productsPerPage = 8;

  const headingVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      },
    }),
    []
  );

  // Pause autoplay when offscreen to reduce work; resume when visible
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      const api = instanceRef.current;
      if (!api) return;
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        // Resume autoplay when visible
        api.moveToIdx && api.moveToIdx(api.track.details.rel);
      } else {
        // Pause when not visible (Keen Slider doesn't have explicit pause/play)
        // We can stop the autoplay by not calling moveToIdx
      }
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Also pause when tab is hidden
  useEffect(() => {
    const onVis = () => {
      const api = instanceRef.current;
      if (!api) return;
      // Keen Slider handles autoplay automatically, no need for manual pause/play
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const fetchProducts = useCallback(
    async (page) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFeaturedProducts(page, productsPerPage);
        setProducts(data?.products || []);
        setTotalPages(data?.totalPages || 0);
      } catch (error) {
        console.error("Error fetching products", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [productsPerPage]
  );

  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
      fetchProducts(pageNumber);
    },
    [totalPages, fetchProducts]
  );

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  // Mount the heavy slider after first paint so content shows instantly
  useEffect(() => {
    const id = requestAnimationFrame(() => setMountSlider(true));
    return () => cancelAnimationFrame(id);
  }, []);


  const handlePrev = useCallback(() => {
    instanceRef.current?.prev();
  }, [instanceRef]);

  const handleNext = useCallback(() => {
    instanceRef.current?.next();
  }, [instanceRef]);



  const getVisiblePages = useCallback(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages]);

  const renderSkeletons = useMemo(
    () => (
      <div className="relative overflow-x-auto scrollbar-hide">
        <div className="flex" style={{ width: "max-content" }}>
          {Array.from({ length: productsPerPage }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2 py-2 md:px-3"
              style={{ width: "250px" }}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    ),
    [productsPerPage]
  );

  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center mt-6 mb-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-full ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-secondary hover:bg-primary"
          }`}
          aria-label="Previous page"
        >
          <FaChevronLeft />
        </button>

        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentPage === page
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-full ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-secondary hover:bg-primary "
          }`}
          aria-label="Next page"
        >
          <FaChevronRight />
        </button>
      </div>
    );
  }, [currentPage, totalPages, handlePageChange, getVisiblePages]);

  if (error) {
    return <div className="w-full py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div
      className="w-full px-1 mt-4 overflow-hidden md:px-4 lg:px-6"
      ref={containerRef}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '560px 420px' }}
    >
      {/* Heading with lines */}
      <motion.div
        className="flex items-center justify-center w-full px-5 mb-4 md:mb-7"
        variants={headingVariants}
        initial={allowMotion ? 'hidden' : false}
        whileInView={allowMotion ? 'visible' : undefined}
        viewport={allowMotion ? { once: true, amount: 0.5 } : undefined}
      >
        <div className="flex-grow h-[0.5px] mr-4 bg-primary"></div>
        <h2 className="text-2xl font-extrabold text-center text-secondary font-space md:text-4xl whitespace-nowrap">
          Trending Products
        </h2>
        <div className="flex-grow h-[0.5px] ml-4 bg-primary"></div>
      </motion.div>

      {loading ? (
        renderSkeletons
      ) : (
        <div className="relative">
          {!mountSlider ? (
            // Static list before Keen mounts
            <div className="flex gap-2 lg:gap-0 overflow-x-auto scrollbar-hide px-1 lg:px-0">
              {products.map((product) => (
                <div key={product._id} className="shrink-0 w-[250px] px-1 lg:px-0 py-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div ref={sliderContainerRef} className="keen-slider">
                {products.map((product) => (
                  <div key={product._id} className="keen-slider__slide px-1 lg:px-[0.1rem] py-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {/* Custom arrows for Keen */}
              <button
                onClick={handlePrev}
                className="absolute left-0 md:-left-3 top-1/2 md:top-[45%] lg:top-1/2 transform -translate-y-1/2 bg-primary opacity-70 text-secondary hover:text-white p-1 rounded-full z-10 hover:opacity-90"
                aria-label="Previous slide"
              >
                <BiSolidChevronLeft />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 md:-right-3 top-1/2 md:top-[45%] lg:top-1/2 transform -translate-y-1/2 bg-primary opacity-70 text-secondary hover:text-white p-1 rounded-full z-10 hover:opacity-90"
                aria-label="Next slide"
              >
                <BiSolidChevronRight />
              </button>
            </div>
          )}
        </div>
      )}

      {renderPagination}
    </div>
  );
});

FeaturedProducts.displayName = "FeaturedProducts";

export default FeaturedProducts;
