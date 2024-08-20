import React, { useEffect, useRef, useState } from 'react'
import ProductCard from './ProductCard'
import axios from 'axios'
import '../../styles/Product/ProductCards.css'

const ProductCards = ({products,heading}) => {
    const containerRef = useRef(null);

    const scrollLeft = () => {
        containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
      };
    
      const scrollRight = () => {
        containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
      };

      if(products.length === 0) return null
  return (
    <>
    <h3>{heading}</h3>
    <div className='product-cards-container' ref={containerRef}>

        {/* <button className="scroll-button left" onClick={scrollLeft}>◀</button>  */}
         {products?.map(product => 
         <ProductCard onClick={() => navigate(`/product/${product._id}`)} key={product._id} product={product} />)}
         
         {/* <button className="scroll-button right" onClick={scrollRight}>▶</button> */}


    </div>
    </>
  )
}

export default ProductCards