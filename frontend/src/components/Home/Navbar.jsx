import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { decryptData } from '../../utils/Encryption';
import '../../styles/Home/Navbar.css';

const Navbar = () => {
  const server = import.meta.env.VITE_SERVER
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const encryptedResponse = await axios.get(`${server}/category/simple`);
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const parsedData = JSON.parse(decryptedResponse);
        setCategories(parsedData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {categories.slice(0, 8).map((category) => (
          <li  onClick={() => navigate(`/display/${category.name}`)} key={category.id} className="navbar-item">
            {category.name}
          </li>
        ))}
        {categories.length > 8 && (
          <li className="navbar-item">
            <button onClick={handleOpen}>More</button>
          </li>
        )}
      </ul>
      {isOpen && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClose}>×</button>
            <ul>
              {categories.slice(5).map((category) => (
                <li onClick={() => navigate(`/display/${category.name}`)} key={category.id}>{category.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
