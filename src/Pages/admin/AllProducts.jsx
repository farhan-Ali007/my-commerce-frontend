import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoAddCircle, IoPencil, IoTrash } from "react-icons/io5";
import toast from "react-hot-toast";
import { deleteProduct, getAllProducts } from "../../functions/product";
import { truncateTitle } from "../../helpers/truncateTitle";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMyProducts = async (page) => {
    try {
      setIsPageLoading(true);
      const response = await getAllProducts(page);
      if (response?.products?.length > 0) {
        setProducts((prevProducts) => [...prevProducts, ...response.products]);
        setHasMore(response.products.length === 8); // Assuming 8 is the limit per page
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Error in fetching my products.", error);
      toast.error("Failed to load products");
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !isPageLoading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isPageLoading]);

  const handleDelete = async (id) => {
    try {
      setDeletingProductId(id);
      const response = await deleteProduct(id);
      toast.success(response?.message);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
    } catch (error) {
      console.log("Error in deleting product", error);
      toast.error("Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleDeleteClick = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (isConfirmed) {
      await handleDelete(id);
    }
  };

  const filteredProducts = products?.filter(
    (product) =>
      product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-screen-lg mx-auto bg-gray-100 px-1 md:px-4 py-6">
      {/* Page header and search input */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-main">
          All Products [{`${filteredProducts?.length}`}]
        </h1>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-main focus:border-transparent"
        />
        <Link
          to="/add-product"
          className="bg-main opacity-70 no-underline text-white px-4 py-2 md:py-2 lg:py-[0.6rem] rounded-full shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <IoAddCircle className="text-xl" /> Add Product
        </Link>
      </div>

      {/* Main content */}
      {isPageLoading && products.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md">
          <div className="animate-spin h-16 w-16 border-4 border-main border-opacity-90 border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl font-semibold text-main opacity-80">
            Loading products...
          </p>
        </div>
      ) : filteredProducts?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => (
            <div
              key={product?._id}
              className="bg-white p-2 rounded-lg shadow-md flex flex-col justify-between items-center transition-transform hover:scale-105"
            >
              {/* Product image and details */}
              <Link to="">
                <img
                  src={product?.images[0]}
                  alt={product?.title}
                  loading="lazy"
                  className="w-full h-full md:h-40 object-cover rounded-md mb-4"
                />
              </Link>
              <h2 className="text-lg font-semibold text-center">
                {truncateTitle(product?.title, 40)}
              </h2>
              <p className="text-gray-500 text-sm text-center">
                {product?.category?.name}
              </p>
              <p className="text-lg font-bold line-through decoration-red-700 decoration-[0.5px] text-center mt-2">
                Rs.{product?.price}
              </p>
              {product.salePrice && (
                <p className="font-bold text-base text-gray-400 text-center ">
                  Rs.{product?.salePrice}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-4 mt-4 w-full justify-between">
                <Link
                  to={`/edit-product/${product.slug}`}
                  className="bg-green-500 no-underline text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-green-600 transition-colors w-full justify-center"
                >
                  <IoPencil /> Edit
                </Link>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-red-600 transition-colors w-full justify-center"
                  onClick={() => handleDeleteClick(product?._id)}
                  disabled={deletingProductId === product._id}
                >
                  {deletingProductId === product._id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-90 border-t-transparent rounded-full"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <IoTrash /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-10">No products available</p>
      )}
      {!hasMore && products.length > 0 && (
        <p className="text-center py-4 text-gray-500">
          No more products to load.
        </p>
      )}
      {isPageLoading && products.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin h-6 w-6 border-4 border-main border-opacity-90 border-t-transparent rounded-full"></div>
          <p className="ml-4 text-main opacity-70">Loading more products...</p>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
