import React, { useState } from 'react';
import './AgeSelection.css';

export default function AgeSelection({ onAgeChange }) {
  const [age, setAge] = useState(18);

  const handleAgeChange = (e) => {
    const newAge = parseInt(e.target.value, 10);
    setAge(newAge);
    if (onAgeChange) {
      onAgeChange(newAge);
    }
  };

  return (
    <div className="age-selection">
      <h2 className="age-title">How old are you?</h2>
      
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="99"
          value={age}
          onChange={handleAgeChange}
          className="age-slider"
          aria-label="Select your age"
        />
        
        <div className="age-labels">
          <span>0</span>
          <div className="age-display">
            <span className="age-value">{age}</span>
            <span className="age-plus">+</span>
          </div>
          <span>99+</span>
        </div>
      </div>
      
      <p className="age-hint">Slide to select your age</p>
    </div>
  );
}