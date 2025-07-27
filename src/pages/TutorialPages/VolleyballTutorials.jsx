import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SportTutorials.css';

const volleyballVideos = [
  { title: "Volleyball Serving Basics", url: "https://www.youtube.com/embed/url" },
  { title: "Defensive Skills and Passing", url: "https://www.youtube.com/embed/url" },
];

function VolleyballTutorials() {
  const navigate = useNavigate();

  return (
    <div className="sport-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="sport-title">Volleyball Tutorials</h1>
      <div className="video-grid">
        {volleyballVideos.map((video, index) => (
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

export default VolleyballTutorials;
