import React from 'react';
import { Helmet } from 'react-helmet-async';
import Banner from '../components/Banner';
import BestSellers from '../components/BestSellers';
import Marquee from "react-fast-marquee";
import Categories from '../components/Categories';
import NewArrivals from '../components/NewArrivals';
import Brands from '../components/Brands';
import { FaWhatsapp } from 'react-icons/fa'; 
import FeaturedProducts from '../components/FeaturedProducts';
import ShowcaseCategories from '../components/ShowcaseCategories';
import websiteSchema from '../helpers/getWebsiteSchema';
import organizationSchema from '../helpers/getOrgSchema';

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
  
  return (
    <>
      <Helmet>
        <meta name="description" content="Etimad Mart – trusted online store in Pakistan. Shop top-quality grooming tools, trimmers & shavers, fashion wear, kitchen & household items with great deals." />
        <link rel="canonical" href={window.location.href} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      <h1 className=" hidden text-3xl font-bold text-center mt-6 mb-4">
         Etimad Mart - Best Online Shopping store in Pakistan
      </h1>
      <Banner />
      <Categories />
      <Brands />
      <Marquee speed={50} pauseOnHover direction="left" gradient gradientColor="#FFB727" gradientWidth={50}  className="text-2xl md:text-3xl font-roboto font-semibold md:font-extrabold my-2 md:my-8 text-primary">
        🔥 Sale 50% Off!    🔥 &nbsp; | &nbsp;  Limited Time Offer!  &nbsp; | &nbsp; New Arrivals Available Now! 🎉
      </Marquee>
      <FeaturedProducts />
      <NewArrivals />
      <BestSellers />
      {showcaseCategories.map(cat => (
        <ShowcaseCategories
          key={cat.slug}
          categorySlug={cat.slug}
          categoryName={cat.name}
          categoryImage={cat.image}
        />
      ))}
      {/* WhatsApp Floating Icon */}
      <a
        href="https://wa.me/+923071111832?text=Hello%2C%20I%20have%20a%20question%20regarding%20a%20product%20on%20Etimad%20Mart.%20Can%20you%20please%20assist%20me%3F"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-green-500 text-white rounded-full w-14 h-14 md:h-16 md:w-16 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp className="text-3xl" size={32} />
      </a>
    </>
  );
};

export default Home;