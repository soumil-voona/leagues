import "../styles/App.css";
import SignUpForm from "../components/SignupComponent";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth.jsx";
import { TopWave, BottomWave } from "../components/LandingWaves";

export default function Signup() {
  const navigate = useNavigate();

  function handleLoginClick() {
    navigate("/login");
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
          <SignUpForm />
          <p className="extra-text">
            <span style={{ font: "400 20px Poppins, sans-serif" }}>
              already have an account?
            </span>{" "}
            <span
              className="link-highlight"
              onClick={handleLoginClick}
              style={{
                fontWeight: "300",
                fontSize: "20px",
                paddingLeft: "10px",
              }}
            >
              log in
            </span>
          </p>
        </div>
        <BottomWave />
      </div>
    </AuthProvider>
  );
}
