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
            <div className="auth-card">
                <h1 className="auth-title">Create your Guessr account</h1>
                <p className="auth-subtitle">
                    Choose a display name, then sign in to start playing with friends.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label className="form-label">Display name</label>
                    <input
                    className="form-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label className="form-label">Email</label>
                    <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    />
                </div>

                <div className="form-field">
                    <label className="form-label">Password</label>
                    <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    />
                </div>

                {error && <p className="auth-error">{error}</p>}
                {successMsg && (
                    <p style={{ color: "#bbf7d0", fontSize: "0.9rem", margin: 0 }}>
                    {successMsg}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? "Creating account…" : "Sign up"}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account?{" "}
                <Link to="/login">Sign in</Link>
            </div>
        </div>
    </div>
  );
}