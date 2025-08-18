import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { createTag, getAllTags, deleteTag } from '../../functions/tags'; 
import toast from 'react-hot-toast';

const AdminTags = () => {
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTags = async () => {
        try {
            const response = await getAllTags();
            if (response?.success) {
                setTags(response?.tags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // Create a new tag
    const handleCreateTag = async () => {
        if (tagName.trim()) {
            try {
                setLoading(true);
                const response = await createTag({ name: tagName });
                if (response?.success) {
                    setTagName('');
                    fetchTags(); 
                    toast.success(response?.message);
                }
            } catch (error) {
                console.error('Error creating tag:', error);
                toast.error(error?.response?.data?.message || "Failed to create tag.");
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Tag name is required.");
        }
    };

    const handleDeleteTag = async (id) => {
        try {
            window.confirm("Are you sure you want to delete this tag?")
            const response = await deleteTag(id);
            if (response?.success) {
                setTags(tags.filter(tag => tag._id !== id));
                toast.success(response?.message);
            }
        } catch (error) {
            console.error("Error deleting tag:", error);
            toast.error("Failed to delete tag.");
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h3 className='text-main text-3xl font-extrabold text-center pb-6'>
                Create New Tag
            </h3>

            {/* Input Fields and Button */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Enter tag name"
                    className="border outline-none border-gray-300 p-3 rounded-md w-full focus:ring-1 focus:ring-gray-200 transition"
                />
                <button
                    onClick={handleCreateTag}
                    className="bg-main opacity-80 hover:bg-opacity-90 text-white p-3 rounded-md transition w-full md:w-1/3 flex items-center justify-center"
                >
                    {loading ? "Adding..." : "Add Tag"}
                </button>
            </div>

            {/* Display Tags */}
            <h2 className='text-center text-2xl pb-2 font-extrabold text-main'>All Tags ({`${tags?.length}`})</h2>

            {loading ? (
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-main opacity-90"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {tags.map((tag) => (
                        <div
                            key={tag._id}
                            className="flex justify-between items-center bg-white p-4 rounded-md shadow-lg hover:shadow-xl transition"
                        >
                            <h3 className="text-xl font-semibold">{tag?.name}</h3>
                            <button
                                onClick={() => handleDeleteTag(tag._id)}
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

export default AdminTags;
