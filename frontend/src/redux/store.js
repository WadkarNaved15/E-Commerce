import { configureStore } from '@reduxjs/toolkit';
import { productAPI } from './api/productAPI';
import { categoriesAPI } from './api/categoriesAPI';
import { cartAPI } from './api/cartAPI';
import userReducer from './reducers/UserReducer'; // Ensure default export

export const store = configureStore({
    reducer: {
        [productAPI.reducerPath]: productAPI.reducer,
        [categoriesAPI.reducerPath]: categoriesAPI.reducer,
        [cartAPI.reducerPath]: cartAPI.reducer,
        user: userReducer, // Use 'user' as the key for userReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(productAPI.middleware, categoriesAPI.middleware, cartAPI.middleware),
});
