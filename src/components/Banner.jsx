import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { getBanners } from "../functions/banner";

const Banner = React.memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
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
      } catch {}

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
      } catch {}

      next();

      slider.on('dragStarted', clear);
      slider.on('animationEnded', next);
      slider.on('updated', next);

      slider.on('destroyed', () => {
        container.removeEventListener('mouseover', onMouseOver);
        container.removeEventListener('mouseout', onMouseOut);
        document.removeEventListener('visibilitychange', onVisibility);
        if (io) {
          try { io.disconnect(); } catch {}
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

  const bannerDimensions = useMemo(() => ({
    desktop: { width: 1920, height: 550 },
    tablet: { width: 1024, height: 320 },
    mobile: { width: 480, height: 140 }
  }), []);

  const aspectRatio = useMemo(() => 
    bannerDimensions.desktop.width / bannerDimensions.desktop.height,
    [bannerDimensions]
  );

  const staticBanners = [
    {
      _id: 'custom1',
      image: '/customBanner1.webp',
      link: '#',
      alt: 'Custom Banner 1',
    },
    {
      _id: 'custom2',
      image: '/customBanner2.webp',
      link: '#',
      alt: 'Custom Banner 2',
    },
  ];

  const preloaded = (typeof window !== 'undefined' && Array.isArray(window.__PRELOADED_BANNERS)) ? window.__PRELOADED_BANNERS : [];
  const [banners, setBanners] = useState(preloaded);
  // console.log("Banners----->" , banners)
  const [loading, setLoading] = useState(preloaded.length === 0);
  const [error, setError] = useState(null);
  const mounted = useRef(false);

  const fetchBanners = useCallback(async () => {
    if (!mounted.current) return;
    if (preloaded.length > 0) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getBanners();
      const raw = Array.isArray(response) ? response : (response?.banners || response?.data || []);
      const list = Array.isArray(raw) ? raw.map((it, idx) => ({
        _id: it?._id || it?.id || String(idx),
        image: it?.image || it?.url || it?.src || '',
        link: it?.link || '#',
        alt: it?.alt || `Banner ${idx + 1}`,
      })) : [];
      setBanners(list);
    } catch (e) {
      console.error("Banner fetch failed", e);
      setError("Failed to load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchBanners();
    return () => { mounted.current = false; };
  }, [fetchBanners]);

  // Mount heavy carousel after first paint so LCP can use the static first frame
  useEffect(() => {
    const id = requestAnimationFrame(() => setMountSlider(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleDotClick = useCallback((index) => {
    instanceRef.current?.moveToIdx(index);
  }, [instanceRef]);

  const getOptimizedImageUrl = useCallback((imageUrl, width, height) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/')) return imageUrl;
    const sep = imageUrl.includes('?') ? '&' : '?';
    // Use modern defaults for mobile: auto format, economical quality, and device DPR scaling
    return `${imageUrl}${sep}f_auto&q_auto:eco&dpr=auto&w=${width}&h=${height}&c=fill`;
  }, []);

  const renderBannerImage = useCallback((banner, index) => {
    if (!banner?.image) return null;
    const paddingTopPercentage = (bannerDimensions.desktop.height / bannerDimensions.desktop.width) * 100;
    const isLCP = index === 0; // First image is LCP candidate
    
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingTop: `${paddingTopPercentage}%`,
          backgroundColor: '#f3f4f6',
        }}
      >
        <picture className="absolute inset-0 block w-full h-full">
          <source
            media="(max-width: 640px)"
            srcSet={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.mobile.width,
              bannerDimensions.mobile.height
            )}
          />
          <source
            media="(max-width: 1024px)"
            srcSet={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.tablet.width,
              bannerDimensions.tablet.height
            )}
          />
          <img
            src={getOptimizedImageUrl(
              banner.image,
              bannerDimensions.desktop.width,
              bannerDimensions.desktop.height
            )}
            alt={banner.alt || `Banner ${index + 1}`}
            loading={isLCP ? 'eager' : 'lazy'}
            decoding={isLCP ? 'sync' : 'async'}
            fetchpriority={isLCP ? 'high' : 'low'}
            sizes="100vw"
            className={`absolute inset-0 object-cover object-center w-full h-full ${
              isLCP ? '' : 'transform transition-transform duration-300 ease-out motion-safe:md:group-hover:scale-105'
            }`}
            width={bannerDimensions.desktop.width}
            height={bannerDimensions.desktop.height}
            onLoad={isLCP ? () => {
              // Mark LCP as loaded for performance monitoring
              if (typeof window !== 'undefined' && window.performance?.mark) {
                window.performance.mark('lcp-banner-loaded');
              }
            } : undefined}
            onError={(e) => {
              console.error('Error loading banner image:', e);
              e.target.style.display = 'none';
            }}
          />
        </picture>
      </div>
    );
  }, [bannerDimensions, getOptimizedImageUrl]);

  const resolvedBanners = banners.length ? banners : staticBanners;
  const firstBanner = resolvedBanners[0];
  const sliderKey = useMemo(() => {
    const ids = (resolvedBanners || []).map(b => b?._id || '').join('-');
    return `slider-${resolvedBanners.length}-${ids}`;
  }, [resolvedBanners]);

  const renderDots = useCallback(() => (
    <div className="flex justify-center my-2">
      {resolvedBanners.map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer mx-[2px] transition-transform duration-200 ease-out ${
            index === currentSlide ? 'bg-secondary md:scale-110' : 'bg-primary'
          } md:hover:scale-125`}
          onClick={() => handleDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
          role="button"
          tabIndex={0}
        />
      ))}
    </div>
  ), [resolvedBanners, currentSlide, handleDotClick]);

    // if (error) {
    //     return (
    //         <div className="w-full py-8 text-center text-red-500">
    //             {error}
    //         </div>
    //     );
    // }

    return (
      <div className="relative w-full mx-auto">
        <div className="relative w-full">
          {!mountSlider ? (
            <div className="w-full">
              <a
                href={firstBanner?.link || '#'}
                className="block w-full h-full group"
                target="_self"
                rel="noopener noreferrer"
              >
                {firstBanner && renderBannerImage(firstBanner, 0)}
              </a>
            </div>
          ) : (
            <div ref={sliderContainerRef} className="keen-slider">
              {resolvedBanners.map((banner, index) => (
                <div key={banner._id} className="keen-slider__slide">
                  <a
                    href={banner.link}
                    className="block w-full h-full group"
                    target="_self"
                    rel="noopener noreferrer"
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