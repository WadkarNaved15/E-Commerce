import React from 'react';
import { useNavigate } from 'react-router';
import '../../styles/Home/CategoryCard.css';

const CategoryCard = ({ category }) => {
    const server = import.meta.env.VITE_SERVER
    const navigate = useNavigate();

    return (
        <div onClick={()=> navigate(`/display/${category.name}`)} className="category-card">
            <div className="category-img">
                <img src={`${server}/${category.Image.url}`} alt={category.Image.alt_text} />
            </div>
            <h4>{category.name}</h4>
        </div>
    );
};

export default CategoryCard;
