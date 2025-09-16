import React, { Suspense, lazy, useEffect, useState } from 'react';

import { Helmet } from 'react-helmet-async';
import Banner from '../components/Banner';
import { FaWhatsapp } from 'react-icons/fa'; 
import websiteSchema from '../helpers/getWebsiteSchema';
import organizationSchema from '../helpers/getOrgSchema';
import SectionRenderer from '../components/sections/SectionRenderer';
import homeLayout from '../config/sections/home.json';
import { getPublishedBySlug } from '../functions/pageLayout';

// Lazy-load below-the-fold sections to improve LCP/TBT
const Categories = lazy(() => import('../components/Categories'));
const Brands = lazy(() => import('../components/Brands'));
const FeaturedProducts = lazy(() => import('../components/FeaturedProducts'));
const NewArrivals = lazy(() => import('../components/NewArrivals'));
const BestSellers = lazy(() => import('../components/BestSellers'));
const ShowcaseCategories = lazy(() => import('../components/ShowcaseCategories'));
const Marquee = lazy(() => import('react-fast-marquee'));

const SectionSkeleton = ({ className = '' }) => (
  <div className={`w-full h-40 md:h-60 bg-gray-100 animate-pulse rounded ${className}`} />
);

const showcaseCategories = [
  {
    slug: "trimmers-and-shavers",
    name: "Trimmers and Shavers",
    image: "/category.jpg",
  },
  {
    slug: "mehndi-stickers",
    name: "Mehndi Stickers",
    image: "/mehndi.webp",
  },
  {
    slug:"beauty-and-personal-care",
    name:"Beauty & Personal Care",
    image:"/beauty.webp"
  }
  // Add more categories as needed
];

const Home = () => {
  // Load the published layout from backend, fallback to static JSON
  const [serverLayout, setServerLayout] = useState(null);
  const [layoutLoading, setLayoutLoading] = useState(true);
  const [layoutError, setLayoutError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLayoutLoading(true);
        const data = await getPublishedBySlug('home');
        // Be flexible with backend response shape
        const resolved = data?.publishedLayout || data?.layout || data;
        if (mounted) setServerLayout(resolved);
      } catch (e) {
        if (mounted) setLayoutError(e?.message || 'Failed to load layout');
      } finally {
        if (mounted) setLayoutLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <meta name="description" content="Etimad Mart – trusted online store in Pakistan. Shop top-quality grooming tools, trimmers & shavers, fashion wear, kitchen & household items with great deals." />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      {/* Config-driven sections rendered via SectionRenderer (temporarily disabled during development) */}
       {/* {layoutLoading ? (
         <SectionSkeleton className="h-40" />
       ) : (
         <SectionRenderer layout={serverLayout || homeLayout} />
       )} */}
       {/* {layoutError ? (
         <div className="text-center text-red-600 text-sm my-2">{layoutError}</div>
       ) : null} */}
      <h1 className=" hidden text-3xl font-bold text-center mt-6 mb-4">
         Etimad Mart - Best Online Shopping store in Pakistan
      </h1>
      <Banner />
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '480px' }}>
        <Suspense fallback={<SectionSkeleton className="h-24" />}> 
          <Categories />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton className="h-10" />}> 
        <Marquee speed={50} pauseOnHover direction="left" gradient={false} className="text-2xl md:text-3xl font-roboto font-semibold md:font-extrabold my-2 md:my-8 text-primary">
          🔥 Sale 50% Off!    🔥 &nbsp; | &nbsp;  Limited Time Offer!  &nbsp; | &nbsp; New Arrivals Available Now! 🎉
        </Marquee>
      </Suspense>
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '480px' }}>
        <Suspense fallback={<SectionSkeleton />}> 
          <Brands />
        </Suspense>
      </div>

      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '640px' }}>
        <Suspense fallback={<SectionSkeleton />}> 
          <FeaturedProducts />
        </Suspense>
      </div>

      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '640px' }}>
        <Suspense fallback={<SectionSkeleton />}> 
          <NewArrivals />
        </Suspense>
      </div>

      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <Suspense fallback={<SectionSkeleton />}> 
          <BestSellers />
        </Suspense>
      </div>

      <div style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <Suspense fallback={<SectionSkeleton />}> 
          {showcaseCategories.map(cat => (
            <ShowcaseCategories
              key={cat.slug}
              categorySlug={cat.slug}
              categoryName={cat.name}
              categoryImage={cat.image}
            />
          ))}
        </Suspense>
      </div>

      {/* WhatsApp Floating Icon */}
      <a
        href="https://wa.me/+923071111832?text=Hello%2C%20I%20have%20a%20question%20regarding%20a%20product%20on%20Etimad%20Mart.%20Can%20you%20please%20assist%20me%3F"
        className="fixed bottom-6 animate-spin-pause  right-6 md:bottom-10 md:right-10 bg-green-600 text-white rounded-full w-14 h-14 md:h-16 md:w-16 flex items-center justify-center shadow-lg hover:bg-green-800 transition-colors duration-300 z-50"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp className="text-3xl font-bold" size={36} />
      </a>
    </>
  );
};

export default Home;