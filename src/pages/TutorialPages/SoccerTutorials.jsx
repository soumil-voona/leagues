import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SportTutorials.css';

const soccerVideos = [
  { title: "Beginner Soccer Drills", url: "https://www.youtube.com/embed/url" },
  { title: "How to Juggle a Soccer Ball", url: "https://www.youtube.com/embed/url" },
];

function SoccerTutorials() {
  const navigate = useNavigate();

  return (
    <div className="sport-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="sport-title">Soccer Tutorials</h1>
      <div className="video-grid">
        {soccerVideos.map((video, index) => (
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

export default SoccerTutorials;
