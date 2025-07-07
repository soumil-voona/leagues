import '../styles/App.css';
import LoginForm from '../components/SignUp';
import Title from '../components/Title';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/age");
  }
  
  return (
    <div className="vertical">
      <Title />
      <LoginForm />
      <button onClick={handleClick}>Continue with google</button>
    </div>
  );
}
