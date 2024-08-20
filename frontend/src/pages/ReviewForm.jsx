// src/components/Review/ReviewForm.js
import React, { useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';
import {useNavigate, useLocation } from 'react-router-dom';
import { encryptData, decryptData } from '../utils/Encryption';
import "../styles/Review/ReviewForm.css";

const ReviewForm = () => {
    const server = import.meta.env.VITE_SERVER;
    const navigate = useNavigate();
    const location = useLocation();
    const { product_id } = location.state || {};
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] });
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReview(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewReview(prevState => ({
            ...prevState,
            images: files,
        }));

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('product_id', product_id);
        formData.append('rating', newReview.rating);
        formData.append('comment', newReview.comment);
        newReview.images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            const response = await apiClient.post(`${server}/review/new`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                toast.success('Review submitted successfully');
                setNewReview({ rating: 5, comment: '', images: [] });
                setImagePreviews([]);
                navigate('/Profile',{state:"myOrders"});
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    if(!product_id) return null;
    return (
        <div className="comment-form">
            <h3>Write a review</h3>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="rating">Rating:</label>
                    <input
                        type="number"
                        id="rating"
                        name="rating"
                        value={newReview.rating}
                        onChange={handleInputChange}
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="Enter rating (0 to 5)"
                    />
                </div>
                <div>
                    <label htmlFor="comment">Comment:</label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={newReview.comment}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="images">Upload Images:</label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                    />
                </div>
                <div className="image-previews">
                    {imagePreviews.map((src, index) => (
                        <img key={index} src={src} alt={`preview-${index}`} />
                    ))}
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default ReviewForm;
