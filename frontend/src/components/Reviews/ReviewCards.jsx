import React ,{useEffect, useState} from 'react'
import ReviewCard from './ReviewCard'
import '../../styles/Review/ReviewCards.css'

const ReviewCards = ({reviews , onDeleteReview }) => {

  return (
    <div className="review-cards">
        {reviews.map((review, index) => (
                <ReviewCard key={index} review={review} onDeleteReview={onDeleteReview}/>
            ))}
    </div>
  )
}

export default ReviewCards