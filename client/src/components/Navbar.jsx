import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/group7software_blue.png";
import "./Navbar.css";

export default function Navbar() {
  const { auth, signout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const userName =
    auth?.user?.displayName ||
    auth?.user?.name ||
    auth?.user?.email?.split("@")[0] ||
    "Player";

  const handleLogout = async () => {
    await signout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " nav-link--active" : "");

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <NavLink to="/" className="nav-logo">
            <img src={logo} alt="Guessr logo" className="nav-logo-img" />
            <span className="nav-logo-text">Guessr</span>
          </NavLink>

          {auth?.token && (
            <nav className="nav-links">
              <NavLink end to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/friends" className={navLinkClass}>
                Friends
              </NavLink>
              <NavLink to="/games" className={navLinkClass}>
                Games
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            </nav>
          )}
        </div>

        <div className="navbar-right">
          {auth?.token ? (
            <>
              <div className="nav-user">
                <div className="nav-user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">{userName}</span>
              </div>
              <button
                type="button"
                className="btn-nav-ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <nav className="nav-auth-links">
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Signup
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}