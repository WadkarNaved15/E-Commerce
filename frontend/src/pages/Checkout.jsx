import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import "../styles/Checkout.css";
import CartPrice from '../components/Cart/CartPrice';
import { decryptData, encryptData } from '../utils/Encryption';
import OrderItem from '../components/Order/OrderItem';
import { useSelector, useDispatch } from 'react-redux';
import { TiTick } from "react-icons/ti";
import { logout } from '../redux/thunks/User';
import { logout as localLogout } from '../redux/reducers/UserReducer';
import { SiRazorpay } from "react-icons/si";
import { TbTruckDelivery } from "react-icons/tb";
import { Loader } from '../components/Loader';
import toast from 'react-hot-toast';
import ShippingAddress from './ShippingAddress';
import { enc } from 'crypto-js';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);
  const buyNowProduct = location.state?.buyNowProduct;
  const [selectedAddress, setSelectedAddress] = useState('');
  const [buyNowProductState, setBuyNowProductState] = useState(buyNowProduct);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [totals, setTotals] = useState({
    subtotal: 0,
    quantity: 0,
    discount: 0,
    couponDiscount: 0,
    discountedSubtotal: 0,
    tax: 0,
    shippingCharges: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { isLoggedIn } = useSelector((state) => state.user);

  if(!isLoggedIn) navigate('/login');

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const encryptedResponse = await apiClient.get('/user');
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const response = JSON.parse(decryptedResponse);
      setUser(response);
      if (response?.addresses?.length > 0) {
        
        setSelectedAddress(response.addresses[0]._id);
      }else{
        toast.error('Please add an address');
        navigate('/Profile', { state: 'shippingAddress' });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const calculateCheckoutTotals = (cart) => {
    let subtotal = 0;
    let quantity = 0;
    let discount = 0;
    let discountedSubtotal = 0;
    let couponDiscount = 0;
    let tax = 0; // Placeholder for actual tax calculation
    let shippingCharges = 0; // Placeholder for actual shipping calculation
    let total = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.display_price;
      const itemDiscountedPrice = item.product.price;
      const itemQuantity = item.quantity;

      // Calculate subtotal before discount
      subtotal += itemQuantity * itemPrice;

      // Calculate discount
      discount += (itemQuantity * itemPrice) - (itemQuantity * itemDiscountedPrice);

      // Calculate discounted subtotal
      discountedSubtotal += itemQuantity * itemDiscountedPrice;

      // Calculate total quantity
      quantity += itemQuantity;
    });

    // Total calculation
    total = discountedSubtotal + tax + shippingCharges;

    // Set totals state
    setTotals({
      subtotal,
      quantity,
      discount,
      discountedSubtotal,
      couponDiscount,
      tax,
      shippingCharges,
      total,
    });
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const encryptedResponse = await apiClient.get('/cart');
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const response = JSON.parse(decryptedResponse);
      setCart(response.items);
      if(response.items.length === 0) navigate('/empty-cart');
      calculateCheckoutTotals(response.items);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const formatAddress = (address) => {
    return [
      address.address_line1,
      address.landmark,
      address.locality,
      address.city,
      address.state,
    ]
      .filter(Boolean) // Remove empty or undefined values
      .join(", ");
  };

  useEffect(() => {
    fetchUser();
    if (!buyNowProduct) {
      fetchCart();
    }
  }, [buyNowProduct]);

  useEffect(() => {
    if (buyNowProduct) {
      calculateCheckoutTotals([{ product: buyNowProductState, quantity: buyNowProductState?.quantity || 1 }]);
    } else {
      calculateCheckoutTotals(cart);
    }
  }, [cart, buyNowProduct, buyNowProductState]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      dispatch(localLogout());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddressChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const updateTotals = (newTotals) => {
    setTotals(newTotals);
  };
  const handleCheckout = async () => {
    try {
      if (paymentMethod === 'Razorpay') {
        // Create an order with the backend
        const encryptedData = encryptData(JSON.stringify({
          amount: totals.total,
          order_date: new Date(),
          customer: user._id,
          shipping_address: selectedAddress,
          payment_method: paymentMethod,
          items: buyNowProduct
            ? [{ product: buyNowProductState._id, quantity: 1, price: buyNowProductState.price }]
            : cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
              }))
        }));
  
        const response = await apiClient.post('/order/new', { encryptedData });
        const parsedResponse = JSON.parse(decryptData(response.data.data));
        const { orderId, razorpayOrderId } = parsedResponse;
  
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: totals.total * 100, // Convert to paise
          currency: 'INR',
          name: 'Fahad Enterprise',
          description: 'Order Description',
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const encryptedData = encryptData(JSON.stringify({
                order_id: razorpayOrderId,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }))
              const verifyResponse = await apiClient.post('/order/verify', {
                  encryptedData
              });
        
              if (verifyResponse.data.success) {
                const encryptedData = encryptData(JSON.stringify({
                  orderId,
                  paymentId: response.razorpay_payment_id,
                }))
                await apiClient.post('/order/update', {
                  encryptedData
                });
                navigate('/');
              } else {
                console.error('Payment verification failed:', verifyResponse.data.message);
              }
            } catch (error) {
              console.error('Error verifying payment:', error);
            }
          },
          prefill: {
            name: user.first_name + ' ' + user.last_name,
            contact: user.mobile,
          },
          theme: {
            color: '#3399cc',
          },
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else if (paymentMethod === 'COD') {
        // Handle Cash on Delivery logic here
        const encryptedData = encryptData(JSON.stringify({
          amount: totals.total,
          payment_method: 'COD',
          shipping_address: selectedAddress,
          customer: user._id,
          items: buyNowProduct
            ? [{ product: buyNowProductState._id, quantity: 1, price: buyNowProductState.price }]
            : cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
              }))
        }));
  
        await apiClient.post('/order/new', { encryptedData });
        // Navigate back to home after placing the order with COD
        navigate('/');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };
  


  return (
    <div className="checkout-page">
            {isLoading ? (
        <Loader />
      ) : (
        <>
      <div className="checkout-left">
        {/* Step 1: Login */}
        <div className="step">
          <div className="step-heading">
            <div className="step-index">
              <p>1</p>
            </div>
            <div className="step-values">
              <h3>Login {step > 1 && <CheckIcon />}</h3>
              {step === 1 ? (
                <>
                  <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                  <p><strong>Mobile:</strong> {user.mobile}</p>
                  <div className="login-buttons">
                    <button onClick={handleLogout}>Logout & Sign In as New User</button>
                    <button onClick={() => setStep(2)}>Continue</button>
                  </div>
                </>
              ) : (
                <p><strong>{user.first_name} {user.last_name}</strong> +91-{user.mobile}</p>
              )}
            </div>
          </div>
          {step > 1 && <button onClick={() => setStep(1)} className="change-button">Change</button>}
        </div>

        {/* Step 2: Delivery Address */}
        <div className="step">
          <div className="step-heading">
            <div className="step-index">
              <p>2</p>
            </div>
            <div className="step-values">
              <h3>Delivery Address {step > 2 && <CheckIcon />}</h3>
              {step === 2 ? (
                <div className="address-values">
                  {user?.addresses?.map((address) => (
                    <div key={address._id}>
                      <label>
                        <input
                          type="radio"
                          name="address"
                          value={address._id}
                          checked={selectedAddress === address._id}
                          onChange={handleAddressChange}
                        />
                        <strong>
                          {address.name} {address.phoneNumber} {address.alternatePhoneNumber}
                        </strong>{" "}
                        {formatAddress(address)}
                      </label>
                    </div>
                  ))}
                  <button onClick={handleNext}>Deliver Here</button>
                  {/* <ShippingAddress dispalyAddresses={false}/> */}
                </div>
                
              ) : (
                user?.addresses?.[0] && (
                  <p>
                    <strong>
                      {user.addresses[0].name} {user.addresses[0].phoneNumber} {user.addresses[0].alternatePhoneNumber}
                    </strong>{" "}
                    {formatAddress(user.addresses[0])}
                  </p>
                )
              )}
            </div>
            
          </div>
          {step > 2 && <button onClick={() => setStep(2)} className="change-button">Change</button>}
        </div>
        

        {/* Step 3: Order Summary */}
        <div className="step">
          <div className="step-heading">
            <div className="step-index">
              <p>3</p>
            </div>
            <div className="step-values">
              <h3>Order Summary {step > 3 && <CheckIcon />}</h3>
              {step === 3 && (
                <>
                  {buyNowProduct ? (
                    <OrderItem
                      product={buyNowProductState}
                      quantity={buyNowProductState?.quantity || 1}
                      buyNow={true}
                      updateBuyNowProduct={setBuyNowProductState}
                    />
                  ) : (
                    cart.map((item) => (
                      <OrderItem
                        key={item.product._id}
                        product={item.product}
                        quantity={item.quantity}
                        isLoggedIn={isLoggedIn}
                        updateCart={setCart}
                      />
                    ))
                  )}
                  <button onClick={handleNext}>Continue</button>
                  
                </>
              )}
              
            </div>
          </div>
          {step > 3 && <button onClick={() => setStep(3)} className="change-button">Change</button>}
        </div>

        {/* Step 4: Payment Details */}
        <div className="step">
          <div className="step-heading">
            <div className="step-index">
              <p>4</p>
            </div>
            <div className="step-values">
              <h3>Payment Details</h3>
              {step === 4 && (
                <div className="payment-details">
                  <div className="payment-options">
                    <div className="option-razorpay">
                      <label htmlFor="Razorpay">
                        <input
                          type="radio"
                          name="payment"
                          value="Razorpay"
                          checked={paymentMethod === 'Razorpay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <SiRazorpay />
                        Razorpay
                      </label>
                      <label htmlFor="COD">
                        <input
                          type="radio"
                          name="payment"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <TbTruckDelivery />
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                  <button onClick={handleCheckout} className="checkout-button">Proceed to Payment</button>
                </div>
              )}
            </div>
          </div>
          {step > 4 && <button onClick={() => setStep(4)} className="change-button">Change</button>}
        </div>
      </div>

      <div className="checkout-right">
        <CartPrice {...totals} dispalyCoupon={true} updateTotals={updateTotals} />
        <button onClick={handleCheckout} className="checkout-button">Proceed to Payment</button>
      </div>
      </>
      )}
    </div>
  );
};

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"    
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default Checkout;
