import "../styles/App.css";
import LoginForm from "../components/LoginComponent";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth.jsx";
import { TopWave, BottomWave } from "../components/LandingWaves";

export default function Login() {
  const navigate = useNavigate();

  function handleSignupClick() {
    navigate("/signup");
  }

  return (
    <AuthProvider>
      <div className="auth-page">
        <TopWave />
        <div className="auth-content">
          <div
            className="title"
            style={{
              marginTop: "2vh",
            }}
          >
            <Title />
          </div>
          <LoginForm />
          <p className="extra-text">
            <span style={{ font: "400 20px Poppins, sans-serif" }}>
              don't have an account?
            </span>{" "}
            <span
              className="link-highlight"
              onClick={handleSignupClick}
              style={{
                fontWeight: "300",
                fontSize: "20px",
                paddingLeft: "10px",
              }}
            >
              sign up
            </span>
          </p>
        </div>
        <BottomWave />
      </div>
    </AuthProvider>
  );
}
