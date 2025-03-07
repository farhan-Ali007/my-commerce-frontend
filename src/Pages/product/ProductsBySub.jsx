import React, { useEffect, useState } from 'react';
import { getProductsBySub } from '../../functions/product';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/cards/ProductCard';
import ProductCardSkeleton from '../../components/skeletons/ProductCardSkeleton';

const ProductsBySub = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { subcategorySlug } = useParams();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProductsBySub(subcategorySlug);
            // console.log("response of Sub Products----->", response);
            setProducts(response?.products || []);
        } catch (error) {
            console.log("Error in fetching products ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [subcategorySlug]);

    return (
        <div className="w-full min-h-screen px-4 md:px-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-center text-main my-6 capitalize">
                {subcategorySlug.replace(/-/g, ' ')}
            </h1>

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-2  md:grid-cols-4 lg:grid-cols-5  gap-4 py-4">
                    <ProductCardSkeleton />
                </div>
            ) : products.length === 0 ? (
                <p className="text-center text-gray-500">No products found in this subcategory.</p>
            ) : (
                <div className="grid grid-cols-2  md:grid-cols-4 lg:grid-cols-5  gap-4 py-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsBySub;
