import React, { useState } from "react";
import { IoAddCircle, IoTrash } from 'react-icons/io5';

const CreateProductForm = ({ buttonText, onSubmit, formTitle, categories, subCategories, tags, brands }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        longDescription: "",
        weight: "",
        images: [],
        category: "",
        subCategory: "",
        price: "",
        salePrice: "",
        brand: "",
        stock: "",
        tags: [],
        variants: [{ name: "", values: [{ value: "", image: "" }] }],
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [freeShipping, setFreeShipping] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.filter(
            (file) => !formData.images.some((img) =>
                typeof img === "string" ? false : img.name === file.name
            )
        );
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));
        setImagePreviews((prev) => [
            ...prev,
            ...newImages.map((file) => URL.createObjectURL(file)),
        ]);
    };

    const handleImageRemove = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (variantIndex, field, value, valueIndex = null) => {
        const updatedVariants = [...formData.variants];
        if (field === "name") {
            updatedVariants[variantIndex].name = value;
        } else if (field === "value") {
            updatedVariants[variantIndex].values[valueIndex].value = value;
        } else if (field === "image") {
            updatedVariants[variantIndex].values[valueIndex].image = value;
        }
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    };

    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { name: "", values: [{ value: "", image: "" }] }],
        }));
    };

    const addVariantValue = (variantIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values.push({ value: "", image: "" });
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    };

    const removeVariant = (variantIndex) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== variantIndex),
        }));
    };

    const removeVariantValue = (variantIndex, valueIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values = updatedVariants[variantIndex].values.filter((_, i) => i !== valueIndex);
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    };

    const handleTagSelect = (tag) => {
        setFormData((prev) => ({
            ...prev,
            tags: [...prev.tags, tag],
        }));
    };

    const handleTagRemove = (tag) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submissionData = new FormData();
        submissionData.append("title", formData.title);
        submissionData.append("description", formData.description);
        submissionData.append("longDescription", formData.longDescription);
        submissionData.append("price", formData.price);
        submissionData.append("salePrice", formData.salePrice);
        submissionData.append("weight", formData.weight);
        submissionData.append("category", formData.category);
        submissionData.append("subCategory", formData.subCategory);
        submissionData.append("brand", formData.brand);
        submissionData.append("stock", formData.stock);
        submissionData.append("freeShipping", freeShipping);
        submissionData.append("tags", (formData.tags || []).map(tag => tag.name).join(','));

        // Handle variants
        const validVariants = formData.variants
            .filter(variant => variant.name && variant.values.length > 0)
            .flatMap((variant, variantIndex) =>
                variant.values.map((value, valueIndex) => {
                    const variantData = {
                        name: variant.name,
                        value: value.value,
                    };

                    if (value.image && value.image instanceof File) {
                        submissionData.append(`variantImages`, value.image); // Append image file
                        variantData.imageIndex = variantIndex * variant.values.length + valueIndex; // Save index for association
                    }

                    return variantData;
                })
            );

        submissionData.append("variants", JSON.stringify(validVariants.length > 0 ? validVariants : []));

        // Handle product images
        formData.images.forEach((image, index) => {
            if (image instanceof File) {
                submissionData.append("images", image);
            }
        });

        onSubmit(submissionData);
        setTimeout(() => {
            resetForm();
        }, 5000);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            weight: "",
            images: [],
            category: "",
            subCategory: "",
            price: "",
            salePrice: "",
            brand: "",
            stock: "",
            tags: [],
            variants: [{ name: "", values: [{ value: "", image: "" }] }],
        });
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[600px] md:w-[800px] my-4 mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl text-center font-semibold mb-4 text-main">{formTitle}</h2>

            {/* Title */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Description */}
            <div className="mb-4 min-h-16">
                <label className="block font-medium mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full h-28 md:h-32 border px-4 py-4 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>
            {/* Long Description */}
            <div className="mb-4 min-h-28">
                <label className="block font-medium mb-2">Long Description</label>
                <textarea
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    className="w-full h-32 md:h-44 border px-4 py-4 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Weight */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Weight</label>
                <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    placeholder="weight in kgs..."
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Brand */}
            {/* <div className="mb-4">
                <label className="block font-medium mb-2">Brand</label>
                <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div> */}

            <div className="mb-4">
                <label className="block font-medium mb-2">Brand</label>
                <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                    <option value="" disabled>Select a brand</option>
                    {brands?.map((brand, index) => (
                        <option key={index} value={brand?.name}>{brand?.name}</option>
                    ))}
                </select>
            </div>
            {/* Category */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                    <option value="" disabled>Select a category</option>
                    {categories?.map((category, index) => (
                        <option key={index} value={category?.name}>{category?.name}</option>
                    ))}
                </select>
            </div>

            {/* SubCategory */}
            <div className="mb-4">
                <label className="block font-medium mb-2">subCategory</label>
                <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                    <option value="" disabled>Select subCategory</option>
                    {subCategories?.map((sub, index) => (
                        <option key={index} value={sub?.name}>{sub?.name}</option>
                    ))}
                </select>
            </div>

            {/* Tags Selection */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags?.map((tag, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleTagSelect(tag)}
                            className={`px-4 py-2 rounded-full border-2 border-gray-300 ${formData?.tags?.includes(tag) ? 'bg-gray-300 text-black' : 'bg-white text-black'}`}
                        >
                            {tag?.name}
                        </button>
                    ))}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                    {formData?.tags?.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2 bg-main opacity-90 text-white px-4 py-1 rounded-full">
                            <span>{tag?.name}</span> {/* Access the name property of the tag */}
                            <button
                                type="button"
                                onClick={() => handleTagRemove(tag)}
                                className="text-sm font-semibold"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

            </div>

            {/* Price */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Price</label>
                <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Sale Price */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Sale Price</label>
                <input
                    type="text"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Variants */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Variants</label>
                {formData.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="border p-4 mb-4 rounded-md">
                        <div className="mb-2">
                            <input
                                type="text"
                                placeholder="Variant Name (e.g., Color, Size)"
                                value={variant.name}
                                onChange={(e) => handleVariantChange(variantIndex, "name", e.target.value)}
                                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 mb-2"
                            />
                        </div>

                        {variant.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="mb-2">
                                <input
                                    type="text"
                                    placeholder="Variant Value (e.g., Red, Large)"
                                    value={value.value}
                                    onChange={(e) => handleVariantChange(variantIndex, "value", e.target.value, valueIndex)}
                                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 mb-2"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            handleVariantChange(variantIndex, "image", file, valueIndex);
                                        }
                                    }}
                                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                                />
                                {value.image && (
                                    <div className="mt-2">
                                        <img
                                            src={value.image instanceof File ? URL.createObjectURL(value.image) : value.image}
                                            alt="Variant Preview"
                                            className="w-20 h-20 object-cover"
                                        />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                    className="flex items-center gap-1 bg-red-500 text-white px-4 py-1 rounded-md mt-2"
                                >
                                    <IoTrash /> Remove Value
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => addVariantValue(variantIndex)}
                            className="flex items-center gap-1 bg-blue-500 text-white px-4 py-1 rounded-md"
                        >
                            <IoAddCircle /> Add Value
                        </button>

                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="flex items-center gap-1 bg-red-500 text-white px-4 py-1 rounded-md"
                            >
                                <IoTrash /> Remove Variant
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    <IoAddCircle /> Add Variant
                </button>
            </div>




            {/* Stock */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Stock</label>
                <input
                    type="text"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>
            {/* Product Images */}
            <div className="mb-4">
                <label className="block font-medium mb-2">Product Images</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <div className="mt-2 flex flex-wrap gap-2 justify-start max-w-full">
                    {imagePreviews.map((image, index) => (
                        <div key={index} className="relative">
                            <img
                                src={image}
                                alt={`Preview ${index}`}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-sm p-1"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

            </div>
            {/* Free shipping */}
            <div className="mb-4">
                <label className="block font-medium mb-2">
                    <input
                        type="checkbox"
                        checked={freeShipping}
                        onChange={(e) => setFreeShipping(e.target.checked)}
                        className="mr-2"
                    />
                    Free Shipping
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
                <button
                    type="submit"
                    className="bg-main opacity-70 hover:opacity-90 w-full text-white px-8 py-2 rounded-md"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
};

export default CreateProductForm;
