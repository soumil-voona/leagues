import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "../firebaseConfig";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import "../styles/signup_login.css";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name");
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        createdAt: serverTimestamp(),
      });
      navigate("/age");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // For Google sign-in, we'll use their display name if available
      const nameParts = (user.displayName || "").split(" ");
      const googleFirstName = nameParts[0] || "N/A";
      const googleLastName = nameParts.slice(1).join(" ") || "N/A";
      
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || "N/A",
        firstName: googleFirstName,
        lastName: googleLastName,
        createdAt: serverTimestamp(),
      });
      navigate("/age");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
      <p className="subtitle-text">create an account</p>
      <input
        name="firstName"
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
        required
        autoFocus
      />
      <input
        name="lastName"
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={e => setLastName(e.target.value)}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="email@domain.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button className="button" type="submit" disabled={loading}>
        continue
      </button>
      <p className="divider-text">or</p>
      <button
        type="button"
        className="google-btn"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" />
        continue with google
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
