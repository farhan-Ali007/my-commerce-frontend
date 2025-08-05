import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { IoIosAdd } from 'react-icons/io';
import { IoAddCircle, IoTrash } from 'react-icons/io5';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadDescriptionImage } from '../../functions/product';

const CreateProductForm = forwardRef(({ buttonText, onSubmit, formTitle, categories, subCategories, tags, brands }, ref) => {
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
        salePrice: "",
        brand: "",
        stock: "",
        tags: [],
        variants: [{ name: "", values: [{ value: "", image: "", price: "" }] }],
        metaDescription: "",
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [freeShipping, setFreeShipping] = useState(false);
    const quillRef = useRef();

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
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
            metaDescription: "",
        });
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
    };

    useImperativeHandle(ref, () => ({
        resetForm: resetForm,
    }));

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
        const newPreviews = newImages.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);
        console.log("New images added:", newImages);
        console.log("New image previews generated:", newPreviews);
    };

    const handleImageRemove = (index) => {
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

    const handleVariantChange = (variantIndex, field, value, valueIndex = null) => {
        const updatedVariants = [...formData.variants];
        if (field === "name") {
            updatedVariants[variantIndex].name = value;
        } else if (field === "value") {
            updatedVariants[variantIndex].values[valueIndex].value = value;
        } else if (field === "image") {
            updatedVariants[variantIndex].values[valueIndex].image = value;
        } else if (field === "price") {
            updatedVariants[variantIndex].values[valueIndex].price = value;
        }
        setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    };

    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { name: "", values: [{ value: "", image: "", price: "" }] }],
        }));
    };

    const addVariantValue = (variantIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[variantIndex].values.push({ value: "", price: "", image: "" });
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

        if (!formData.title) {
            toast.error("Product title is required.");
            return;
        }
        if (!formData.description) {
            toast.error("Product description is required.");
            return;
        }
        if (!formData.price) {
            toast.error("Product price is required.");
            return;
        }
        if (!formData.stock) {
            toast.error("Product stock is required.");
            return;
        }
        if (!formData.category) {
            toast.error("Product category is required.");
            return;
        }
        if (formData.images.length === 0) {
            toast.error("At least one product image is required.");
            return;
        }
        if (!formData.longDescription) {
            toast.error("Product long description is required.");
            return;
        }
        if (!formData.brand) {
            toast.error("Product brand is required.");
            return;
        }
        if (formData.tags.length === 0) {
            toast.error("At least one tag is required.");
            return;
        }

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
        submissionData.append("metaDescription", formData.metaDescription);
        if (formData.slug) {
            submissionData.append("slug", formData.slug);
        }

        // Handle variants
        const validVariants = formData.variants
            .filter(variant => variant.name && variant.values.length > 0)
            .flatMap((variant, variantIndex) =>
                variant.values.map((value, valueIndex) => {
                    const variantData = {
                        name: variant.name,
                        value: value.value,
                        price: value.price
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

    // Custom image handler for Quill (long description)
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    const url = await uploadDescriptionImage(file);
                    const editor = quillRef.current.getEditor();
                    const range = editor.getSelection();
                    editor.insertEmbed(range.index, 'image', url);
                } catch (err) {
                    toast.error('Image upload failed');
                }
            }
        };
    };

    // Memoize modules so it doesn't get recreated on every render
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
            }
        }
    }), []);

    return (
        <form onSubmit={handleSubmit} className="max-w-[600px] md:w-[800px] my-4 mx-auto p-6 bg-white shadow-none md:shadow-md rounded-lg">
            <h2 className="text-2xl text-center font-semibold mb-4 text-primaryondary">{formTitle}</h2>

            {/* Title */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-primaryondary">Title</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Slug (Optional)</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Description</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Long Description</label>
                <div className="mb-2 text-yellow-700 text-xs font-semibold">
                    <span>⚠️</span> Images are uploaded immediately. Please only upload images you intend to keep in the description.
                </div>
                <div className="h-80 mb-20"> {/* Add mb-4 for margin below */}
                    <ReactQuill
                        ref={quillRef}
                        value={formData.longDescription}
                        onChange={handleLongDescriptionChange}
                        className="h-full"
                        modules={modules}
                        onPaste={handlePaste}
                    />
                </div>
            </div>

            {/* Meta Description */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-primaryondary">Meta Description</label>
                <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="Enter a short summary for SEO (max 165 characters)"
                    maxLength={165}
                />
            </div>

            {/* Weight */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-primaryondary">Weight</label>
                <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    placeholder="weight in grams..."
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>

            {/* Brand */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-primaryondary">Brand</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Category</label>
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
                <label className="block font-medium mb-2 text-primaryondary">subCategory</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Tags</label>
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
                        <div key={index} className="flex items-center gap-2 bg-secondary opacity-90 text-primaryte px-4 py-1 rounded-full">
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
                <label className="block font-medium mb-2 text-primaryondary">Price</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Sale Price</label>
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
                <label className="block font-medium mb-3 text-primaryondary">Variants</label>
                {formData.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="border border-gray-200 p-5 mb-4 rounded-lg shadow-sm bg-white">
                        <label className="block font-medium mb-2 text-primaryondary">Variant {variantIndex + 1}</label>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Variant Name (e.g., Color, Size)"
                                value={variant.name}
                                onChange={(e) => handleVariantChange(variantIndex, "name", e.target.value)}
                                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {variant.values.map((value, valueIndex) => (
                            <div key={valueIndex} className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Variant Value (e.g., Red, Large)"
                                        value={value.value}
                                        onChange={(e) => handleVariantChange(variantIndex, "value", e.target.value, valueIndex)}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={value.price}
                                        onChange={(e) => handleVariantChange(variantIndex, "price", e.target.value, valueIndex)}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addVariantValue(variantIndex)}
                                        className="flex items-center justify-center w-10 h-10 bg-gray-400 text-primaryte rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        <IoIosAdd size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                        className="flex items-center justify-center w-10 h-10 text-red rounded-md transition-colors"
                                    >
                                        <IoTrash size={22} className="text-red-600 hover:text-red-800" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="file"
                                        accept="image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                handleVariantChange(variantIndex, "image", file, valueIndex);
                                            }
                                        }}
                                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                {value.image && (
                                    <div className="mt-2">
                                        <img
                                            src={value.image instanceof File ? URL.createObjectURL(value.image) : value.image}
                                            alt="Variant Preview"
                                            className="w-20 h-20 object-cover rounded-md"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="flex justify-between items-center mt-4">
                            <button
                                type="button"
                                onClick={() => removeVariant(variantIndex)}
                                className="flex items-center gap-1 bg-red-500 text-primaryte px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                            >
                                <IoTrash /> Remove Variant
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 bg-blue-500 text-primaryte px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                    <IoAddCircle /> Add Variant
                </button>
            </div>




            {/* Stock */}
            <div className="mb-4">
                <label className="block font-medium mb-2 text-primaryondary">Stock</label>
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
                <label className="block font-medium mb-2 text-primaryondary">Product Images</label>
                <label
                    htmlFor="fileInput"
                    className="flex justify-center items-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-lg cursor-pointer bg-secondary bg-opacity-35 hover:bg-opacity-60 transition"
                >
                    <FaCloudUploadAlt className="text-gray-600 text-xl" />
                    <span className="text-gray-700 font-medium">Upload Images (only webp)</span>
                </label>
                <input
                    type="file"
                    multiple
                    accept="image/webp"
                    id="fileInput"
                    className="hidden"
                    onChange={handleImageChange}
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
                                                        className="absolute top-1 right-1 bg-red-500 text-primaryte rounded-full p-1 text-xs"
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
                <label className="block font-medium mb-2 text-primaryondary">
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
                    className="bg-secondary opacity-70 hover:opacity-90 w-full text-primaryte px-8 py-2 rounded-md"
                >
                    {buttonText}
                </button>
            </div>
        </form>
    );
});

export default CreateProductForm;
