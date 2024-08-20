// src/components/Product/ProductCard.js
import React from 'react';
import { BsCart4 } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { encryptData, decryptData } from '../../utils/Encryption';
import apiClient from '../../utils/apiClient';
import { getCartFromLocalStorage, setCartToLocalStorage } from '../../utils/localStorage';
import Star from './Star';
import Cookies from 'js-cookie';
import '../../styles/Product/ProductCard.css';

const ProductCard = ({ product }) => {
  const server = import.meta.env.VITE_SERVER;
  const { isLoggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();

  async function addToCartHandler(event) {
    event.stopPropagation();
  
    if (product.stock <= 0) {
      toast.error('Out of Stock');
      return;
    }
  
    const productData = {
      product: product._id,
      quantity: 1,
    };
  
    const encryptedData = encryptData(JSON.stringify(productData));
  
    try {
      if (isLoggedIn) {
        // Fetch the current cart
        const response = await apiClient.get('/cart');
        const decryptedResponse = decryptData(response.data.data);
        const cart = JSON.parse(decryptedResponse);
  
        const existingItem = cart.items.find(item => item.product._id === product._id);
  
        if (existingItem) {
          existingItem.quantity += 1;
          await apiClient.post('/cart/update', { encryptedData });
        } else {
          await apiClient.post('/cart/add', { encryptedData });
        }
  
        toast.success('Added to cart');
        navigate('/cart');
      } else {
        // Handle cart in local storage
        let cart = getCartFromLocalStorage();
        const existingItem = cart.items.find(item => item.product._id === product._id);
  
        if (existingItem) {
          // Update the quantity of the existing item
          existingItem.quantity += 1;
        } else {
          // Add new item to the cart
          cart.items.push({ product, quantity: 1 });
        }
  
        // Save the updated cart to local storage
        setCartToLocalStorage(cart);
  
        toast.success('Added to cart');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  }
  
  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.name}`)}>
      <div className="image-container">
        <img src={`${server}/${product?.images[0].url}`} alt="" />
      </div>
      <div className="product-card-details">
        <h3>{product?.brand}</h3>
        <p>{product?.name}</p>
        <div className="rating">
          <Star star={product?.rating} />
          <p>{product?.noRating} Ratings</p>
        </div>
        <h4>RS.{product?.price}</h4>
      </div>
      <button onClick={(event) => addToCartHandler(event)}>
        <BsCart4 size={20} /> Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
