import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FaUpload } from 'react-icons/fa'
import { createBrand, getAllBrands, deleteBrand } from '../../functions/brand';
import toast from 'react-hot-toast';

const AdminBrands = () => {
  const [brandName, setBrandName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const response = await getAllBrands();
      setBrands(response?.brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleCreateBrand = async () => {
    if (brandName.trim() && imageFile) {
      const formData = new FormData();
      formData.append('name', brandName);
      formData.append('logo', imageFile);

      try {
        setLoading(true)
        const response = await createBrand(formData);
        setBrandName('');
        setImageFile(null);
        setLoading(false)
        toast.success("Brand added successfully.")
        fetchBrands()
      } catch (error) {
        setLoading(false)
        console.error('Error creating brand:', error);
        toast.error(error?.response?.data?.message)
      }
    } else {
      console.error('Please provide both brand name and logo');
    }
  };

  const handleDeleteBrand = async (id) => {
    try {
      setLoading(true);
      const response = await deleteBrand(id);
      setBrands(brands.filter(brand => brand._id !== id));
      fetchBrands();
      setLoading(false);
      toast.success(response?.message)
    } catch (error) {
      setLoading(false);
      console.error("Error deleting brand:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <h3 className='text-main text-xl md:text-2xl font-extrabold text-center pb-6'>
        Add New Brand
      </h3>

      {/* Input Fields and Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter category name"
          className="border outline-none border-gray-300 p-3 rounded-md w-full focus:ring-1 focus:ring-gray-200 transition"
        />

        {/* Styled file input button */}
        <label
          htmlFor="image-input"
          className="cursor-pointer outline-none text-main p-3 border-2 border-main hover:bg-main hover:text-white rounded-md opacity-80 hover:bg-opacity-90 transition w-full md:w-1/3 flex items-center justify-center"
        >
          {!imageFile && <FaUpload className='mr-1' />}
          {imageFile ? 'Image selected' : 'Select Image'}
        </label>
        <input
          id="image-input"
          type="file"
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          onClick={handleCreateBrand}
          className="bg-main opacity-80 hover:bg-opacity-90 text-white p-3 rounded-md transition w-full md:w-1/3 flex items-center justify-center"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Display Categories */}
      <h2 className='text-center text-2xl pb-2 font-extrabold text-main'>All Brands ({`${brands?.length}`})</h2>

      {loading ? (
        <div className="w-full flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-main opacity-90"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {brands.map((brand) => (
            <div
              key={brand._id}
              className="flex justify-between items-center bg-white p-4 rounded-md shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={brand?.logo}
                  alt={brand?.name}
                  loading="lazy"
                  className="w-16 h-16 object-cover rounded-md"
                />
                <h3 className="text-xl capitalize font-semibold"> {brand?.name.replace(/-/g, ' ')}</h3>
              </div>
              <button
                onClick={() => handleDeleteBrand(brand._id)}
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

export default AdminBrands;
