import React, { useState, useEffect } from 'react';
import Star from './Star'; 
import { MdOutlineShoppingCart } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { encryptData , decryptData } from '../../utils/Encryption';
import '../../styles/Product/Product.css';
import ReviewList from '../Reviews/ReviewList';
import Header from '../Header';
import {Loader} from "../Loader"

const ProductPage = ({ product }) => {
  const server = import.meta.env.VITE_SERVER;
  const [mainImage, setMainImage] = useState(`${server}/${product.images[0].url}`);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [display, setDisplay] = useState('none');
  const [isFixed, setIsFixed] = useState(true);

  const navigate = useNavigate();

  const handleImageHover = (newImage) => {
    setMainImage(newImage);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setX(x);
    setY(y);
    setDisplay('block');
  };

  const addtoCart = async () => {
    try {
      const userId = localStorage.getItem('auth_id');
      if (!userId) {
        console.error('User ID not found in local storage');
        return;
      }
      if (product.stock <= 0) {
        console.error('Product is out of stock');
        return;
      }
      const response = await axios.post(`${server}/cart/add/${userId}`, {
        product_id: product._id,
        quantity: 1
      });

      if (response.data.success) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const descriptionTop = document.querySelector('.specifications').getBoundingClientRect().top;
      console.log(descriptionTop);
      if (descriptionTop <= 200) {
        setIsFixed(false);
      } else {
        setIsFixed(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDescription = (description) => {
    const sentences = description.split('.').filter(sentence => sentence.trim() !== '');
    return sentences.map((sentence, index) => (
      <li key={index}>{sentence.trim()}.</li>
    ));
  };
  const renderSpecifications = () => (
    <div className="specifications">
      {product.specifications?.map(spec => (
        <div key={spec._id} className="specification">
          <div className="spec-key">{spec.key}</div>
          <div className="spec-value">{spec.value}</div>
        </div>
      ))}
    </div>
  );

  if(!product) return navigate('/')

  return (
    <>
    <Header/>
    <div className="product-page">
      <div className="product-image" style={{
        '--url': `url(${mainImage})`,
        '--zoom-x': `${x}%`,
        '--zoom-y': `${y}%`,
        '--display': display
      }}>
        <div className="image-with-overlay">
          {/* ... */}
        </div>
        <div className={` ${isFixed ? 'stick' : 'unstick'}`}>
          <img
            className="main-product-image"
            onMouseOut={() => setDisplay('none')}
            onMouseMove={handleMouseMove}
            src={mainImage}
            alt="Product"
          />
          <div className="action-buttons">
            <button
              className="add-to-cart-btn"
              onClick={addtoCart}
              disabled={product.stock <= 0}
            >
              <MdOutlineShoppingCart />Add to Cart
            </button>
            <button
              onClick={() => navigate('/checkout', { state: { buyNowProduct: product } })}
              className="buy-now-btn"
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className={`side-product-image ${isFixed ? 'fixed' : 'unfixed'}`}>
        {product?.images?.map((image) => (
          <img
            key={image._id}
            src={`${server}/${image.url}`}
            alt="Product"
            onMouseEnter={() => handleImageHover(`${server}/${image.url.replace(/\\/g, '/')}`)}
          />
        ))}
      </div>
      <div className="product-details">
        <p className="product-title">{product?.name}</p>
        <div className="product-rating">
          {product?.rating ? <Star star={product.rating} /> : null}
        </div>
        <p className="product-category">{product?.category}</p>
        <p className="product-brand">{product?.brand}</p>
        <div className="price">
          <p className="product-price">RS.{product?.price}</p>
          <em className="product-display-price">RS.{product?.display_price}</em>
          <p className="product-discount">
            {((product?.display_price - product?.price) / product?.display_price * 100).toFixed(0)}% off
          </p>
        </div>
        {product.stock <= 0 && (
          <p className="out-of-stock">Out of Stock</p>
        )}
        <div className="new-action-buttons">
          <button onClick={addtoCart} className="add-to-cart-btn" disabled={product.stock <= 0}>
            <MdOutlineShoppingCart />Add to Cart
          </button>
          <button className="buy-now-btn" disabled={product.stock <= 0}>
            Buy Now
          </button>
        </div>
        <div className="product-description">
          <ul>
            {product?.description && formatDescription(product.description)}
          </ul>
        </div>
        
        {/* Render specifications */}
        {renderSpecifications()}
        
      </div>
    </div>
    </>
  );
};

export default ProductPage;
