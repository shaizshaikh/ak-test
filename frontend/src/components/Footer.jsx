import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <span className="h5 mb-0 me-2">🎯</span>
              <div>
                <h6 className="mb-0">AzQuiz</h6>
                <small className="text-muted">Interactive Quiz Platform</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <small className="text-muted">
              © 2025 AzQuiz. Built with React & Node.js
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;