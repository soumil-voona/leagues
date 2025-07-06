import '../styles/App.css';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';

function App() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login'); // Navigates to the /login route
  };

  return (
    <div className="vertical">
      <Title />
      <p className='extra-text'>The home of friendly matchmaking.</p>
      <button className="button" onClick={handleStart}>Let's Play!</button>
    </div>
  )
}

export default App
