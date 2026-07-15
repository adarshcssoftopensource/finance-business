import React from 'react'

const FinanceBusinessLogo = ({ className, height = 32 }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 780 100"
      height={height}
      width={height * (7.8)}
      aria-label="Finance Business"
      role="img"
    >
      <text x="10" y="80" fontFamily="Arial, sans-serif" fontSize="80" fontWeight="900" fill="#333333" letterSpacing="2">FINANCE</text>
      <circle cx="430" cy="65" r="14" fill="#FF5A1F"/>
      <text x="470" y="80" fontFamily="Arial, sans-serif" fontSize="70" fill="#6E6E6E">Business</text>
    </svg>
  );
}

export default FinanceBusinessLogo
