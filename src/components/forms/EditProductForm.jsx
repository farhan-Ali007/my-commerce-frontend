import React, { useState, useEffect } from "react";
import { IoAddCircle, IoTrash } from 'react-icons/io5';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const EditProductForm = ({ buttonText, onSubmit, formTitle, defaultValues, categories, subCategories, tags, brands }) => {

    // console.log("Default values for product---------->", defaultValues);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        longDescription: "",
        weight: "",
        images: [],
        category: "",
        subCategory: "",
        price: "",
        salePrice: null,
        brand: "",
        stock: "",
        tags: [],
        variants: [{ name: "", values: [{ value: "", image: "", price: "" }] }],
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [freeShipping, setFreeShipping] = useState(false);

    useEffect(() => {
        if (defaultValues) {
            // Transform defaultValues to match the formData structure
            const transformedVariants = defaultValues.variants.map(variant => ({
                name: variant.name,
                values: variant.values.map(val => ({
                    value: val.value,
                    image: val.image,
                    price: val.price
                }))
            }));

            setFreeShipping(defaultValues.freeShipping || false);

            setFormData({
                ...defaultValues,
                slug: defaultValues.slug || "",
                variants: transformedVariants,
                brand: defaultValues.brand?.name || "",
                category: defaultValues.category?._id || "",
                subCategory: defaultValues.subCategory?._id || defaultValues.subCategory || "",
            });

            // Handle images (either URL or File object)
            setImagePreviews(defaultValues.images.map((img) => {
                if (typeof img === 'string') {
                    // If it's a URL, return it as is
                    return img;
                } else if (img instanceof File) {
                    // If it's a File object, create an object URL
                    return URL.createObjectURL(img);
                }
                return null; // Handle other cases if necessary
            }));
        }
    }, [defaultValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Filter out duplicates based on file name
        const newImages = files.filter(
            (file) => !formData.images.some((img) =>
                typeof img === "string" ? false : img.name === file.name
            )
        );

        // Append new images
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));

        // Update image previews
        setImagePreviews((prev) => [
            ...prev,
            ...newImages.map((file) => URL.createObjectURL(file)),
        ]);
    };

    const handleImageRemove = (index) => {
        // Remove both the preview and the actual image
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(imagePreviews);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setImagePreviews(items);

        // Also reorder the actual image files in formData.images
        const newImages = Array.from(formData.images);
        const [reorderedImage] = newImages.splice(result.source.index, 1);
        newImages.splice(result.destination.index, 0, reorderedImage);
        setFormData((prev) => ({ ...prev, images: newImages }));
    };

    const handleVariantChange = (variantIndex, valueIndex, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values[valueIndex][field] = value;
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    };

    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { name: "", values: [{ value: "", image: "" }] }]
        }));
    };

    const removeVariant = (index) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const addVariantValue = (variantIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values.push({ value: "", image: "" });
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
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
        submissionData.append("longDescription", formData.longDescription)
        submissionData.append("price", formData.price);
        submissionData.append("salePrice", formData.salePrice);
        submissionData.append("weight", formData.weight);
        submissionData.append("brand", formData.brand);
        submissionData.append("stock", formData.stock);
        submissionData.append("subCategory", formData.subCategory);
        console.log("Submitting subcategory----------->", formData.subCategory);
        if (formData.slug) {
            submissionData.append("slug", formData.slug);
        }

        // Handle category
        if (formData.category && typeof formData.category === "string") {
            submissionData.append("category", formData.category); // If already a string, pass directly
        } else if (formData.category && formData.category._id) {
            submissionData.append("category", formData.category._id); // Extract _id if it's an object
        } else {
            console.error("Invalid category format received in handleSubmit.");
        }
        // Add tags
        submissionData.append("tags", (formData.tags || []).map(tag => tag.name).join(','));

        // Add variants and their images
        if (JSON.stringify(formData.variants) !== JSON.stringify(defaultValues.variants)) {
            const variantsWithImages = formData.variants.map((variant, variantIndex) => {
                const variantData = {
                    name: variant.name,
                    values: variant.values.map((val, valueIndex) => {
                        const valueData = {
                            value: val.value,
                            price: val.price, // Include price in the variant data
                        };

                        if (val.image && val.image instanceof File) {
                            submissionData.append(`variantImages`, val.image, `${variant.name}-${val.value}-${val.image.name}`);
                            valueData.image = val.image.name;
                        } else if (typeof val.image === 'string') {
                            valueData.image = val.image;
                        }

                        return valueData;
                    })
                };

                return variantData;
            });
            submissionData.append("variants", JSON.stringify(variantsWithImages));
        }

        // Add new images
        formData.images.forEach((image) => {
            if (image instanceof File) {
                submissionData.append("images", image);
            }
        });

        // Add existing image references as JSON
        const existingImageUrls = formData.images.filter((image) => typeof image === "string");
        submissionData.append("existingImages", JSON.stringify(existingImageUrls));

        // Add freeShipping value
        submissionData.append("freeShipping", freeShipping);

        // Debug: Log freeShipping and all FormData entries
        // console.log("[EditProductForm] freeShipping value:", freeShipping);
        for (let pair of submissionData.entries()) {
            console.log(`[EditProductForm] FormData: ${pair[0]} =`, pair[1]);
        }

        onSubmit(submissionData);
        setTimeout(() => {
            resetForm();
        }, 7000);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            description: "",
            longDescription: "",
            weight: "",
            images: [],
            category: "",
            subcategory: "",
            price: "",
            salePrice: "",
            brand: "",
            stock: "",
            tags: [],
            variants: [{ name: "", values: [{ value: "", image: "" }] }],
        });

        // Revoke image URLs to free memory
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedHTML = clipboardData.getData("text/html");
        const plainText = clipboardData.getData("text/plain");

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();

        if (pastedHTML) {
            quill.clipboard.dangerouslyPasteHTML(range.index, pastedHTML.trim());
        } else if (plainText) {
            quill.clipboard.dangerouslyPasteHTML(range.index, plainText.replace(/\n/g, "<br>"));
        }
    };


    const handleDescriptionChange = (value) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handleLongDescriptionChange = (value) => {
        setFormData((prev) => ({ ...prev, longDescription: value }));
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

            {/* Slug */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-main">Slug (Optional)</label>
                <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="Auto-generated if left empty"
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-main">Description</label>
                <div className="h-56 ">
                    <ReactQuill
                        value={formData.description}
                        onChange={handleDescriptionChange}
                        className="flex-1 h-36 md:h-[10rem]"
                        modules={{
                            toolbar: [
                                [{ 'font': [] }],
                                [{ 'size': ['small', false, 'large', 'huge'] }],
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ],
                        }}
                        onPaste={handlePaste}
                    />
                </div>
            </div>

            {/* Long Description */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-main">Long Description</label>
                <div className="h-80">
                    <ReactQuill
                        value={formData.longDescription}
                        onChange={handleLongDescriptionChange}
                        className="flex-1 h-[16rem] md:h-[18rem]"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ],
                        }}
                        onPaste={handlePaste}
                    />
                </div>
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

            <div className="mb-4">
                <label className="block font-medium mb-2">Brand</label>
                <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                    <option value="">{defaultValues?.brand.name}</option>
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
                    <option value="">{defaultValues?.category.name}</option>
                    {categories?.map((category, index) => (
                        <option key={index} value={category?._id}>{category?.name}</option>
                    ))}
                </select>
            </div>

            {/* sub Category */}
            <div className="mb-4">
                <label className="block font-medium mb-2">subCategory</label>
                <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                    <option value="">{defaultValues?.subCategory?.name}</option>
                    {subCategories?.map((sub, index) => (
                        <option key={index} value={sub?._id}>{sub?.name}</option>
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
            <div className="mb-6">
                <label className="block font-semibold text-lg mb-4">Product Variants</label>

                {formData.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="border border-gray-300 bg-white shadow-sm p-4 rounded-lg mb-6">
                        <input
                            type="text"
                            placeholder="Variant name (e.g. Color, Size)"
                            value={variant.name}
                            onChange={(e) => {
                                const updatedVariants = [...formData.variants];
                                updatedVariants[variantIndex].name = e.target.value;
                                setFormData((prev) => ({ ...prev, variants: updatedVariants }));
                            }}
                            className="w-full border border-gray-300 font-semibold px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 mb-4"
                        />

                        {variant.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Value (e.g. Red, Large)"
                                        value={value.value || ""}
                                        onChange={(e) => handleVariantChange(variantIndex, valueIndex, "value", e.target.value)}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={value.price || ""}
                                        onChange={(e) => handleVariantChange(variantIndex, valueIndex, "price", e.target.value)}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block font-medium mb-1">Variant Image</label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const updatedVariants = [...formData.variants];
                                                updatedVariants[variantIndex].values[valueIndex].image = file;
                                                setFormData((prev) => ({ ...prev, variants: updatedVariants }));
                                            }
                                        }}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    {value.image && (
                                        <div className="mt-3">
                                            <img
                                                src={value.image instanceof File ? URL.createObjectURL(value.image) : value.image}
                                                alt="Variant Preview"
                                                className="w-24 h-24 object-cover rounded-md border"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-2 space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => addVariantValue(variantIndex)}
                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        <IoAddCircle /> Add Value
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        <IoTrash /> Remove Value
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                <IoTrash /> Remove Variant
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-base"
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
                <div className="flex flex-wrap gap-2 mt-4">
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(provided) => (
                                <div
                                    className="flex flex-wrap gap-2"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {imagePreviews.map((preview, index) => (
                                        <Draggable key={preview} draggableId={preview} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="relative w-24 h-24 rounded-md overflow-hidden"
                                                >
                                                    <img
                                                        src={preview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleImageRemove(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                                                    >
                                                        <IoTrash />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
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

export default EditProductForm;