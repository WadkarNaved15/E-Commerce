import React from 'react';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedinIn, FaPhoneAlt } from 'react-icons/fa';
import { CiMail } from "react-icons/ci";
import { FaMapLocationDot } from "react-icons/fa6";
import { Link ,useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  return (
    <>
      <button className="back-to-top" onClick={scrollToTop}>
        Back To Top
      </button>
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-section">
            <h3>Get to Know Us</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press Releases</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Connect with Us</h3>
            <ul>
              <li><FaPhoneAlt /> +91 9321869880</li>
              <li><CiMail /> 5yUeh@example.com</li>
              <li><FaMapLocationDot size={20} /> Shop no.171, First Floor, Orchid City Centre Mall, Bellasis Rd, opposite Best Bus Depot, Navjeevan Society, Dalal Estate, Mumbai Central, E</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Let Us Help You</h3>
            <ul>
              <li><Link to="/profile">Your Account</Link></li>
              <li onClick={() => navigate('/profile',{state:"myOrders"})}>Your Orders</li>
              <li><Link to="/shipping">Shipping Rates & Policies</Link></li>
              <li><Link to="/returns">Returns & Replacements</Link></li>
            </ul>
          </div>
          <div className='footer-section'>
            <h3>Socials</h3>
            <ul className="social-icons">
              <li><Link to="https://api.whatsapp.com/send?phone=9321869880" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></Link></li>
              <li><Link to="https://www.facebook.com/YOUR_PROFILE" target="_blank" rel="noopener noreferrer"><FaFacebookF /></Link></li>
              <li><Link to="https://twitter.com/YOUR_PROFILE" target="_blank" rel="noopener noreferrer"><FaTwitter /></Link></li>
              <li><Link to="https://www.instagram.com/YOUR_PROFILE" target="_blank" rel="noopener noreferrer"><FaInstagram /></Link></li>
              <li><Link to="https://www.linkedin.com/in/YOUR_PROFILE" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Your Company Name. All rights reserved.</p>
          <p>
            <Link to="/privacy-policy">Privacy Policy</Link> | <Link to="/terms-and-conditions">Terms of Service</Link> 
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
