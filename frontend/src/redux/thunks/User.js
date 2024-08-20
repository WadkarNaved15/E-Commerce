import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCartFromLocalStorage } from '../../utils/localStorage';
import { encryptData , decryptData } from '../../utils/Encryption';


// Setup axios to include credentials
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  withCredentials: true, // This ensures cookies are included in requests
});

export const sendOtp = createAsyncThunk('user/sendOtp', async (payload, { rejectWithValue }) => {
  try {
    await axiosInstance.post('/login/send-otp', payload);
    toast.success('OTP sent successfully!');
    return payload;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const verifyOtp = createAsyncThunk('user/verifyOtp', async (payload, { rejectWithValue, dispatch }) => {
  try {
    // Verify OTP
    const response = await axiosInstance.post('/login/verify-otp', payload);
    
    if (response.data.success) {
      toast.success(payload.isSignUp ? 'User created successfully!' : 'OTP verified successfully!');

        const localCart = getCartFromLocalStorage();
        if (localCart.items.length > 0) {
          const encryptedCart = encryptData(JSON.stringify(localCart));
          const mergeCartResponse = await axiosInstance.post('/cart/merge', {
            encryptedCart
          });
          console.log(localCart)
          if (mergeCartResponse.data.success) {
            console.log('Local cart merged with user cart successfully!');
            localStorage.removeItem('cart');
          } else {
            toast.error('Failed to merge local cart. Please try again.');
          }
        }
      // Return the user data to update state if needed
      return response.data.user;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const checkAuth = createAsyncThunk('user/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/login/check-auth');
    if (response.data.success) {
      return response.data.user;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to check authentication. Please try again.';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const logout = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.get('/login/logout'); // Call server-side logout endpoint
    return; // No specific return needed
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to logout. Please try again.';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});