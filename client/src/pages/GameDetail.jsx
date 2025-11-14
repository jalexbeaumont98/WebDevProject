// client/src/pages/GameDetail.jsx
//
// This page shows a single game and lets you:
// - Accept a waiting game
// - Set your secret number (once)
// - Make guesses when it's your turn
//
// Example API usage:
//   const game = await getGame(auth.token, gameId);
//   await acceptGame(auth.token, gameId);
//   await setSecret(auth.token, gameId, 42);
//   const { result, game } = await makeGuess(auth.token, gameId, 17);

import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getGame,
  acceptGame,
  setSecret,
  makeGuess,
} from "../api/games";

export default function GameDetailPage() {
  const { id } = useParams();
  const { auth } = useAuth();
  const token = auth?.token;
  const currentUserId = auth?.user?._id;

  const [game, setGame] = useState(null);
  const [secretInput, setSecretInput] = useState("");
  const [guessInput, setGuessInput] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isPlayerA = useMemo(
    () => game && currentUserId && String(game.playerA) === String(currentUserId),
    [game, currentUserId]
  );
  const isPlayerB = useMemo(
    () => game && currentUserId && String(game.playerB) === String(currentUserId),
    [game, currentUserId]
  );

  const mySecretSet = useMemo(() => {
    if (!game || !currentUserId) return false;
    if (isPlayerA) return game.hasSecretA;
    if (isPlayerB) return game.hasSecretB;
    return false;
  }, [game, isPlayerA, isPlayerB, currentUserId]);

  const myTurn = useMemo(() => {
    if (!game || !currentUserId) return false;
    if (game.status !== "active") return false;
    return String(game.turnUserId) === String(currentUserId);
  }, [game, currentUserId]);

  // Load game on mount / id change
  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      try {
        setError("");
        const g = await getGame(token, id);
        setGame(g);
      } catch (err) {
        setError(err.message || "Failed to load game");
      }
    })();
  }, [token, id]);

  const reloadGame = async () => {
    if (!token || !id) return;
    const g = await getGame(token, id);
    setGame(g);
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError("");
      setInfo("");

      const g = await acceptGame(token, id);
      setGame(g);
      setInfo("Game accepted! Pick your secret number next.");
    } catch (err) {
      setError(err.message || "Failed to accept game");
    } finally {
      setLoading(false);
    }
  };

  const handleSetSecret = async (e) => {
    e.preventDefault();
    const value = Number(secretInput);
    if (!Number.isInteger(value)) {
      setError("Secret must be an integer");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo("");

      await setSecret(token, id, value);
      await reloadGame();
      setInfo("Secret set!");
    } catch (err) {
      setError(err.message || "Failed to set secret");
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    const value = Number(guessInput);
    if (!Number.isInteger(value)) {
      setError("Guess must be an integer");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo("");

      const { result } = await makeGuess(token, id, value);
      await reloadGame();
      setGuessInput("");
      setInfo(`Your guess was ${result}.`);
    } catch (err) {
      setError(err.message || "Failed to make guess");
    } finally {
      setLoading(false);
    }
  };

  if (!game) {
    return (
      <main className="page-container">
        <div className="card">
          <h1 className="page-title">Game</h1>
          {error ? <p className="auth-error">{error}</p> : <p>Loading…</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Game {game._id}</h1>

        {error && <p className="auth-error">{error}</p>}
        {info && <p style={{ color: "green" }}>{info}</p>}

        <p>
          Status: <strong>{game.status}</strong>
        </p>
        <p>
          You are:{" "}
          {isPlayerA ? "Player A" : isPlayerB ? "Player B" : "Spectator (oops)"}
        </p>
        <p>
          Current turn:{" "}
          {game.turnUserId
            ? String(game.turnUserId) === String(currentUserId)
              ? "Yours"
              : "Opponent's"
            : "N/A"}
        </p>

        {game.status === "waiting" && isPlayerB && (
          <button onClick={handleAccept} disabled={loading}>
            {loading ? "Accepting..." : "Accept Game"}
          </button>
        )}

        {game.status === "choosing" && !mySecretSet && (
          <section style={{ marginTop: "1rem" }}>
            <h2>Pick Your Secret Number</h2>
            <form
              onSubmit={handleSetSecret}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <input
                type="number"
                min="1"
                max="100"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="1–100"
              />
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Set Secret"}
              </button>
            </form>
          </section>
        )}

        {game.status === "active" && myTurn && (
          <section style={{ marginTop: "1.5rem" }}>
            <h2>Your Turn – Make a Guess</h2>
            <form
              onSubmit={handleGuess}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <input
                type="number"
                min="1"
                max="100"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Your guess"
              />
              <button type="submit" disabled={loading}>
                {loading ? "Guessing..." : "Submit Guess"}
              </button>
            </form>
          </section>
        )}

        {game.status === "finished" && (
          <p style={{ marginTop: "1rem" }}>
            Game over! Winner:{" "}
            {game.winnerUserId &&
            String(game.winnerUserId) === String(currentUserId)
              ? "You 🎉"
              : "Your opponent"}
          </p>
        )}

        <section style={{ marginTop: "1.5rem" }}>
          <h2>Guess History</h2>
          {game.guesses?.length === 0 ? (
            <p>No guesses yet.</p>
          ) : (
            <ul>
              {game.guesses.map((g, idx) => (
                <li key={idx}>
                  Player{" "}
                  {String(g.player) === String(game.playerA)
                    ? "A"
                    : String(g.player) === String(game.playerB)
                    ? "B"
                    : "?"}{" "}
                  guessed {g.value} → {g.result}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}