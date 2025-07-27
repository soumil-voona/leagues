import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SportTutorials.css';

const basketballVideos = [
  { title: "Basketball Shooting Drills", url: "https://www.youtube.com/embed/url" },
  { title: "How to Dribble Like a Pro", url: "https://www.youtube.com/embed/url" },
];

function BasketballTutorials() {
  const navigate = useNavigate();

  return (
    <div className="sport-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="sport-title title">Basketball Tutorials</h1>
      <div className="video-grid">
        {basketballVideos.map((video, index) => (
          <div key={index} className="video-card">
            <h2 className="video-title">{video.title}</h2>
            <div className="video-wrapper">
              <iframe
                src={video.url}
                title={video.title}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BasketballTutorials;
