import React, { useEffect, useState } from 'react';
import CartItem from '../components/Cart/CartItem';
import '../styles/Cart/Cart.css';
import CartPrice from '../components/Cart/CartPrice';
import { Loader } from '../components/Loader';
import { useSelector } from 'react-redux';
import { getCartFromLocalStorage } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { decryptData } from '../utils/Encryption';

const Cart = () => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    quantity: 0,
    discount: 0,
    discountedSubtotal: 0,
    tax: 0,
    shippingCharges: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (isLoggedIn) {
        try {
          const response = await apiClient.get('/cart');
          const decryptedResponse = decryptData(response.data.data);
          const parsedResponse = JSON.parse(decryptedResponse);

          if (parsedResponse.items.length === 0) navigate('/empty-cart'); 
          setCart(parsedResponse.items);
        } catch (error) {
          console.error(error);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        const cartFromLocalStorage = getCartFromLocalStorage();
        if (cartFromLocalStorage.items.length === 0) navigate('/empty-cart'); 
        setCart(cartFromLocalStorage.items || []);
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const calculateTotals = () => {
      let subtotal = 0;
      let quantity = 0;
      let discount = 0;
      let discountedSubtotal = 0;
      let tax = 0;
      let shippingCharges = 0;
      let total = 0;

      cart.forEach((item) => {
        subtotal += item.quantity * item.product.display_price;
        discount += (item.quantity * item.product.display_price) - (item.quantity * item.product.price);
        discountedSubtotal += item.quantity * item.product.price;
        quantity += item.quantity;
      });

      total = subtotal + tax + shippingCharges - discount;

      setTotals({
        subtotal,
        quantity,
        discount,
        discountedSubtotal,
        tax,
        shippingCharges,
        total,
      });
    };

    calculateTotals();
  }, [cart]);



  return (
    <div className="cart">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1>Shopping Cart</h1>
          <div className="cart-container">
            {cart.length === 0 ? (
              <div className="empty-cart">No items in cart</div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <CartItem key={item.product._id} item={item} setCart={setCart} isLoggedIn={isLoggedIn} />
                  ))}
                </div>
                <div className="cart-price-container">
                  <CartPrice
                    quantity={totals.quantity}
                    subtotal={totals.subtotal}
                    discount={totals.discount}
                    discountedSubtotal={totals.discountedSubtotal}
                    tax={totals.tax}
                    shippingCharges={totals.shippingCharges}
                    total={totals.total}
                  />
                  <button onClick={() => navigate('/checkout')}>Checkout</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
