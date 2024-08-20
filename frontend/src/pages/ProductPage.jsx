import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Product from '../components/Product/Product';
import ReviewList from '../components/Reviews/ReviewList';
import axios from 'axios';
import { encryptData, decryptData } from '../utils/Encryption';
import { Loader } from '../components/Loader';
import ProductCards from '../components/Product/ProductCards';
import apiClient from '../utils/apiClient';

const ProductPage = () => {
    const { name } = useParams();
    const server = import.meta.env.VITE_SERVER;

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductAndRelatedData = async () => {
            try {
                // Fetch product data
                setLoading(true);
                const encryptedData = encryptData(JSON.stringify({ name }));
                const productResponse = await axios.post(`${server}/products/page`, { encryptedData });
                const decryptedProductResponse = decryptData(productResponse.data.data);
                const productData = JSON.parse(decryptedProductResponse);
                setProduct(productData);

                // Fetch reviews data
                const productIdEncrypted = encryptData(JSON.stringify({ product_id: productData._id }));
                const reviewsResponse = await axios.get(`${server}/review`, {
                    params: { product: productIdEncrypted },
                });
                const decryptedReviewsResponse = decryptData(reviewsResponse.data.data);
                const reviewsData = JSON.parse(decryptedReviewsResponse);
                setReviews(reviewsData);

                // Fetch similar products
                const subcategory = productData.subcategory;
                const category = productData.category;

                const similarProductsResponse = await axios.get(`${server}/products/similar`, {
                    params: {
                        subcategory: subcategory ? encryptData(subcategory) : null,
                        category: encryptData(category),
                        limit: 11, // Fetch one extra product to account for the current one
                    },
                });

                const decryptedSimilarProductsResponse = decryptData(similarProductsResponse.data.data);
                const similarProductsData = JSON.parse(decryptedSimilarProductsResponse);

                // Filter out the current product
                const filteredProducts = similarProductsData.filter(prod => prod._id !== productData._id);

                setSimilarProducts(filteredProducts.slice(0, 10)); // Ensure only 10 products are shown

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product and related data:', error);
                setLoading(false);
            }
        };

        fetchProductAndRelatedData();
    }, [name]);

    // Function to handle review deletion
    const deleteReview = async (reviewId) => {
        try {
            const encryptedData = encryptData(JSON.stringify({ review_id: reviewId }));
            await apiClient.delete(`${server}/review`, {
                data: { encryptedData },
            });
            // Update the state to remove the deleted review
            setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };


    if (!product) {
        return <div className="product-page-container-loader">    Product not found</div>;
    }
    if(loading){
        return( 
        <div className="product-page-container">    
            <Loader />
        </div> 
        )
        
    }
    return (
        <div className="product-page-container">
            <Product product={product} />
            <ReviewList reviews={reviews} onDeleteReview={deleteReview} />
            {similarProducts.length > 0 && (
                <ProductCards
                    products={similarProducts}
                    heading={`Similar Products in ${product.subcategory || product.category}`}
                />
            )}
        </div>
    );
};

export default ProductPage;
