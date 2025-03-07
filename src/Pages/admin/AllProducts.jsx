import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoAddCircle, IoPencil, IoTrash } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { deleteProduct, getMyProducts } from '../../functions/product';

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            const response = await getMyProducts();
            setProducts(response?.products);
            setLoading(false);
        } catch (error) {
            console.log("Error in fetching my products.", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const response = await deleteProduct(id);
            toast.success(response?.message);
            fetchMyProducts();
        } catch (error) {
            console.log("Error in deleting product", error);
            toast.error("Failed to delete product.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this product?");
        if (isConfirmed) {
            await handleDelete(id);
        }
    };

    const filteredProducts = products?.filter((product) =>
        product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-screen-lg mx-auto bg-gray-100 px-1 md:px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-semibold text-main">
                    All Products [{`${products?.length}`}]
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
                    className="bg-main opacity-70 text-white px-4 py-2 md:py-2 lg:py-[0.6rem] rounded-full shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <IoAddCircle className="text-xl" /> Add Product
                </Link>
            </div>

            {filteredProducts?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts?.map((product, index) => (
                        <div
                            key={product?.id || `product-${index}`}
                            className="bg-white p-2 rounded-lg shadow-md flex flex-col justify-between items-center transition-transform hover:scale-105"
                        >
                            <Link to="">
                                <img
                                    src={product?.images[0]}
                                    alt={product?.title}
                                    loading="lazy"
                                    className="w-full h-full md:h-40 object-cover rounded-md mb-4"
                                />
                            </Link>
                            <h2 className="text-lg font-semibold text-center">{product?.title}</h2>
                            <p className="text-gray-500 text-sm text-center">{product?.category?.name}</p>
                            <p className="text-lg font-bold text-center mt-2">Rs.{product?.price}</p>
                            <div className="flex gap-4 mt-4 w-full justify-between">
                                <Link
                                    to={`/edit-product/${product.slug}`}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-green-600 transition-colors w-full"
                                >
                                    <IoPencil /> Edit
                                </Link>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2 hover:bg-red-600 transition-colors w-full"
                                    onClick={() => handleDeleteClick(product?._id)}
                                >
                                    <IoTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No products available</p>
            )}

            {/* Loader while deleting */}
            {loading && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-75"
                    style={{ height: "100vh" }}
                >
                    <div className="animate-spin h-10 w-10 border-4 border-main border-opacity-90 border-t-transparent rounded-full"></div>
                    <p className="ml-4 text-main opacity-70 ">Deleting Product...</p>
                </div>
            )}
        </div>
    );
};

export default AllProducts;
