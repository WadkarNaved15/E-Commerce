import React from 'react';
import Star from '../Product/Star';
import { useSelector } from 'react-redux';
import { encryptData, decryptData } from '../../utils/Encryption';
import apiClient from '../../utils/apiClient';
import '../../styles/Review/ReviewCard.css';

const ReviewCard = ({ review , onDeleteReview }) => {
    const server = import.meta.env.VITE_SERVER
  const {isAdmin} = useSelector((state) => state.user)
  const { first_name,last_name } = review.user;
  const {rating, comment, images } = review;

  const handleDeleteClick = () => {
    // Pass only the review ID to the delete function
    onDeleteReview(review._id);
};

  return (
    <div className="review-card">
      <div className="review-header">
        <h3>{first_name} {last_name}</h3>      
        <div className="review-rating">
          <Star star={rating} />
          {isAdmin && <button onClick={handleDeleteClick} className="delete-btn">Delete</button>}
        </div>
      </div>
      <p>{comment}</p>
      {images && images.length > 0 && (
        <div className="review-images">
          {images.map((image, index) => (
            <img key={index} src={`${server}/${image.url}`}  alt={`review-img-${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
