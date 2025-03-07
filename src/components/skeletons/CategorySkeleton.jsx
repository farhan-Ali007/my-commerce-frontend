const CategorySkeleton = () => (
    <div className="relative group cursor-pointer overflow-hidden">
        {/* Placeholder for Category Image */}
        <div className="w-full h-36 bg-gray-300 animate-pulse"></div>
        {/* Placeholder for Category Name */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="text-gray-300 text-xl font-bold animate-pulse">Loading...</span>
        </div>
    </div>
);

export default CategorySkeleton;