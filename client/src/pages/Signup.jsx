// client/src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth';

export default function Signup() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            await signup({ displayName, email, password });
            setSuccessMsg('Account created! You can now sign in.');
            // Small delay then send them to login
            setTimeout(() => navigate('/login'), 800);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <h1>Sign Up</h1>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{ padding: "8px", width: "100%" }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: "8px", width: "100%" }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: "8px", width: "100%" }}
                        />
                    </div>

                    <button style={{ width: "100%", padding: "10px", marginTop: "0.5rem" }}>
                        Sign Up
                    </button>
                </div>
            </form>

            <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
}