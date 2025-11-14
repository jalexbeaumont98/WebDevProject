// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"

export default function Login() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // where we should go AFTER login
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signin(email, password);       // calls your AuthContext
      navigate(from, { replace: true });  // ⬅️ redirect after success
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-title">Sign In</h1>
      <div className="auth-underline" />

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: "8px", width: "100%" }}
          />
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: "8px", width: "100%" }}
          />
        </div>

        {error && (
          <p className="auth-error" style={{ color: "red", margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Don’t have an account?{" "}
        <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}