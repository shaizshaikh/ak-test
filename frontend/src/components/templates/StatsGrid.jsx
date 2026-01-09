import React from 'react';
import Card from '../ui/Card';

const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
  <div className="col-md-6 col-lg-3">
    <Card className="text-center h-100" hover>
      <Card.Body className="p-4">
        <div 
          className={`bg-${color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
          style={{width: '60px', height: '60px'}}
        >
          <span className={`text-${color}`} style={{fontSize: '1.5rem'}}>
            {icon}
          </span>
        </div>
        <h3 className={`fw-bold text-${color} mb-1`}>{value}</h3>
        <h6 className="mb-1">{title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </Card.Body>
    </Card>
  </div>
);

const StatsGrid = ({ stats = [] }) => {
  return (
    <div className="row g-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

StatsGrid.StatCard = StatCard;

export default StatsGrid;