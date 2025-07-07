import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from '../firebaseConfig';
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = getAuth(app);
    const db = getFirestore(app);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                username: "N/A",
                createdAt: serverTimestamp()
            });
            navigate("/age");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleGoogleSignIn() {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const username = user.displayName || "N/A";
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                username,
                createdAt: serverTimestamp()
            });
            navigate("/age");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <p className='extra-text'>Create an Account</p>
            <input
                name="email"
                placeholder="email@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                name="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button
                className="button"
                id="signup-button"
                type="submit"
            >
                Sign Up
            </button>
            <button
                type="button"
                className="button"
                onClick={handleGoogleSignIn}
                style={{ marginTop: '10px' }}
            >
                Sign up with Google
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}