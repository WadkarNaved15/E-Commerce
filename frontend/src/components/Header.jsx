import React, { useState, useEffect, useRef } from 'react';
import { GoSearch } from 'react-icons/go';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate , useLocation} from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiLogIn } from "react-icons/fi";
import '../styles/Header.css';

const Header = () => {
    const location = useLocation();
    const { isLoggedIn } = useSelector((state) => state.user);
    const [searchInput, setSearchInput] = useState(location.state?.searchInput || '');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (query) => {
        navigate(`/display/${query}`,{state:{searchInput:searchInput}});
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const fetchSuggestions = async (query) => {
        try {
            const response = await axios.get(`http://localhost:4000/products/autocomplete`, {
                params: { search: query },
            });
            setSuggestions(response.data.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (value.length > 2) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        setSelectedIndex(-1); // Reset selectedIndex when input changes
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchInput(suggestion);
        handleSearch(suggestion);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if(searchInput.length >= 3){
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                setSearchInput(suggestions[selectedIndex]); // Set the input value to the selected suggestion
                handleSearch(suggestions[selectedIndex]);
            } else {
                handleSearch(searchInput);
            }
        }
        }
    };

    return (
        <>
            <div className={`header ${showSuggestions ? 'header-blur' : ''}`}>
                <img className='logo' src="../../src/assets/images/download.png" alt="Logo" />
                <form className="search-form" onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchInput);
                }}>
                    <div>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search..."
                        />
                        <button disabled={!searchInput || searchInput.length < 3} className='search' type="submit">
                            <GoSearch color='black' size={15} />
                        </button>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="autocomplete-dropdown" ref={dropdownRef}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
                <div className="header-right">
                    <FaWhatsapp className='icon' color="white" />
                    <FaInstagram className='icon' color="white" />
                    <Link to="/cart">
                        <MdOutlineShoppingCart className='icon' color="white" />
                    </Link>
                    {isLoggedIn ? (
                        <Link to="/profile">
                            <CgProfile className='icon' color="white" />
                        </Link>
                    ) : (
                        <Link to="/login">
                            <FiLogIn className='icon' color="white" />
                        </Link>
                    )}
                </div>
            </div>
            <form className="new-search-form" onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchInput);
            }}>
                <input
                    type="text"
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                />
                <button disabled={!searchInput || searchInput.length < 3} className='search' type="submit">
                    <GoSearch color='black' size={15} />
                </button>
            </form>
        </>
    );
};

export default Header;
