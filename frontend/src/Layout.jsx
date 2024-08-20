import React from 'react';
import Header from './components/Header';
import Navbar from './components/Home/Navbar';

const Layout = ({ children }) => {
  return (
    <div>
      {/* <Header /> */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
