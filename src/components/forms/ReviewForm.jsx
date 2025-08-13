import React, { useEffect, useState, useRef } from "react";
import { createProductReview, getReviewsBySlug } from "../../functions/product";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { decode } from "he";

const ReviewForm = ({ slug, product }) => {
  const location = useLocation();
  const navigateTo = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    review: "",
    rating: 0,
  });
  const [selectedTab, setSelectedTab] = useState("specifications");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewedReviewImage, setPreviewedReviewImage] = useState({ reviewId: null, imgIdx: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRatingChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      rating: value,
    }));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await getReviewsBySlug(slug);
      setReviews(response?.reviews || []);
    } catch (error) {
      console.log("Error in fetching reviews", error);
    }
  };

  const calculateRatingSummary = () => {
    const summary = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      summary[review.rating]++;
    });
    return summary;
  };

  const handleImageChange = (e) => {
    let files = Array.from(e.target.files);
    // Prevent selecting more than 5 in total
    if (imageFiles.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      files = files.slice(0, 5 - imageFiles.length);
    }
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    setImagePreviews([
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    // Reset input value so same file can be selected again if removed
    e.target.value = null;
  };

  const handleRemoveImage = (idx) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleChooseImages = () => {
    if (imageFiles.length >= 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a review.");
      navigateTo("/login", { state: { from: location.pathname } });
      return;
    }

    if (!formData.email || !formData.review || !formData.rating) {
      toast.error("Please fill out all fields before submitting your review.");
      return;
    }

    const reviewerId = user._id;
    const submissionData = new FormData();
    submissionData.append("email", formData.email);
    submissionData.append("reviewText", formData.review);
    submissionData.append("rating", formData.rating);
    imageFiles.forEach((file) => submissionData.append("images", file));

    try {
      setLoading(true);
      const response = await createProductReview(
        slug,
        reviewerId,
        submissionData
      );
      toast.success(
        `Your review has been submitted! We appreciate your feedback on ${product?.title}.`,
        { autoClose: 6000 }
      );
      setLoading(false);
      setFormData({ review: "", email: user?.email, rating: 0 });
      setImageFiles([]);
      setImagePreviews([]);
      fetchReviews();
    } catch (error) {
      setLoading(false);
      console.error("Error in submitting review:", error);
      toast.error(
        error?.response?.data?.message || "Error in submitting review"
      );
    }
  };

  // Specifications prefer product.description; fallback to longDescription
  const specsHTML = decode(
    (product?.description ?? product?.longDescription ?? "").toString()
  );
  // Description uses longDescription only
  const descHTML = decode((product?.longDescription ?? "").toString());
  const ratingSummary = calculateRatingSummary();

  return (
    <div className="max-w-screen-xl px-4 py-4 mx-auto md:px-6 lg:px-16 md:py-6 lg:py-2">
      {/* Tab Navigation */}
      <div className="flex gap-5 md:gap-7 mb-6">
        <button
          className={`text-lg font-semibold ${
            selectedTab === "specifications"
              ? "text-gray-900 border-b-2 font-space border-gray-900"
              : "text-secondary font-space"
          }`}
          onClick={() => setSelectedTab("specifications")}
        >
          Specifications
        </button>
        <button
          className={`text-lg font-semibold ${
            selectedTab === "description"
              ? "text-gray-900 border-b-2 font-space border-gray-900"
              : "text-secondary font-space"
          }`}
          onClick={() => setSelectedTab("description")}
        >
          Description
        </button>
        <button
          className={`text-lg font-semibold ${
            selectedTab === "reviews"
              ? "text-gray-900 border-b-2 font-space border-gray-900"
              : "text-secondary font-space"
          }`}
          onClick={() => setSelectedTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === "specifications" ? (
        <div
          className="text-black font-space"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(specsHTML) }}
        />
      ) : selectedTab === "description" ? (
        <div
          className="text-black font-space"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(descHTML) }}
        />
      ) : (
        <div className="w-full">
          {/* Reviews Header: stars + average + count */}
          <div className="flex items-center gap-3 mb-5">
            {/* Stars */}
            <div className="flex items-center">
              {(() => {
                const rating = Number(product?.averageRating || 0);
                const max = 5;
                const full = Math.floor(rating);
                const half = rating % 1 >= 0.5 ? 1 : 0;
                const empty = max - full - half;
                const stars = [];
                for (let i = 0; i < full; i++) {
                  stars.push(
                    <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  );
                }
                if (half) {
                  stars.push(
                    <svg key="half" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20">
                      <defs>
                        <linearGradient id="halfGrad" x1="0" x2="1">
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="50%" stopColor="#e5e7eb" />
                        </linearGradient>
                      </defs>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="url(#halfGrad)" />
                    </svg>
                  );
                }
                for (let i = 0; i < empty; i++) {
                  stars.push(
                    <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.401 8.17L12 18.896l-7.335 3.272 1.401-8.17L.132 9.211l8.2-1.193z" />
                    </svg>
                  );
                }
                return stars;
              })()}
            </div>
            <span className="text-base font-semibold text-gray-800">{Number(product?.averageRating || 0).toFixed(1)}</span>
            <span className="text-base font-bold text-gray-400">|</span>
            <span className="text-base font-semibold text-gray-800">{product?.reviews?.length || 0} Reviews</span>
          </div>

          {/* Rating Summary */}
          <div className="mb-6">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-4 mb-3">
                {/* Star Icons */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 ${
                        index < star ? "text-yellow-500" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                    </svg>
                  ))}
                </div>
                {/* Gray Line (Bar Chart) */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{
                      width: `${(ratingSummary[star] / reviews.length) * 100}%`,
                    }}
                  ></div>
                </div>
                {/* Review Count */}
                <span className="text-sm text-gray-600">
                  {ratingSummary[star]}
                </span>
              </div>
            ))}
          </div>

          {/* Reviews List */}
          {!reviews || reviews.length === 0 ? (
            <p>No reviews yet. Be the first to leave review.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="flex items-start gap-4 pb-6 mb-6 border-b"
              >
                <img
                  src={"/user.jpg"}
                  alt={review.reviewerId.username}
                  className="object-cover w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.reviewerId.username}
                  </h3>
                  <div className="mt-2">
                    <p className="text-gray-800">{review.reviewText}</p>
                  </div>
                  {/* Rating display */}
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 ${
                          index < review?.rating
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                      </svg>
                    ))}
                  </div>
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Review"
                            className="w-24 h-24 object-cover rounded cursor-zoom-in transition hover:scale-105"
                            onClick={() => {
                              if (
                                previewedReviewImage.reviewId === review._id &&
                                previewedReviewImage.imgIdx === idx
                              ) {
                                setPreviewedReviewImage({ reviewId: null, imgIdx: null });
                              } else {
                                setPreviewedReviewImage({ reviewId: review._id, imgIdx: idx });
                              }
                            }}
                            title="Click to preview"
                          />
                        ))}
                      </div>
                      {/* Full Preview Below Thumbnails */}
                      {previewedReviewImage.reviewId === review._id &&
                        previewedReviewImage.imgIdx !== null && (
                          <div className="flex justify-center mt-3">
                            <img
                              src={review.images[previewedReviewImage.imgIdx]}
                              alt="Full Preview"
                              className="max-w-md w-full h-auto max-h-96 rounded shadow-lg border-2 border-gray-200 cursor-zoom-out transition duration-200"
                              style={{ objectFit: 'contain' }}
                              onClick={() => setPreviewedReviewImage({ reviewId: null, imgIdx: null })}
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Review Form - Now inside reviews tab and full width */}
          <div className="w-full p-4 mt-8 rounded-lg shadow-lg  bg-gray-50 md:p-6">
            <h2 className="mb-6 text-3xl font-semibold text-center text-gray-900 font-space">
              Leave Review
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-100"
                  placeholder="Your Email"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="review"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Review
                </label>
                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-100"
                  placeholder="Write your review"
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="rating"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-6 h-6 cursor-pointer ${
                        formData.rating > index
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onClick={() => handleRatingChange(index + 1)}
                    >
                      <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                    </svg>
                  ))}
                </div>
              </div>
              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Upload Images (max 5)
                </label>
                <button
                  type="button"
                  onClick={handleChooseImages}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Choose Images
                </button>
                <span className="ml-2 text-sm text-gray-600">
                  {imageFiles.length} / 5 selected
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 group-hover:scale-110 transition"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  You can select up to 5 images. Click an image's × to remove it
                  before submitting.
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-primary rounded-lg bg-secondary/80 hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
