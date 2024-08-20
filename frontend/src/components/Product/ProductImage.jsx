import React, { useRef, useState } from 'react'
import "../../styles/Product/ProductImage.css"

const ProductImage = ({src}) => {

    const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
    const zoomRef = useRef(null);
  
    const handleMouseMove = (e) => {
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.pageX - left) / width) * 100;
      const y = ((e.pageY - top) / height) * 100;
      setBackgroundPosition(`${x}% ${y}%`);
    };

    console.log(src)
  return (
    <div className="image-with-hover">
        <img className="main-product-image" src={src} alt="Product" onMouseOver={handleMouseMove } ref={zoomRef} />
    </div>
  )
}

export default ProductImage