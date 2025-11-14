import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { auth, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const handleLogout = async () => {
    await signout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="nav-logo">
          Guessr
        </NavLink>

        {auth?.token && (
          <>
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
            <NavLink to="/friends" className="nav-link">
              Friends
            </NavLink>
            <NavLink to="/games" className="nav-link">
              Games
            </NavLink>
            <NavLink to="/profile" className="nav-link">
              Profile
            </NavLink>
          </>
        )}
      </div>

      <div className="nav-right">
        {!auth?.token ? (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/signup" className="nav-link">
              Signup
            </NavLink>
          </>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}