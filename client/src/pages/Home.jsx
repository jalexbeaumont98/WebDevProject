import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

/*

TODO

Home page right now just shows your name and gives you a logout button, should probably a button to go to your most 
recent active game or something.


*/

export default function Home() {
  const { auth } = useAuth();

  const name =
    auth?.user?.displayName ||
    auth?.user?.name ||
    auth?.user?.email?.split("@")[0] ||
    "there";

  return (
    <main className="page-container">
      <div className="card home-card">
        <div className="home-header">
          <h1 className="page-title">Welcome, {name}</h1>
          <p className="page-subtitle">
            You&apos;re signed in. Start a new game, manage your friends, or view your
            profile.
          </p>
        </div>

        <div className="home-actions">
          <div className="home-main-actions">
            <Link to="/games" className="btn-primary">
              Start a game
            </Link>
            <Link to="/games" className="btn-secondary">
              View my games
            </Link>
          </div>

          <div className="home-secondary-actions">
            <Link to="/friends" className="home-link">
              Manage friends
            </Link>
            <Link to="/profile" className="home-link">
              Your profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}