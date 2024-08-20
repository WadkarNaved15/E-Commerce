import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './redux/store.js'
import './index.css'
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(


    <Provider store={store}>
      <Toaster position="top-center" reverseOrder={true} />
    <App />
    
    </Provider>

  
)
