import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isExaminerRoute = location.pathname.startsWith('/examiner');
  const isResultsRoute = location.pathname.startsWith('/results/');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <button 
          className="navbar-brand fw-bold btn btn-link text-white text-decoration-none border-0"
          onClick={() => navigate('/')}
          style={{ fontSize: '1.5rem' }}
        >
          🎯 AzQuiz
        </button>
        
        {/* Mobile menu toggle */}
        {(isExaminerRoute || isResultsRoute) && (
          <button 
            className="navbar-toggler d-lg-none border-0"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-white">☰</span>
          </button>
        )}
        
        {/* Desktop Navigation */}
        {isExaminerRoute && (
          <div className="navbar-nav ms-auto d-none d-lg-flex flex-row gap-2">
            <button 
              className="btn btn-outline-light me-2"
              onClick={() => navigate('/examiner')}
            >
              📊 Dashboard
            </button>
            <button 
              className="btn btn-outline-light me-2"
              onClick={() => navigate('/examiner/create')}
            >
              ➕ Create Quiz
            </button>
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/examiner/manage')}
            >
              ⚙️ Manage Quizzes
            </button>
          </div>
        )}
        
        {isResultsRoute && (
          <div className="navbar-nav ms-auto d-none d-lg-flex">
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/join')}
            >
              🎯 Join Another Quiz
            </button>
          </div>
        )}
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="position-absolute top-100 start-0 w-100 bg-primary shadow-lg d-lg-none" style={{zIndex: 1000}}>
            <div className="container py-3">
              {isExaminerRoute && (
                <div className="d-flex flex-column gap-2">
                  <button 
                    className="btn btn-outline-light w-100"
                    onClick={() => {
                      navigate('/examiner');
                      setIsMenuOpen(false);
                    }}
                  >
                    📊 Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-light w-100"
                    onClick={() => {
                      navigate('/examiner/create');
                      setIsMenuOpen(false);
                    }}
                  >
                    ➕ Create Quiz
                  </button>
                  <button 
                    className="btn btn-outline-light w-100"
                    onClick={() => {
                      navigate('/examiner/manage');
                      setIsMenuOpen(false);
                    }}
                  >
                    ⚙️ Manage Quizzes
                  </button>
                </div>
              )}
              
              {isResultsRoute && (
                <button 
                  className="btn btn-outline-light w-100"
                  onClick={() => {
                    navigate('/join');
                    setIsMenuOpen(false);
                  }}
                >
                  🎯 Join Another Quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;