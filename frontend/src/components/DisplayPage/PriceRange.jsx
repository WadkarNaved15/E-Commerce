import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Import CSS for rc-slider
import '../../styles/DisplayPage/PriceRange.css'; 

const PriceRange = () => {
  const [rangeValues, setRangeValues] = useState([0, 1000]);

  const handleChange = (values) => {
    setRangeValues(values);
  };

  return (
    <div className="price-range-slider">
      <label>Price Range:</label>
      <Slider
        min={0}
        max={1000}
        value={rangeValues}
        onChange={handleChange}
        range
      />
      <span>{rangeValues[0]} - {rangeValues[1]}</span>
    </div>
  );
};

export default PriceRange;
