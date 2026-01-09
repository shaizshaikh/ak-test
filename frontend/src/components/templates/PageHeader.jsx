import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  backButton = false, 
  onBack,
  actions = null,
  breadcrumbs = null 
}) => {
  return (
    <div className="bg-white shadow-sm border-bottom">
      <div className="container py-4">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center mb-2">
              {backButton && (
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="me-3"
                  onClick={onBack}
                  icon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>
              )}
              <div>
                <div className="d-flex align-items-center">
                  {icon && <span className="me-2">{icon}</span>}
                  <h2 className="mb-0">{title}</h2>
                </div>
                {subtitle && (
                  <p className="text-muted mb-0 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {breadcrumbs && (
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  {breadcrumbs.map((crumb, index) => (
                    <li 
                      key={index} 
                      className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                    >
                      {crumb.link ? (
                        <a href={crumb.link}>{crumb.text}</a>
                      ) : (
                        crumb.text
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
          {actions && (
            <div className="col-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;