import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import ProductDisplay from './ProductDisplay';
import { useParams } from 'react-router';
import Pagination from "../Pagination";
import { encryptData, decryptData } from "../../utils/Encryption";
import { ImCancelCircle } from "react-icons/im";
import Header from '../Header';
import "../../styles/DisplayPage/ProductPage.css";

const ProductFilterPage = () => {
  const server = import.meta.env.VITE_SERVER;
  const { search } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [priceFilter, setPriceFilter] = useState([0, 50000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1000);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const encryptedData = encryptData(JSON.stringify({ search ,
          category: categoryFilter,
          brands: selectedBrands,
          subcategories: selectedSubcategories,
          price: priceFilter,
          rating: ratingFilter,
          page: page + 1, 
          perPage: 20,
        }));
        const encryptedResponse = await axios.post(`${server}/products/all`, { 
          encryptedData,
         });
         const decryptedResponse = decryptData(encryptedResponse.data.data);
         const parsedData = JSON.parse(decryptedResponse);
        const { products , total } = parsedData;
        setTotalPages(Math.ceil(total / 20));
        setProducts(products);
        setFilteredProducts(products);

        // Fetch categories
        const encryptedCategoriesResponse = await axios.get(`${server}/category/simple`);
        const decryptedCategoriesResponse = decryptData(encryptedCategoriesResponse.data.data);
        const parsedCategories = JSON.parse(decryptedCategoriesResponse);
        const allCategories = parsedCategories;

        // Extract unique categories and subcategories from filtered products
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        const uniqueSubcategories = [...new Set(products.map(product => product.subcategory))];

        // Filter categories based on unique categories and subcategories
        const filteredCategories = allCategories.filter(category => {
          const hasRelevantSubcategories = category.subcategories && category.subcategories.some(sub => uniqueSubcategories.includes(sub.name));
          return uniqueCategories.includes(category.name) || hasRelevantSubcategories;
        });

        setCategories(filteredCategories);

        // Extract unique brands from filtered products
        const uniqueBrands = [...new Set(products.map(product => product.brand))];
        setBrands(uniqueBrands);


      } catch (error) {
        console.error('Error fetching products and categories:', error);
      }
    };

    fetchProducts();
  }, [search]);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth > 1000);
  }, [window.innerWidth]);

  useEffect(() => {
    filterProducts();
  }, [categoryFilter, selectedBrands, selectedSubcategories, priceFilter, ratingFilter]);

  const filterProducts = () => {
    let filtered = [...products];

    if (categoryFilter.length > 0) {
      filtered = filtered.filter(product =>
        categoryFilter.includes(product.category) || categoryFilter.includes(product.subcategory)
      );
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(product => selectedSubcategories.includes(product.subcategory));
    }
    if (priceFilter[0] !== undefined && priceFilter[1] !== undefined) {
      filtered = filtered.filter(product => {
        if (priceFilter[1] === 50000) {
          return product.price >= priceFilter[0];
        } else {
          return product.price >= priceFilter[0] && product.price <= priceFilter[1];
        }
      });
    }
    if (ratingFilter) {
      filtered = filtered.filter(product => {
        if (ratingFilter === 3) {
          return product.rating >= 3;
        } else if (ratingFilter === 2) {
          return product.rating >= 2;
        } else if (ratingFilter === 4) {
          return product.rating >= 4;
        } else if (ratingFilter === 5) {
          return product.rating === 5;
        }
        return true;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(prev => 
      prev.includes(value) ? prev.filter(cat => cat !== value) : [...prev, value]
    );
  };

  const handleSubcategoryChange = (e) => {
    const value = e.target.value;
    setSelectedSubcategories(prev => 
      prev.includes(value) ? prev.filter(sub => sub !== value) : [...prev, value]
    );
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setSelectedBrands(prev => 
      prev.includes(value) ? prev.filter(brand => brand !== value) : [...prev, value]
    );
  };

  const handlePriceChange = (values) => {
    setPriceFilter(values);
  };

  const handleRatingChange = (e) => {
    const value = Number(e.target.value);
    setRatingFilter(value === ratingFilter ? 0 : value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <><Header />
    <div className='product-display-page'>
      {isSidebarOpen && <div className='filter'>
        {isSidebarOpen && (
          <ImCancelCircle className='cancel-icon' onClick={toggleSidebar}/>
        )}
        <div className="category-filter">
          <b>Category: </b>
          <div>
            <input
              type="checkbox"
              id="all"
              name="category"
              value=""
              checked={categoryFilter.length === 0}
              onChange={handleCategoryChange}
            />
            <label htmlFor="all">All</label>
            {categories.map((category, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={category.name}
                  name="category"
                  value={category.name}
                  checked={categoryFilter.includes(category.name)}
                  onChange={handleCategoryChange}
                />
                <label htmlFor={category.name}>{category.name}</label>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="subcategory-filter">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.name}>
                        <input
                          type="checkbox"
                          id={subcategory.name}
                          name="subcategory"
                          value={subcategory.name}
                          checked={selectedSubcategories.includes(subcategory.name)}
                          onChange={handleSubcategoryChange}
                        />
                        <label htmlFor={subcategory.name}>{subcategory.name}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="brand-filter">
          <b>Brand: </b>
          <div>
            {brands.map((brand, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={brand}
                  name="brand"
                  value={brand}
                  checked={selectedBrands.includes(brand)}
                  onChange={handleBrandChange}
                />
                <label htmlFor={brand}>{brand}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="price-range-slider">
          <b>Price Range:</b>
          <Slider
            min={0}
            max={50000}
            value={priceFilter}
            onChange={handlePriceChange}
            range
          />
          <span>{priceFilter[0]} - {priceFilter[1] === 50000 ? '50000+' : priceFilter[1]}</span>
        </div>

        <div className="rating-filter">
          <b>Customer Rating:</b>
          <div>
            <div>
              <input
                type="checkbox"
                id="rating3"
                name="rating"
                value="3"
                checked={ratingFilter === 3}
                onChange={handleRatingChange}
              />
              <label htmlFor="rating3">3 & Above</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="rating2"
                name="rating"
                value="2"
                checked={ratingFilter === 2}
                onChange={handleRatingChange}
              />
              <label htmlFor="rating2">2 & Above</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="rating4"
                name="rating"
                value="4"
                checked={ratingFilter === 4}
                onChange={handleRatingChange}
              />
              <label htmlFor="rating4">4 & Above</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="rating5"
                name="rating"
                value="5"
                checked={ratingFilter === 5}
                onChange={handleRatingChange}
              />
              <label htmlFor="rating5">5</label>
            </div>
          </div>
        </div>
        
      </div>}

      <div className='filtered-products'>
      <button className='filter-toggle' onClick={toggleSidebar}>
        {isSidebarOpen ? 'Close Filters' : 'Open Filters'}
      </button>
        {filteredProducts.map(product => (
          <ProductDisplay key={product._id} product={product} />
          
        ))}
        
         <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>

    </div>
    </>
  );
};

export default ProductFilterPage;
