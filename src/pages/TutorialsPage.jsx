import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TutorialsPage.css';

function TutorialsPage() {
  const sports = ["soccer", "basketball", "badminton", "football", "volleyball"];

  return (
    <div className="tutorials-home-container">
      <h1 className="tutorials-title">Choose a Sport</h1>
      <div className="sport-grid">
        {sports.map((sport) => (
          <Link key={sport} to={`/tutorials/${sport}`} className="sport-card">
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TutorialsPage;
