import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getHomepageBanners } from "../functions/homepage";

// Static banners moved outside component to prevent recreation on every render
const staticBanners = [
  {
    _id: 'custom1',
    image: '/customBanner1.webp',
    link: '#',
    alt: 'Custom Banner 1',
    priority: true, // Mark as LCP candidate
    width: 1920,
    height: 550,
  },
  {
    _id: 'custom2',
    image: '/customBanner2.webp',
    link: '#',
    alt: 'Custom Banner 2',
    priority: false,
    width: 1920,
    height: 550,
  },
];

const Banner = React.memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  // Mobile detection with responsive behavior
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const [mountSlider, setMountSlider] = useState(false);
  // Autoplay plugin for Keen (pauses on hover, when page is hidden, and when offscreen)
  const autoplay = useCallback((delay = 1000) => (slider) => {
    let timeoutId;
    let mouseOver = false;
    let stopped = false;
    const clear = () => timeoutId && clearTimeout(timeoutId);
    const next = () => {
      clear();
      if (mouseOver || stopped) return;
      timeoutId = setTimeout(() => slider.next(), delay);
    };

    slider.on("created", () => {
      const container = slider.container;

      // Do not autoplay with reduced motion or a single slide
      try {
        const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || slider.slides.length < 2) {
          stopped = true;
          clear();
          return;
        }
      } catch { }

      const onMouseOver = () => { mouseOver = true; clear(); };
      const onMouseOut = () => { mouseOver = false; next(); };
      container.addEventListener('mouseover', onMouseOver);
      container.addEventListener('mouseout', onMouseOut);

      const onVisibility = () => { stopped = document.hidden; stopped ? clear() : next(); };
      document.addEventListener('visibilitychange', onVisibility);

      let io;
      try {
        io = new IntersectionObserver((entries) => {
          entries.forEach((e) => { stopped = !e.isIntersecting; stopped ? clear() : next(); });
        });
        io.observe(container);
      } catch { }

      next();

      slider.on('dragStarted', clear);
      slider.on('animationEnded', next);
      slider.on('updated', next);

      slider.on('destroyed', () => {
        container.removeEventListener('mouseover', onMouseOver);
        container.removeEventListener('mouseout', onMouseOut);
        document.removeEventListener('visibilitychange', onVisibility);
        if (io) {
          try { io.disconnect(); } catch { }
        }
        clear();
      });
    });
  }, []);
  const [sliderContainerRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      renderMode: 'precision',
      slides: { perView: 1, spacing: 0 },
      slideChanged: (s) => setCurrentSlide(s.track.details.rel),
      breakpoints: {
        "(min-width: 768px)": {
          slides: { perView: 1, spacing: 0 },
        },
      },
    },
    [autoplay(4000)]
  );

  // Mobile-first dimensions for better LCP
  const bannerDimensions = useMemo(() => ({
    mobile: { width: 480, height: 140 },
    tablet: { width: 1024, height: 320 },
    desktop: { width: 1920, height: 550 }
  }), []);
  const aspectRatio = useMemo(() =>
    bannerDimensions.desktop.width / bannerDimensions.desktop.height,
    [bannerDimensions]
  );

  const preloaded = (typeof window !== 'undefined' && Array.isArray(window.__PRELOADED_BANNERS)) ? window.__PRELOADED_BANNERS : [];
  const [banners, setBanners] = useState(() => {
    // Try to get cached banners first to prevent re-fetching on HMR
    if (typeof window !== 'undefined' && window.__BANNER_CACHE) {
      return window.__BANNER_CACHE;
    }
    // Use preloaded banners if available, otherwise use static banners for LCP
    return preloaded.length > 0 ? preloaded : staticBanners;
  });
  // console.log("Banners----->", banners)
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && window.__BANNER_CACHE) {
      return false;
    }
    // Never show loading since we always have static banners
    return false;
  });
  const [error, setError] = useState(null);
  const [imageLoadedStates, setImageLoadedStates] = useState({});
  const mounted = useRef(false);

  const fetchBanners = useCallback(async () => {
    if (!mounted.current) return;
    if (preloaded.length > 0) {
      setLoading(false);
      return;
    }

    // Always use static banners first for better LCP
    setBanners(staticBanners);
    setLoading(false);

    // Optionally fetch API banners in background (commented out for LCP optimization)
    /*
    try {
      setError(null);
      const response = await getHomepageBanners();
      const raw = Array.isArray(response) ? response : (response?.banners || response?.data || []);
      const list = Array.isArray(raw) ? raw.map((it, idx) => ({
        _id: it?._id || it?.id || String(idx),
        image: it?.image || it?.url || it?.src || '',
        link: it?.link || '#',
        alt: it?.alt || `Banner ${idx + 1}`,
      })) : [];
      
      // Only update if API banners are different and valid
      if (list.length > 0) {
        setBanners(list);
        // Cache banners to prevent re-fetching on HMR
        if (typeof window !== 'undefined') {
          window.__BANNER_CACHE = list;
        }
        // Reset image loaded states when banners change
        setImageLoadedStates({});
      }
    } catch (e) {
      console.error("Banner fetch failed, using static banners", e);
      // Keep static banners on API failure
    }
    */
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchBanners();
    return () => { mounted.current = false; };
  }, [fetchBanners]);

  // Reset image loaded states when banners change
  useEffect(() => {
    setImageLoadedStates({});
  }, [banners]);

  // Mount slider after initial render if there are multiple banners
  useEffect(() => {
    const resolvedBanners = banners.length ? banners : staticBanners;
    if (resolvedBanners.length > 1) {
      const id = requestAnimationFrame(() => setMountSlider(true));
      return () => cancelAnimationFrame(id);
    }
  }, [banners]);

  const handleDotClick = useCallback((index) => {
    instanceRef.current?.moveToIdx(index);
  }, [instanceRef]);

  const getOptimizedImageUrl = useCallback((imageUrl, width, height) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/')) return imageUrl;
    const sep = imageUrl.includes('?') ? '&' : '?';
    // Mobile-optimized: aggressive compression for mobile, better quality for desktop
    const isMobile = width <= 640;
    const quality = isMobile ? 'q_auto:low' : 'q_auto:good';
    const format = 'f_webp'; // Force WebP for better compression
    return `${imageUrl}${sep}${format}&${quality}&dpr=auto&w=${width}&h=${height}&c=fill`;
  }, []);

  const renderBannerSkeleton = useCallback(() => {
    const paddingTopPercentage = (bannerDimensions.desktop.height / bannerDimensions.desktop.width) * 100;
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingTop: `${paddingTopPercentage}%`,
          backgroundColor: '#f3f4f6',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          {/* Skeleton content overlay */}
          <div className="absolute bottom-4 left-4 space-y-2">
            <div className="w-32 h-4 bg-white/30 rounded"></div>
            <div className="w-24 h-3 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }, [bannerDimensions]);

  const handleImageLoad = useCallback((bannerId, isLCP) => {
    setImageLoadedStates(prev => ({ ...prev, [bannerId]: true }));
    if (isLCP && typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark('lcp-banner-loaded');
    }
  }, []);

  const handleImageError = useCallback((bannerId) => {
    console.error('Error loading banner image:', bannerId);
    setImageLoadedStates(prev => ({ ...prev, [bannerId]: true })); // Show skeleton instead of broken image
  }, []);

  // Mobile-optimized simple banner render
  const renderMobileBanner = useCallback((banner) => {
    if (!banner?.image) return null;
    
    return (
      <div className="banner-container w-full" style={{ height: 'auto', overflow: 'visible' }}>
        <img
          src={banner.image}
          alt={banner.alt || 'Banner'}
          loading="eager"
          decoding="sync"
          fetchpriority="high"
          className="w-full h-auto"
          style={{ 
            display: 'block',
            objectFit: 'contain',
            height: 'auto',
            maxHeight: 'none',
            minHeight: 'auto'
          }}
        />
      </div>
    );
  }, []);

  const renderBannerImage = useCallback((banner, index) => {
    if (!banner?.image) return renderBannerSkeleton();
    
    // Use simple mobile banner for better performance
    if (isMobile) {
      return renderMobileBanner(banner);
    }
    
    const paddingTopPercentage = (bannerDimensions.desktop.height / bannerDimensions.desktop.width) * 100;
    const isLCP = index === 0 || banner.priority; // First image or priority flag is LCP candidate
    // For static banners, assume they're preloaded and ready
    const imageLoaded = imageLoadedStates[banner._id] || banner.image?.startsWith('/') || true;

    return (
      <div className="banner-container w-full">
        {/* No skeleton for banner images - immediate display for LCP */}
        <picture className="block w-full h-auto">
          {/* Mobile-first: Load smallest image first */}
          <source
            media="(max-width: 640px)"
            srcSet={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.mobile.width,
              bannerDimensions.mobile.height
            )}
            type="image/webp"
          />
          <source
            media="(max-width: 1024px)"
            srcSet={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.tablet.width,
              bannerDimensions.tablet.height
            )}
            type="image/webp"
          />
          <img
            src={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.desktop.width,
              bannerDimensions.desktop.height
            )}
            alt={banner.alt || `Banner ${index + 1}`}
            loading="eager"
            decoding="sync"
            fetchpriority="high"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            className="w-full h-auto object-cover object-center"
            style={{ display: 'block' }}
            onLoad={() => handleImageLoad(banner._id, isLCP)}
            onError={() => handleImageError(banner._id)}
          />
        </picture>
      </div>
    );
  }, [bannerDimensions, getOptimizedImageUrl, renderBannerSkeleton, imageLoadedStates, handleImageLoad, handleImageError]);

  const resolvedBanners = banners.length ? banners : staticBanners;
  const firstBanner = resolvedBanners[0];
  const sliderKey = useMemo(() => {
    const ids = (resolvedBanners || []).map(b => b?._id || '').join('-');
    return `slider-${resolvedBanners.length}-${ids}`;
  }, [resolvedBanners]);

  const renderDots = useCallback(() => (
    <div className="flex justify-center my-2">
      {resolvedBanners.map((_, index) => (
        <button
          key={index}
          className={`min-w-[10px] min-h-[30px] w-6 h-6 md:h-8 md:w-8 rounded-full cursor-pointer  transition-all duration-200 ease-out flex items-center justify-center hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent`}
          onClick={() => handleDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
          type="button"
        >
          <div className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
              ? 'bg-secondary w-3 h-3 shadow-lg'
              : 'bg-primary hover:bg-primary/80'
            }`} />
        </button>
      ))}
    </div>
  ), [resolvedBanners, currentSlide, handleDotClick]);

  // if (error) {
  //     return (
  //         <div className="w-full py-8 text-center text-red-500">
  //         </div>
  //     );
  // }

  // Never show loading skeleton - always show static banners immediately
  // if (loading && !resolvedBanners.length) {
  //   return (
  //     <div className="relative w-full mx-auto">
  //       <div className="relative w-full">
  //         {renderBannerSkeleton()}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative w-full mx-auto" style={{ height: 'auto', overflow: 'visible' }}>
      <div className="relative w-full" style={{ height: 'auto', overflow: 'visible' }}>
        {!mountSlider ? (
          <div className="w-full" style={{ height: 'auto', overflow: 'visible' }}>
            <a
              href={firstBanner?.link || '#'}
              className="block w-full group"
              target="_self"
              rel="noopener noreferrer"
              style={{ height: 'auto' }}
            >
              {firstBanner ? renderBannerImage(firstBanner, 0) : renderBannerImage(staticBanners[0], 0)}
            </a>
          </div>
        ) : (
          <div ref={sliderContainerRef} className="keen-slider">
            {resolvedBanners.map((banner, index) => (
              <div key={banner._id} className="keen-slider__slide">
                <a
                  href={banner.link}
                  className="block w-full group"
                  target="_self"
                  rel="noopener noreferrer"
                  style={{ height: 'auto' }}
                >
                  {renderBannerImage(banner, index)}
                </a>
              </div>
            ))}
          </div>
        )}
        {mountSlider && resolvedBanners.length > 1 && renderDots()}
      </div>
    </div>
  );
});

Banner.displayName = 'Banner';

export default Banner;