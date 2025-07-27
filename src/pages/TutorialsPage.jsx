import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TutorialsPage.css';
import Header from '../components/Header';

function TutorialsPage() {
  const sports = ["soccer", "basketball", "tennis", "football", "volleyball"];

  return (
    <div>
      <Header />
      <div className="tutorials-home-container">
        <h1 className="tutorials-title title">Choose a Sport</h1>
        <div className="options">
          {sports.map((sport) => (
            <Link key={sport} to={`/tutorials/${sport}`} className="sport-card">
              <p className='option-content'>{sport.charAt(0).toUpperCase() + sport.slice(1)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TutorialsPage;
