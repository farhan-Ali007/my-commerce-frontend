import React from 'react';
import Banner from '../components/Banner';
import BestSellers from '../components/BestSellers';
import Marquee from "react-fast-marquee";
import Categories from '../components/Categories';
import NewArrivals from '../components/NewArrivals';
import Brands from '../components/Brands';
import { FaWhatsapp } from 'react-icons/fa'; // Importing WhatsApp icon from react-icons
import FeaturedProducts from '../components/FeaturedProducts';
import ShowcaseCategories from '../components/ShowcaseCategories';

const Home = () => {
  return (
    <div>
      <Banner />
      <Categories />
      <Brands />
      <Marquee speed={50} pauseOnHover direction="left" gradient gradientColor="#FFB727" gradientWidth={50}  className="text-2xl md:text-3xl font-roboto font-semibold md:font-extrabold my-2 md:my-8 text-primary">
        🔥 Sale 50% Off! 🔥 &nbsp; | &nbsp;  Limited Time Offer!  &nbsp; | &nbsp; New Arrivals Available Now! 🎉
      </Marquee>
      <FeaturedProducts />
      <NewArrivals />
      <BestSellers />
      <ShowcaseCategories />
      {/* WhatsApp Floating Icon */}
      <a
        href="https://wa.me/+923071111832"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-green-500 text-white rounded-full w-14 h-14 md:h-16 md:w-16 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 z-50"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaWhatsapp className="text-3xl" size={32} />
      </a>
    </div>
  );
};

export default Home;