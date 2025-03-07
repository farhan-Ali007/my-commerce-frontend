import React, { useEffect, useState } from 'react'
import { getAllBrands } from '../functions/brand'
import { Link } from 'react-router-dom'

const Brands = () => {

    const [brands, setBrands] = useState([])

    const fetchBrands = async () => {
        try {
            const response = await getAllBrands()
            setBrands(response?.brands)
        } catch (error) {
            console.log("Error in fetching brands", error)
        }
    }

    useEffect(() => {
        fetchBrands()
    }, [])

    return (
        <div className="container mx-auto px-2 md:px-0 lg:px-2 py-3 md:py-4 ">
            <h2 className="text-2xl md:text-3xl font-extrabold font-space text-main text-center mb-5">
                Top Brands
            </h2>
            <div className="flex justify-start lg:justify-center space-x-4 md:space-x-5 lg:space-x-8 overflow-x-auto scrollbar-hide px-4">
                {brands?.slice(0,8).map((brand, index) => (
                    <div key={index} className="flex flex-col items-center flex-shrink-0">
                        <Link to={`/products/${brand?.name}`} className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-pink-500 to-red-500">
                            <div className="w-16 md:w-20 lg:w-28 h-16 md:h-20 lg:h-28 bg-white rounded-full flex items-center justify-center">
                                <img
                                    src={brand?.logo}
                                    alt={brand.name}
                                    className="w-14 md:w-18 lg:w-22 h-14 md:h-18 lg:h-22 object-contain rounded-full"
                                />
                            </div>
                        </Link>
                        <span className="mt-2 text-sm font-medium text-gray-700 text-center">
                            {brand.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default Brands