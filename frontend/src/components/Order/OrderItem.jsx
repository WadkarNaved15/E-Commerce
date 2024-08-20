import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import '../../styles/Order/OrderItem.css';
import apiClient from '../../utils/apiClient';
import { encryptData, decryptData } from '../../utils/Encryption';

const OrderItem = ({ product, quantity, isLoggedIn, updateCart, buyNow = false, updateBuyNowProduct }) => {
  const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const [itemQuantity, setItemQuantity] = useState(quantity);

  const updateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;

    setItemQuantity(newQuantity);

    if (!buyNow && isLoggedIn) {
      try {
        const encryptedData = encryptData(JSON.stringify({
          product: product._id,
          quantity: newQuantity
        }));
        const response = await apiClient.put('/cart/update', { encryptedData });
        const decryptedResponse = decryptData(response.data.data);
        const parsedData = JSON.parse(decryptedResponse);

        if (response.data.success) {
          updateCart(parsedData.items);
        } else {
          console.error('Failed to update cart:', response.data.error);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else if (buyNow) {
      updateBuyNowProduct({ ...product, quantity: newQuantity });
    }
  };

  const handleRemove = async () => {
    if (!buyNow && isLoggedIn) {
      try {
        const encryptedData = encryptData(JSON.stringify({ product: product._id }));
        const response = await apiClient.delete('/cart', { data: { encryptedData } });
        const decryptedResponse = decryptData(response.data.data);
        const parsedData = JSON.parse(decryptedResponse);

        if (response.data.success) {
          updateCart(parsedData.items);
        } else {
          console.error('Failed to remove item:', response.data.error);
        }
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  return (
    <div className="order-item">
      <div className="order-img-container">
        <img className="order-img" src={`${server}/${product.images?.[0]?.url ?? ''}`} alt="product" />
      </div>
      <div className="order-details">
        <p onClick={() => navigate(`/product/${product._id}`)} className="order-title">{product.name}</p>
        <p>{product.brand}</p>
        <div className="order-quantity">
          <FaMinus className="quantity-min" onClick={() => updateQuantity(itemQuantity - 1)} disabled={itemQuantity === 1} />
          <span>{itemQuantity}</span>
          <FaPlus className="quantity-plus" onClick={() => updateQuantity(itemQuantity + 1)} />
          {!buyNow && <button className="remove-icon" onClick={handleRemove}>Remove</button>}
        </div>
      </div>
      <div className="order-total-price">
        <h5>RS.{product.price * itemQuantity}</h5>
      </div>
    </div>
  );
};

export default OrderItem;
