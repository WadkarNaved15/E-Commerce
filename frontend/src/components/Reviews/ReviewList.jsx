// src/components/Review/ReviewList.js
import React, { useState, useEffect } from 'react';
import ReviewCards from '../Reviews/ReviewCards';
import ReviewSummary from './ReviewSummary';
import '../../styles/Review/ReviewList.css';
import axios from 'axios';
import { encryptData, decryptData } from '../../utils/Encryption';

const ReviewList = ({ reviews , onDeleteReview }) => {


    return (
        <div className='review-container'>  
            <ReviewSummary reviews={reviews}/>
            <ReviewCards reviews={reviews} onDeleteReview={onDeleteReview} />
        </div>
    );
};

export default ReviewList;
