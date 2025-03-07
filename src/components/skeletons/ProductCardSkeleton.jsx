import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="max-w-sm bg-white rounded overflow-hidden shadow-lg animate-pulse flex flex-col items-stretch">
      {/* Skeleton Product Image */}
      <div className="overflow-hidden w-full mb-4 bg-gray-300 h-48"></div>

      {/* Skeleton Product Details */}
      <div className="mx-2 justify-start font-roboto mb-4">
        <div className="w-3/4 h-4 bg-gray-200 mb-2"></div>
        <div className="w-1/2 h-3 bg-gray-200 mb-2"></div>
        <div className="w-1/4 h-4 bg-gray-200 mb-2"></div>
      </div>

      {/* Skeleton Product Button */}
      <div className="flex flex-col w-full text-center items-center mb-2 gap-2 px-3">
        <div className="w-full h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
