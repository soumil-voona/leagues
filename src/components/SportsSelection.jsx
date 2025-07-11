// Imports useState hook from react
import {useState} from 'react';

// For the buttons
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
// Custom CSS for the buttons
import '../styles/sportsButton.css';

// For the submit button
import ChangeURLButton from './ChangeURLButton';

export default function SportsSelection() {
  
  // Use these to track changes
  const [sport, setSport] = useState([]);

  const handleChange = (event, newSports) => {
    // Sets it to be an array of selected sports
    setSport(newSports);
  };

  // Function to handle the submit button
  function handleClick() {
    // Write your code here

  }

  return (
    <div className="centered-vertical">
      <h1>Sports Selection</h1>
      <ToggleButtonGroup
        value={sport}
        onChange={handleChange}
        aria-label="sports selection"
      >
        <ToggleButton value="soccer" aria-label="soccer">
          <SportsSoccerIcon />
        </ToggleButton>

        <ToggleButton value="basketball" aria-label="basketball">
          <SportsBasketballIcon />
        </ToggleButton>

        <ToggleButton value="badminton" aria-label="badminton">
          <img
            src='/badminton-racket-icon-free-vector-removebg-preview.png'
            alt="Badminton"
            height="24"
            style={{ pointerEvents: 'none' }} // ensures the button receives the click, not the img
          />
        </ToggleButton>

        <ToggleButton value="football" aria-label="football">
          <SportsFootballIcon />
        </ToggleButton>

        <ToggleButton value="volleyball" aria-label="volleyball">
          <SportsVolleyballIcon />
        </ToggleButton>
        {/* Add more ToggleButtons for other sports/icons */}
      </ToggleButtonGroup>

      <ChangeURLButton onClick={handleClick} content="Continue" location="/homepage"/>
    </div>
  );
}
