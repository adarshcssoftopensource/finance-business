import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <NavLink 
        to="/pay-as-bank"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        Pay as Bank
      </NavLink>
    </nav>
  );
};

export default Navigation; 