import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
  const location = useLocation();
  
  // Don't show navbar/footer on participant exam pages for focus
  const isExamPage = location.pathname.startsWith('/exam/');
  const isFullScreenPage = isExamPage;

  if (isFullScreenPage) {
    return (
      <div className="min-vh-100">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;