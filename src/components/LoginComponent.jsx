import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from '../firebaseConfig';
import "../styles/signup_login.css";

export default function LoginComponent() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth(app);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <p className="subtitle-text">log in to your account</p>
            <input
                name="email"
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
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