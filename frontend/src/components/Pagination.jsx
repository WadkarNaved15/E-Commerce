import React from "react";
import "../styles/Pagination.css";

const Pagination = ({ page, setPage, totalPages }) => {
  // Convert totalPages to a number
  const numericTotalPages = Number(totalPages);

  // Ensure totalPages is a valid number and greater than 0
  if (isNaN(numericTotalPages) || numericTotalPages <= 0) {
    return null; // Or handle the error as you see fit
  }
  return (
    <div className="table-pagination">
      <button
        onClick={() => setPage(0)}
        disabled={page === 0}
      >
        {`<<`}
      </button>
      <button
        onClick={() => {
          if (page > 0) {
            setPage((prev) => prev - 1);
          }
        }}
        disabled={page === 0}
      >
        Prev
      </button>
      <span>{`${page + 1} of ${numericTotalPages}`}</span>
      <button
        onClick={() => {
          if (page < numericTotalPages - 1) {
            setPage((prev) => prev + 1);
          }
        }}
        disabled={page >= numericTotalPages - 1}
      >
        Next
      </button>
      <button
        onClick={() => setPage(numericTotalPages - 1)}
        disabled={page >= numericTotalPages - 1}
      >
        {`>>`}
      </button>
    </div>
  );
};

export default Pagination;
