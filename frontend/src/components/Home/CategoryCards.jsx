import React, { useEffect , useState } from 'react';
import CategoryCard from './CategoryCard';
import { usePriceCategoriesQuery, useSimpleCategoriesQuery } from '../../redux/api/categoriesAPI';
import { decryptData } from '../../utils/Encryption';
import '../../styles/Home/CategoryCards.css';
import { SkeletonLoader } from '../Loader';
import axios from 'axios';

const CategoryCards = () => {
    const server = import.meta.env.VITE_SERVER
    const [priceCategories, setPriceCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [simpleCategories, setSimpleCategories] = useState([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const encryptedResponse = await axios.get(`${server}/category/simple`);         
                const decryptedResponse = decryptData(encryptedResponse.data.data);
                const parsedData = JSON.parse(decryptedResponse);
                setSimpleCategories(parsedData);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchPriceCategories = async () => {
            try {
                const encryptedResponse = await axios.get('http://localhost:4000/category/price');
                const decryptedResponse = decryptData(encryptedResponse.data.data);
                const data = JSON.parse(decryptedResponse);
                setPriceCategories(data);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCategories();
        fetchPriceCategories();
    }, []);

    return (
        <div className="category-cards-container">
            <h3>Price Categories</h3>
            {isLoading ? <SkeletonLoader /> :<>
            <div className="category-cards">
                
                {priceCategories.map((category) => (
                    <CategoryCard key={category._id} category={category} />
                ))}
                </div>
                </>
                }
            
            <h3>Category</h3>
            {isLoading ? <SkeletonLoader /> :<>
            <div className="category-cards">
                
                {simpleCategories.map((category) => (
                    <CategoryCard key={category._id} category={category} />
                    
                ))}
                </div>
                </>
                }
            
        </div>
    );
};

export default CategoryCards;
