import React from 'react';
import "../styles/Loader.css"

export const Loader = () => {
    return (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      );
    };
    
export const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader-container">
      <div className="skeleton-loader"></div>
      <div className="skeleton-loader"></div>
      <div className="skeleton-loader"></div>
    </div>
  );
}