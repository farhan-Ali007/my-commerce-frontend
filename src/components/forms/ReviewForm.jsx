import React, { useEffect, useState } from 'react';
import { createProductReview, getReviewsBySlug } from '../../functions/product';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const ReviewForm = ({ slug, product }) => {
    const location = useLocation()
    const navigateTo = useNavigate()
    const { user } = useSelector((state) => state.auth);
    const [reviews, setReviews] = useState([]);
    const [formData, setFormData] = useState({
        email: user?.email || "",
        review: "",
        rating: 0,
    });
    const [selectedTab, setSelectedTab] = useState('description');

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

    useEffect(() => { fetchReviews() }, []);

    const fetchReviews = async () => {
        try {
            const response = await getReviewsBySlug(slug);
            // console.log("Reviews----->", response);
            setReviews(response?.reviews || []);
        } catch (error) {
            console.log("Error in fetching reviews", error);
        }
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
            navigateTo("/login", { state: { from: location.pathname } });
            return;
        }
    
        const reviewerId = user._id;
    
        const reviewData = {
            email: formData.email,
            reviewText: formData.review,
            rating: formData.rating,
        };
    
        try {
            const response = await createProductReview(slug, reviewerId, reviewData);

            toast.success(
                `Your review has been submitted! We appreciate your feedback on ${product?.title}.`,
                {
                    autoClose: 6000,
                }
            );
    
            setFormData({ review: "", email: user?.email, rating: 0 });
            fetchReviews();
        } catch (error) {
            console.error("Error in submitting review:", error);
            toast.error(error?.response?.data?.message || "Error in submitting review");
        }
    };
    

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Reviews List Section */}
                <div className="w-full md:w-1/2 lg:w-2/3">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                        <button
                            className={`text-lg font-semibold ${selectedTab === 'description' ? 'text-gray-900 border-b-2 font-space border-gray-900' : 'text-gray-500 font-space'}`}
                            onClick={() => setSelectedTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`text-lg font-semibold ${selectedTab === 'reviews' ? 'text-gray-900 border-b-2 font-space border-gray-900' : 'text-gray-500 font-space'}`}
                            onClick={() => setSelectedTab('reviews')}
                        >
                            Reviews
                        </button>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === 'reviews' ? (
                        <>
                            <h2 className="text-2xl md:text-3xl text-main font-poppins font-semibold mb-6">Reviews</h2>
                            {/* Map through the reviews */}
                            {!reviews || reviews.length === 0 ? (
                                <p>No reviews yet.</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="mb-6 flex items-center gap-4 border-b pb-6">
                                        <img
                                            src={"/user.jpg"}
                                            alt={review.reviewerId.username}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{review.reviewerId.username}</h3>
                                            <div className="mt-2">
                                                <p className="text-gray-800">"{review.reviewText}"</p>
                                            </div>
                                            {/* Rating display */}
                                            <div className="flex items-center mt-2">
                                                {[...Array(5)].map((_, index) => (
                                                    <svg
                                                        key={index}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`w-5 h-5 ${index < review?.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                                    >
                                                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    ) : (
                        <div>
                            <h2 className="text-2xl md:text-3xl font-poppins font-semibold text-main mb-6">Product Description</h2>
                            <p className="text-gray-800">{product?.longDescription}</p>
                        </div>
                    )}
                </div>

                {/* Review Form Section */}
                <div className="w-full md:w-1/2 lg:w-1/3 bg-gray-100 p-6 rounded-lg shadow-lg max-h-[550px] overflow-y-auto">
                    <h2 className="text-3xl font-poppins font-semibold  text-gray-900 mb-6">Write a Review</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="w-full px-4 py-2 mt-2 outline-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-100"
                                placeholder="Your Email"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="review" className="block text-sm font-semibold text-gray-700">
                                Review
                            </label>
                            <textarea
                                id="review"
                                name="review"
                                value={formData.review}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-2 mt-2 rounded-lg border outline-none border-gray-300 focus:ring-2 focus:ring-gray-100"
                                placeholder="Write your review"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="rating" className="block text-sm font-semibold text-gray-700">
                                Rating
                            </label>
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, index) => (
                                    <svg
                                        key={index}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-6 h-6 cursor-pointer ${formData.rating > index ? 'text-yellow-500' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        onClick={() => handleRatingChange(index + 1)}
                                    >
                                        <path d="M10 15l-5.878 3.09 1.125-6.529L.824 6.82l6.58-.953L10 .5l2.516 5.367 6.58.953-4.423 4.74 1.125 6.529L10 15z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-main opacity-60 hover:opacity-80 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewForm;