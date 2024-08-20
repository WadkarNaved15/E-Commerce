import React from 'react';
import Star from '../Product/Star';
import '../../styles/Review/ReviewSummary.css';


const ReviewSummary = ({ reviews , setReviews, product_id }) => {
    const totalReviews = reviews.length;
    const ratingsCount = [0, 0, 0, 0, 0];

    reviews?.forEach(review => {
        ratingsCount[review.rating - 1]++;
    });

    const averageRating = totalReviews > 0
        ? (ratingsCount.reduce((acc, count, index) => acc + count * (index + 1), 0) / totalReviews).toFixed(1)
        : 0;

    return (
        <div className="review-summary">
            <h2>Customer Reviews</h2>
            {totalReviews > 0 ? (
                <>
                    <div className="average-rating">
                        <span className="average-rating-value">{averageRating} out of 5 </span>
                        <Star star={averageRating} />
                    </div>
                    <div className="total-reviews">{totalReviews} global ratings</div>
                    <div className="rating-breakdown">
                        {ratingsCount.slice().reverse().map((count, index) => (
                            <div key={index} className="rating-bar">
                                <span>{5 - index} star</span>
                                <div className="bar">
                                    <div className="bar-filled" style={{ width: `${(count / totalReviews) * 100}%` }}></div>
                                </div>
                                <span>{((count / totalReviews) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="no-reviews">No reviews yet</div>
            )}
        </div>
    );
};

export default ReviewSummary;
