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

      // Example: await createGame(auth.token, friendUserId);
      const newGame = await createGame(token, opponentId.trim());
      setOpponentId("");
      setGames((prev) => [newGame, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Games</h1>

        {error && <p className="auth-error">{error}</p>}

        <section style={{ marginBottom: "1.5rem" }}>
          <h2>Start a New Game</h2>
          <p style={{ fontSize: "0.9rem" }}>
            For now, paste your friend&apos;s userId (Mongo _id) here.
          </p>
          <form
            onSubmit={handleCreateGame}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="Friend's userId"
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Game"}
            </button>
          </form>
        </section>

        <section>
          <h2>My Games</h2>
          {games.length === 0 ? (
            <p>No games yet.</p>
          ) : (
            <ul>
              {games.map((g) => (
                <li key={g._id}>
                  <span>
                    Game <code>{g._id}</code> – status: <strong>{g.status}</strong>
                  </span>{" "}
                  &nbsp;
                  <Link to={`/games/${g._id}`}>Open</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}