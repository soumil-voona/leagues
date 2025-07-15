import * as React from 'react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const CustomSlider = styled(Slider)({
  color: '#2CBB34',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid #2CBB34',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#2CBB34',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});

export default function AgeSelection({ onAgeChange }) {
  const [age, setAge] = React.useState(18);

  const handleAgeChange = (e, newValue) => {
    setAge(newValue);
    if (onAgeChange) {
      onAgeChange(newValue);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '0 20px' }}>
      <CustomSlider
        value={age}
        min={0}
        max={99}
        onChange={handleAgeChange}
        valueLabelDisplay="auto"
        aria-label="age"
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: 8,
        fontFamily: 'Poppins, sans-serif',
        fontSize: '1.2rem',
        color: '#000'
      }}>
        <span>0</span>
        <span style={{ 
          fontWeight: '500'
        }}>
          {`${age}+`}
        </span>
        <span>99+</span>
      </div>
    </div>
  );
}