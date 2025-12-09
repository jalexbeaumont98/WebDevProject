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
import { listFriends } from "../api/friends";

export default function GamesPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [games, setGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [opponentId, setOpponentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setError("");
        const [gamesData, friendsData] = await Promise.all([
          listGames(token),
          listFriends(token),
        ]);

        setGames(gamesData || []);

        const friendArray = Array.isArray(friendsData)
          ? friendsData
          : friendsData?.friends || [];
        setFriends(friendArray);
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

  const getOpponentName = (game) => {
    const me = auth?.user?._id;

    const idOf = (v) =>
      v && typeof v === "object" ? v._id : v;

    const pA = game.playerA;
    const pB = game.playerB;

    // Decide who is the opponent
    const opponent =
      String(idOf(pA)) === String(me) ? pB : pA;

    if (!opponent) return "Unknown";

    return (
      opponent.displayName ||
      opponent.name ||
      opponent.email ||
      "Unknown"
    );
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
            Choose a friend from your friends list to start a new game.
          </p>

          <form className="form-grid" onSubmit={handleCreateGame}>
            <div className="form-field">
              <label className="form-label">Friend</label>
              <select
                className="form-input"
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
              >
                <option value="">Select a friend…</option>
                {friends.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.displayName || f.name || f.email}
                  </option>
                ))}
              </select>
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
              {games.map((g) => {
                console.log("Game row:", g);   // <-- add this line

                return (
                  <li key={g._id} className="item-row">
                    <div className="item-row-header">
                      <span>Game vs {getOpponentName(g)}</span>
                      <span className={statusClass(g.status)}>
                        {g.status}
                      </span>
                    </div>

                    <div className="item-row-meta">
                      Last updated:{" "}
                      {g.updated || g.updatedAt
                        ? new Date(g.updated || g.updatedAt).toLocaleString()
                        : "unknown"}
                    </div>

                    <div style={{ marginTop: "0.4rem" }}>
                      <Link to={`/games/${g._id}`}>Open game</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}