// src/components/Login.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import '../../styles/Home/Login.css';
import { sendOtp, verifyOtp, logout } from '../../redux/thunks/User';
import { loginSuccess } from '../../redux/reducers/UserReducer';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [isSignUp, setIsSignUp] = useState(false);
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef([]);
  const timerRef = useRef();

  const { loading, isLoggedIn, isOtpSent } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0 && isOtpSent) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      clearTimeout(timerRef.current);
    }
  }, [timer, isOtpSent]);

  useEffect(() => {
    const storedIsLoggedIn = Cookies.get('isLoggedIn');
    if (storedIsLoggedIn) {
      dispatch(loginSuccess());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const payload = isSignUp ? { phoneNumber, isSignUp, firstName, lastName } : { phoneNumber, isSignUp };
    dispatch(sendOtp(payload));
  };

  const handleResendOtp = () => {
    const payload = isSignUp ? { phoneNumber, isSignUp, firstName, lastName } : { phoneNumber, isSignUp };
    dispatch(sendOtp(payload));
    setTimer(60);
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = value;

        if (value && index < otpRefs.current.length - 1) {
          otpRefs.current[index + 1].focus();
        }

        if (index === otpRefs.current.length - 1 && value) {
          setTimeout(() => {
            handleOtpSubmit(newOtp);
          }, 100);
        }

        return newOtp;
      });
    } else if (e.nativeEvent.inputType === 'deleteContentBackward') {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = '';
        
        if (index > 0) {
          otpRefs.current[index - 1].focus();
        }
        
        return newOtp;
      });
    }
  };

  const handleOtpSubmit = (currentOtp) => {
    const otpValue = currentOtp.join('');
    const payload = {
      phoneNumber,
      isSignUp,
      firstName,
      lastName,
      otp: otpValue,
    };
    dispatch(verifyOtp(payload));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="container">
      <div className="login-image-container">
        <div className="login-image"></div>
      </div>
      <div className="login-form-container">
        {isLoggedIn ? (
          <div>
            <h2>Welcome</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
            {!isOtpSent ? (
              <form onSubmit={handlePhoneSubmit}>
                {isSignUp && (
                  <>
                    <div className="input-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="input-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={(e) => { e.preventDefault(); handleOtpSubmit(otp); }}>
                  <div className="otp-input-group">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        maxLength="1"
                        required
                      />
                    ))}
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
                <div className="resend-otp-container">
                  {timer > 0 ? (
                    <p>Resend OTP in {timer}s</p>
                  ) : (
                    <button onClick={handleResendOtp} disabled={loading}>
                      {loading ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </>
            )}
            <div className="toggle-container">
              <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Login' : 'New user? Sign Up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
