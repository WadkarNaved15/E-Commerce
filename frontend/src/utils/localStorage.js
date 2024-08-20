import { encryptData, decryptData } from './Encryption';

// Get cart from local storage
export const getCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    if (!cart) {
      // Create an empty cart if it doesn't exist
      const emptyCart = { items: [] };
      const encryptedCart = encryptData(JSON.stringify(emptyCart));
      localStorage.setItem('cart', encryptedCart);
      return emptyCart;
    }
    // If cart exists, decrypt and parse it
    const decryptedCart = decryptData(cart);
    const cartData = JSON.parse(decryptedCart);
    return cartData;
  } catch (error) {
    console.error("Error getting cart from local storage:", error);
    return { items: [] }; // Return an empty cart in case of an error
  }
};

// Set cart to local storage
export const setCartToLocalStorage = (cart) => {
  try {
    const encryptedCart = encryptData(JSON.stringify(cart));
    localStorage.setItem('cart', encryptedCart);
  } catch (error) {
    console.error("Error setting cart to local storage:", error);
  }
};

// Clear cart from local storage
export const clearCartFromLocalStorage = () => {
  localStorage.removeItem('cart');
};
