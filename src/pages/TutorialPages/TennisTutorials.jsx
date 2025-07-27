import { useNavigate } from 'react-router-dom';
import '../../styles/SportTutorials.css';

const tennisVideos = [
  { title: "Tennis Footwork for Beginners", url: "https://www.youtube.com/embed" },
  { title: "How to Hit a Forehand | Tennis Technique", url: "https://www.youtube.com/embed" },
];

function TennisTutorials() {
  const navigate = useNavigate();

  return (
    <div className="sport-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="sport-title title">Tennis Tutorials</h1>
      <div className="video-grid">
        {tennisVideos.map((video, index) => (
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

export default TennisTutorials;
