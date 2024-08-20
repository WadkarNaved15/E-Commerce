import React,{ useEffect, useState } from 'react'
import axios from 'axios'
import SlideShow from '../components/Home/slideShow'
import Navbar from '../components/Home/Navbar'
import Header from '../components/Header'
import ProductCards from '../components/Product/ProductCards' 
import Footer from '../components/Footer'
import DisplayLine from '../components/Home/DisplayLine'
import Login from '../components/Home/Login'
import CategoryCards from '../components/Home/CategoryCards'
import ProductDisplay from '../components/DisplayPage/ProductDisplay'
import PriceRange from '../components/DisplayPage/PriceRange'
import { useLatestProductsQuery } from '../redux/api/productAPI'
import toast from 'react-hot-toast'
import { Loader, SkeletonLoader } from '../components/Loader'
import { getCartFromLocalStorage } from '../utils/localStorage'
import CarouselSlideshow from '../components/Home/Carousel'
import { encryptData , decryptData } from '../utils/Encryption'

const Home = () => {
  const server = import.meta.env.VITE_SERVER

  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState({});

    
    const fetchLatestProducts = async () => {
      try {
        setIsLoading(true);
        const encryptedResponse = await axios.get(`${server}/products/latest-products`);
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const data = JSON.parse(decryptedResponse);
        setLatestProducts(data);
        setIsLoading(false);
    }catch (error) {
        console.error('Error fetching latest products:', error);
      }
    };

    const fetchBestSellers = async () => {
      try {
        setIsLoading(true);
        const encryptedResponse = await axios.get(`${server}/order/best-sellers`);
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const data = JSON.parse(decryptedResponse);
        setBestSellers(data?.map(bestSeller => bestSeller.
          productDetails || []));
        console.log(data?.map(bestSeller => bestSeller.
          productDetails || []));
        setIsLoading(false);
    }catch (error) {
        console.error('Error fetching best sellers:', error);
      }
    };

    useEffect(() => {
      fetchLatestProducts();
      fetchBestSellers();
    }, []);





  // useEffect(() => {
  //     const fetchProducts = async () => {

  //         const response = await axios.get('http://localhost:4000/products/latest-products');
  //         console.log(response.data)
  //         const { data :productData} = response.data;
          
  //         // Fetch ratings for each product
  //         const productsWithRatings = await Promise.all(productData.map(async (product) => {
  //           const ratingResponse = await axios.get(`http://localhost:4000/products/rating/${product._id}`);
  //           const { data: dataRating } = ratingResponse.data;
  //           const ratings = dataRating.length > 0
  //             ? dataRating.reduce((sum, rating) => sum + rating.rating, 0) / dataRating.length
  //             : 0;
            
  //           return { ...product, rating: ratings , noRating: dataRating.length };
  //         }));
  
  //         setProducts(productsWithRatings);
  //     };
  
  //     fetchProducts();
  //   }, []);

  return (
    <>
    <Header/>
    <Navbar/>
    <DisplayLine title="Cash on Delivery "/>
    {/* <Login></Login> */}
   
    <CarouselSlideshow/>
    <CategoryCards/>
    {isLoading ? <SkeletonLoader/> : <><ProductCards products={latestProducts} heading="Latest Products"/>
    <ProductCards products={bestSellers} heading="Best Sellers"/></>}
    
    <Footer></Footer>
    </>
  )
}

export default Home