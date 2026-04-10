import React, { useState } from 'react';
import './CreditCardDisplay.css';

interface CreditCardDisplayProps {
  cardNumber: string;
  cardHolder: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv: string;
  isFlipped?: boolean;
}

export const CreditCardDisplay: React.FC<CreditCardDisplayProps> = ({
  cardNumber,
  cardHolder,
  expiryMonth = '',
  expiryYear = '',
  cvv,
  isFlipped = false,
}) => {
  // Display card number with masking
  const displayCardNumber = cardNumber || '0000 0000 0000 0000';
  const maskedCardNumber = displayCardNumber
    .split(' ')
    .map((segment, index) => {
      if (index < 2) return segment;
      return segment.replace(/\d/g, '*');
    })
    .join(' ');

  return (
    <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
      {/* Front of card */}
      <div className="card-front">
        <div className="card-chip"></div>
        <div className="card-logo">VISA</div>
        <div className="card-number">{maskedCardNumber}</div>
        <div className="card-holder">
          <span className="label">CARD HOLDER</span>
          <span className="value">{cardHolder || 'FULL NAME'}</span>
        </div>
        <div className="card-expiry">
          <span className="label">EXPIRES</span>
          <span className="value">
            {expiryMonth || 'MM'}/{expiryYear || 'YY'}
          </span>
        </div>
      </div>

      {/* Back of card */}
      <div className="card-back">
        <div className="card-strip"></div>
        <div className="card-cvv">
          <span className="label">CVV</span>
          <span className="value">{cvv || '***'}</span>
        </div>
      </div>
    </div>
  );
};

