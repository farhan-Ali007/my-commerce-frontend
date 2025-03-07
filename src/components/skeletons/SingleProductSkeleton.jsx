import React from 'react';

const SingleProductSkeleton = () => {
    return (
        <div className="flex flex-col md:flex-row gap-10 animate-pulse">
            {/* Image section */}
            <div className="w-full md:w-1/2">
                <div className="relative">
                    <div className="w-full h-96 bg-gray-200"></div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index} 
                            className="h-20 w-20 bg-gray-200 rounded p-1 flex-shrink-0"
                        ></div>
                    ))}

                </div>
            </div>

            {/* Product details section */}
            <div className="w-full md:w-1/2 mx-0 md:mx-5 py-4 max-w-screen-sm">
                <div className="h-10 w-3/4 bg-gray-200 mb-4"></div>
                <div className="h-6 w-full bg-gray-200 mb-6"></div>
                <div className="h-8 w-1/2 bg-gray-200 mb-6"></div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="text-xl">1</div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                </div>

                {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="mb-4">
                        <div className="h-6 w-1/3 bg-gray-200 mb-2"></div>
                        <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="px-4 py-2 bg-gray-200 rounded-lg w-1/4"
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}

                <div>
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div className="bg-gray-200 my-2 w-full md:w-auto md:flex-1 h-10 rounded-lg"></div>
                        <div className="bg-gray-200 my-2 w-full md:w-auto md:flex-1 h-10 rounded-lg"></div>
                    </div>
                    <div className="bg-gray-200 my-3 w-full h-12 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default SingleProductSkeleton;
