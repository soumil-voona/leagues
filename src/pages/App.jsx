import "../styles/App.css";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { TopWave, BottomWave } from "../components/LandingWaves";

function App() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      <TopWave />
      <div className="main-content">
        <Title />
        <p className="tagline">the home of friendly match-making</p>
        <button className="cta-button" onClick={handleStart}>
          LET'S PLAY
        </button>
      </div>
      <BottomWave />
    </div>
  );
}

export default App;
