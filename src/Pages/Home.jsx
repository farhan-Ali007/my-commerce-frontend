import React from 'react'
import Banner from '../components/Banner'
import BestSellers from '../components/BestSellers'
import Marquee from "react-fast-marquee";
import Categories from '../components/Categories'
import NewArrivals from '../components/NewArrivals'
import Brands from '../components/Brands';

const Home = () => {
  return (
    <div >
      <Banner />
      <Categories />
      <Brands />
      <NewArrivals />
      <Marquee speed={50} gradient={false} className="text-2xl md:text-3xl font-semibold md:font-extrabold my-4 md:my-8 text-main">
        🔥 Sale 50% Off! 🔥 &nbsp; | &nbsp;  Limited Time Offer!  &nbsp; | &nbsp; New Arrivals Available Now! 🎉
      </Marquee>
      <BestSellers />
    </div>
  )
}

export default Home