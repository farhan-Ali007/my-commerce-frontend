import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/cards/ProductCard';
import { getProductsByBrand } from '../../functions/product';

const ProductsByBrand = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { brand } = useParams();
    // console.log("Brand------>", brand)

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProductsByBrand(brand);
            // console.log("response of brand Products----->", response);
            setProducts(response?.products || [])
        } catch (error) {
            console.log("Error in fetching products ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="w-full min-h-screen px-4 md:px-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-main my-3 md:my-6 capitalize">
                {brand.replace(/-/g, ' ')}
            </h1>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <span className="animate-spin w-10 h-10 border-4 border-main border-t-transparent rounded-full"></span>
                </div>
            ) : products.length === 0 ? (
                <p className="text-center text-gray-500">No products found in this brand.</p>
            ) : (
                <div className="grid grid-cols-2  md:grid-cols-5  gap-4 py-2 md:py-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsByBrand;
