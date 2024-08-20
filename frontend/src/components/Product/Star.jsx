import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "../../styles/Product/Star.css";

const Star = ({ star }) => {
  if (star == 0) {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <FaRegStar key={`empty-${index}`} className="star-icon" />
        ))}
      </div>
    );
  }

  const fullStars = Math.floor(star);
  const halfStar = star - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={`full-${index}`} className="star-icon" />
      ))}
      {halfStar && <FaStarHalfAlt className="star-icon" />}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={`empty-${index}`} className="star-icon" />
      ))}
    </div>
  );
}

export default Star;
