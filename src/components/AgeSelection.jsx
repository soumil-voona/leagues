import * as React from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

export default function AgeSelection() {
  const [age, setAge] = React.useState(18);

  return (
    <div style={{ width: 300, margin: '40px auto' }}>
      <h1 style={{textAlign: "center"}}>Select Age</h1>
      <Slider
        value={age}
        min={1}
        max={100}
        onChange={(e, newValue) => setAge(newValue)}
        valueLabelDisplay="auto" // Only show label while interacting
        aria-label="age"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>1</span>
        <span>100</span>
      </div>
    </div>
  );
}