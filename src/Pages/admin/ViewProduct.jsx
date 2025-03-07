import React, { useEffect, useState } from 'react';
import { getProductById } from '../../functions/product';
import { useParams } from 'react-router-dom';

const ViewProduct = () => {
  const { id } = useParams();

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProductById = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      // console.log("Response of fetching single product ---->", response);
      setProduct(response?.product);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("Error in fetching product", error);
    }
  };

  useEffect(() => {
    fetchProductById();
  }, []);

  // Combine product images and variant images
  const allImages = [
    ...(product.images || []),
    ...(product.variants?.map((variant) => variant.image) || []),
  ];

  return (
    <div className="">
      {/* Container */}
      <h1 className='text-main text-2xl font-extrabold text-center py-5'>Product Information</h1>
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Section (Images) */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-x-auto">
              {allImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg shadow-lg"
                />
              ))}
            </div>
          </div>

          {/* Right Section (Product Info) */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-lg text-gray-600">{product.description}</p>

            <div>
              <h3 className="text-xl font-semibold text-main">
                Category: <span className="text-gray-600">{product.category?.name}</span>
              </h3>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-main mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags?.map((tag) => (
                  <span
                    key={tag._id}
                    className="px-3 py-1 bg-main text-white rounded-lg text-sm shadow-md"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-main">
                Weight: <span className="text-gray-600">{product.weight} kg</span>
              </h3>
            </div>

            {/* Variants */}
            <div>
              <div className="mt-4">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="mb-4 flex items-center gap-3">
                      {/* <h4 className="text-lg font-semibold text-main">{variant.name}:</h4> */}
                      <div className="flex flex-wrap space-x-4 mt-2">
                        <button
                          key={variant._id}
                          className="px-6 py-3 bg-gray-400 text-white rounded-lg transition-all hover:bg-main hover:opacity-60 mb-2 sm:mb-0"
                        >
                          {variant.value}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No variants available</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
