import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { createCategory, getAllCategories, deleteCategory } from '../../functions/categories';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categoryName, setCategoryName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response?.success) {
                setCategories(response?.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleCreateCategory = async () => {
        if (categoryName.trim() && imageFile) {
            const formData = new FormData();
            formData.append('name', categoryName);
            formData.append('image', imageFile);

            try {
                setLoading(true)
                const response = await createCategory(formData);
                if (response?.success) {
                    setCategoryName('');
                    setImageFile(null);
                    setLoading(false)
                    fetchCategories()
                    toast.success(response?.message)
                }
            } catch (error) {
                console.error('Error creating category:', error);
                toast.error(error?.response?.data?.message)
            }
        } else {
            console.error('Please provide both category name and image');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            const response = await deleteCategory(id);
            if (response?.success) {
                setCategories(categories.filter(cat => cat._id !== id));
            }
            toast.success(response?.message)
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <h3 className='text-main text-3xl font-extrabold text-center pb-6'>
                Create New Category
            </h3>

            {/* Input Fields and Button */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="border outline-none border-gray-300 p-3 rounded-md w-full focus:ring-1 focus:ring-gray-200 transition"
                />

                {/* Styled file input button */}
                <label
                    htmlFor="image-input"
                    className="cursor-pointer outline-none text-main p-3 border-2 border-main hover:bg-main hover:text-white rounded-md opacity-80 hover:bg-opacity-90 transition w-full md:w-1/3 flex items-center justify-center"
                >
                    {imageFile ? 'Image selected' : 'Select Image'}
                </label>
                <input
                    id="image-input"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                />

                <button
                    onClick={handleCreateCategory}
                    className="bg-main opacity-80 hover:bg-opacity-90 text-white p-3 rounded-md transition w-full md:w-1/3 flex items-center justify-center"
                >
                    {loading ? "Adding..." : "Add Category"}
                </button>
            </div>

            {/* Display Categories */}
            <h2 className='text-center text-2xl pb-2 font-extrabold text-main'>All Categories ({`${categories?.length}`})</h2>

            {loading ? (
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-main opacity-90"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {categories.map((cat) => (
                        <div
                            key={cat._id}
                            className="flex justify-between items-center bg-white p-4 rounded-md shadow-lg hover:shadow-xl transition"
                        >
                            <div className="flex items-center gap-4">
                                <img
                                    src={cat?.Image}
                                    alt={cat?.name}
                                    loading="lazy"
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                                <h3 className="text-xl font-semibold">{cat?.name}</h3>
                            </div>
                            <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="text-main opacity-80 hover:opacity-100 transition"
                            >
                                <FaTrashAlt size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
