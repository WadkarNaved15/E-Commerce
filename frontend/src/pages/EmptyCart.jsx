import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart/EmptyCart.css';

const EmptyCartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-cart-page">
      <h1>Your Cart is Empty</h1>
      <p>Looks like you haven't added anything to your cart yet.</p>
      <button onClick={() => navigate('/')}>Continue Shopping</button>
    </div>
  );
};

export default EmptyCartPage;
