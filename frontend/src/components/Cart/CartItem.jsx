import React, { useEffect, useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import Star from '../Product/Star';
import '../../styles/Cart/CartItem.css';
import { encryptData, decryptData } from '../../utils/Encryption';
import apiClient from '../../utils/apiClient';
import { getCartFromLocalStorage, setCartToLocalStorage } from '../../utils/localStorage';

const CartItem = ({ item, setCart, isLoggedIn }) => {
  const server = import.meta.env.VITE_SERVER;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = item.product;

  useEffect(() => {
    if (product?.error) {
      toast.error('Cannot get the product');
    }
  }, [product]);

  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantity = async (newQuantity) => {
    if (isLoggedIn) {
      try {
        const encryptedData = encryptData(JSON.stringify({
          product: item.product._id,
          quantity: newQuantity
        }));
        const encryptedResponse = await apiClient.put('/cart/update', { encryptedData });
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const parsedData = JSON.parse(decryptedResponse);
        if (encryptedResponse.data.success) {
          setCart(parsedData.items);
          setQuantity(newQuantity); // Update local state with new quantity
        } else {
          console.error('Failed to update cart:', encryptedResponse.data.error);
        }
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      try {
        let cart = getCartFromLocalStorage();
        cart.items = cart.items.map(cartItem => {
          if (cartItem.product._id === item.product._id) {
            return { ...cartItem, quantity: newQuantity };
          }
          return cartItem;
        });

        setCartToLocalStorage(cart);
        setCart(cart.items);
        setQuantity(newQuantity);
      } catch (error) {
        console.error('Error updating cart in local storage:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (isLoggedIn) {
      try {
        const encryptedData = encryptData(JSON.stringify({
          product: item.product._id,
        }));
        const encryptedResponse = await apiClient.delete('/cart', {
          headers: {
            'Content-Type': 'application/json',
          },
          data: { encryptedData }
        });
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const parsedData = JSON.parse(decryptedResponse);

        if (encryptedResponse.data.success) {
          if(parsedData.items.length == 0) navigate('/empty-cart');
          setCart(parsedData.items);

        } else {
          console.error('Failed to delete cart item:', encryptedResponse.data.error);
        }
      } catch (error) {
        console.error('Error deleting cart item:', error);
      }
    } else {
      try {
        let cart = getCartFromLocalStorage();
        cart.items = cart.items.filter(cartItem => cartItem.product._id !== item.product._id);

        setCartToLocalStorage(cart);
        setCart(cart.items);
      } catch (error) {
        console.error('Error deleting cart item from local storage:', error);
      }
    }
  };



  const decreaseQuantity = () => {
    const newQuantity = Math.max(quantity - 1, 1);
    updateQuantity(newQuantity);
  };

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    updateQuantity(newQuantity);
  };

  return (
    <div className="cart-item">
      <div className="cart-img-container">
        <img className="cart-img" src={`${server}/${product.images?.[0]?.url ?? ''}`} alt="product" />
      </div>
      <div className="cart-details">
        <p onClick={() => navigate(`/product/${product._id}`)} className="cart-title">{product.name}</p>
        <p>{product.brand}</p>
        <div className="product-review">
          {/* <Star star={product.rating} /><p>{product.noRating} Ratings</p> */}
        </div>
        <div className="quantity">
          <FaMinus disabled={quantity === 1} className="quantity-min" onClick={decreaseQuantity} />
          <span>{quantity}</span>
          <FaPlus className="quantity-plus" onClick={increaseQuantity} />
        </div>
        <div className="stars">
          <Star star={product.rating} />
        </div>
        <div className="new-cart-display-price">
          <em>RS.{product.display_price}</em>
          <h5>RS.{product.price}</h5>
        </div>
        <button onClick={handleDelete}>Remove</button>
      </div>
      <div className="cart-display-price">
        <em>RS.{product.display_price }</em>
        <h5>RS.{product.price }</h5>
      </div>
    </div>
  );
};

export default CartItem;
