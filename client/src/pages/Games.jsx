// client/src/pages/Games.jsx
//
// Shows your games and lets you create a game vs a friend.
//
// Example API usage:
//   const games = await listGames(auth.token);
//   const newGame = await createGame(auth.token, opponentId);

/*

TODO

Create a flow where you can make a game using a list of your friends instead of manually entering their mongo_id.
also make it so it shows who your oppenent is (displayname)

*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listGames, createGame } from "../api/games";

export default function GamesPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [games, setGames] = useState([]);
  const [opponentId, setOpponentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setError("");
        const data = await listGames(token);
        setGames(data || []);
      } catch (err) {
        setError(err.message || "Failed to load games");
      }
    })();
  }, [token]);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!opponentId.trim()) return;
    try {
      setLoading(true);
      setError("");

      const newGame = await createGame(token, opponentId.trim());
      setOpponentId("");
      setGames((prev) => [newGame, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "waiting":
        return "status-pill status-pill--waiting";
      case "active":
        return "status-pill status-pill--active";
      case "finished":
        return "status-pill status-pill--finished";
      default:
        return "status-pill";
    }
  };

  

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Games</h1>
        <p className="page-subtitle">
          Start a new game against a friend and see all your current and
          finished games.
        </p>

        {error && <p className="auth-error">{error}</p>}

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 className="section-title">Start a new game</h2>
          <p className="section-subtitle">
            For now, paste your friend&apos;s user ID (MongoDB _id). Later we can
            choose from your friends list.
          </p>

          <form className="form-grid" onSubmit={handleCreateGame}>
            <div className="form-field">
              <label className="form-label">Friend user ID</label>
              <input
                className="form-input"
                type="text"
                placeholder="Friend's userId"
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create game"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="section-title">My games</h2>
          {games.length === 0 ? (
            <p className="section-subtitle">
              You don&apos;t have any games yet.
            </p>
          ) : (
            <ul className="item-list">
              {games.map((g) => (
                <li key={g._id} className="item-row">
                  <div className="item-row-header">
                    <span>Game {g._id}</span>
                    <span className={statusClass(g.status)}>
                      {g.status}
                    </span>
                  </div>
                  <div className="item-row-meta">
                    Last updated:{" "}
                    {g.updatedAt
                      ? new Date(g.updatedAt).toLocaleString()
                      : "unknown"}
                  </div>
                  <div style={{ marginTop: "0.4rem" }}>
                    <Link to={`/games/${g._id}`}>Open game</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}