import React, { Suspense, lazy, useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Banner from '../components/Banner';
import { FaWhatsapp } from 'react-icons/fa'; 
import websiteSchema from '../helpers/getWebsiteSchema';
import organizationSchema from '../helpers/getOrgSchema';

// Lazy-load components with intersection observer for better performance
const Categories = lazy(() => import('../components/Categories'));
const Brands = lazy(() => import('../components/Brands'));
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'));
const NewArrivals = lazy(() => import('../components/NewArrivals'));
const BestSellers = lazy(() => import('../components/BestSellers'));
const ShowcaseCategories = lazy(() => import('../components/ShowcaseCategories'));
const Marquee = lazy(() => import('react-fast-marquee'));

// Optimized skeleton with better visual hierarchy
const SectionSkeleton = ({ className = '', height = 'h-40 md:h-60' }) => (
  <div className={`w-full ${height} bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-lg ${className}`}>
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Intersection Observer Hook for lazy loading sections
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Optimized Section Component with lazy loading
const LazySection = ({ children, fallback, height = '640px', className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver(0.1);

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: height,
        minHeight: isVisible ? 'auto' : height 
      }}
    >
      {isVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

const showcaseCategories = [
  {
    slug: "trimmers-and-shavers",
    name: "Trimmers and Shavers",
    image: "/trimmer.png",
  },
  {
    slug: "mehndi-stickers", 
    name: "Mehndi Stickers",
    image: "/mehndi.webp",
  },
  {
    slug: "beauty-and-personal-care",
    name: "Beauty & Personal Care",
    image: "/beauty.webp"
  }
];

const Home = () => {
  // Performance optimization: Preload critical data
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);

  useEffect(() => {
    // Mark when critical above-the-fold content is ready
    const timer = setTimeout(() => {
      setCriticalDataLoaded(true);
      // Dispatch custom event for performance monitoring
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-ready'));
        if (window.performance?.mark) {
          window.performance.mark('critical-content-loaded');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Preload next sections when user scrolls
  const handleScroll = useCallback(() => {
    if (window.scrollY > 200) {
      // Start preloading below-the-fold content
      import('../components/Brands');
      import('../components/FeaturedProducts');
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      <Helmet>
        <meta name="description" content="Etimad Mart – trusted online store in Pakistan. Shop top-quality grooming tools, trimmers & shavers, fashion wear, kitchen & household items with great deals." />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        
        {/* Performance optimizations */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/customBanner1.webp" fetchpriority="high" />
        
        {/* Prefetch critical API endpoints */}
        <link rel="prefetch" href="/api/categories" />
        <link rel="prefetch" href="/api/products?featured=true&limit=8" />
      </Helmet>

      {/* Hidden H1 for SEO */}
      <h1 className="hidden">
        Etimad Mart - Best Online Shopping store in Pakistan
      </h1>

      {/* Critical above-the-fold content */}
      <Banner />

      {/* Categories - Load immediately as it's above the fold */}
      <LazySection 
        fallback={<SectionSkeleton height="h-32 md:h-48" />}
        height="480px"
      >
        <Categories />
      </LazySection>

      {/* Marquee - Low priority */}
      <LazySection 
        fallback={<div className="h-16 bg-gray-100 animate-pulse rounded my-4"></div>}
        height="64px"
      >
        <Marquee 
          speed={50} 
          pauseOnHover 
          direction="left" 
          gradient={false} 
          className="text-2xl md:text-3xl font-semibold md:font-extrabold my-2 md:my-8 text-primary"
        >
          🔥 Sale 50% Off! 🔥 &nbsp; | &nbsp; Limited Time Offer! &nbsp; | &nbsp; New Arrivals Available Now! 🎉
        </Marquee>
      </LazySection>

      {/* Brands - Second priority */}
      <LazySection 
        fallback={<SectionSkeleton height="h-32 md:h-40" />}
        height="480px"
      >
        <Brands />
      </LazySection>

      {/* Featured Products - Third priority */}
      <LazySection 
        fallback={<SectionSkeleton />}
        height="640px"
      >
        <FeaturedProducts />
      </LazySection>

      {/* New Arrivals - Fourth priority */}
      <LazySection 
        fallback={<SectionSkeleton />}
        height="640px"
      >
        <NewArrivals />
      </LazySection>

      {/* Best Sellers - Fifth priority */}
      <LazySection 
        fallback={<SectionSkeleton />}
        height="800px"
      >
        <BestSellers />
      </LazySection>

      {/* Showcase Categories - Lowest priority */}
      <LazySection 
        fallback={<SectionSkeleton />}
        height="600px"
      >
        {showcaseCategories.map(cat => (
          <ShowcaseCategories
            key={cat.slug}
            categorySlug={cat.slug}
            categoryName={cat.name}
            categoryImage={cat.image}
          />
        ))}
      </LazySection>

      {/* WhatsApp Floating Icon - Load after critical content */}
      {criticalDataLoaded && (
        <a
          href="https://wa.me/+923071111832?text=Hello%2C%20I%20have%20a%20question%20regarding%20a%20product%20on%20Etimad%20Mart.%20Can%20you%20please%20assist%20me%3F"
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-green-600 text-white rounded-full w-14 h-14 md:h-16 md:w-16 flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors duration-300 z-50"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
        >
          <FaWhatsapp className="text-3xl" size={36} />
        </a>
      )}
    </>
  );
};

export default Home;
