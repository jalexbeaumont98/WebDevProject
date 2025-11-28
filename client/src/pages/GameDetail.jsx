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

/*

    TODO   add oppenent display name

*/

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGame, acceptGame, setSecret, makeGuess } from "../api/games";

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

// Handles id string OR a populated object
const idOf = (v) => (v && typeof v === "object" ? v._id : v);

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

  const fetchAndSetGame = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || !id) return null;

      try {
        const res = await getGame(token, id);
        const g = res?.game ?? res;
        setGame(g);
        if (!silent) setError("");
        return g;
      } catch (err) {
        if (!silent) setError(err.message || "Failed to load game");
        return null;
      }
    },
    [token, id]
  );

  const reloadGame = useCallback(async () => {
    return fetchAndSetGame({ silent: false });
  }, [fetchAndSetGame]);

  const isPlayerA = useMemo(
    () =>
      game && currentUserId && String(idOf(game.playerA)) === String(currentUserId),
    [game, currentUserId]
  );

  const isPlayerB = useMemo(
    () =>
      game && currentUserId && String(idOf(game.playerB)) === String(currentUserId),
    [game, currentUserId]
  );

  const isSpectator = useMemo(
    () => Boolean(game) && !isPlayerA && !isPlayerB,
    [game, isPlayerA, isPlayerB]
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
    return String(idOf(game.turnUserId)) === String(currentUserId);
  }, [game, currentUserId]);

  // Auto-refresh so both players see updates
  useEffect(() => {
    if (!token || !id) return;
    if (game?.status === "finished") return;

    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      if (cancelled) return;
      if (inFlight) return;
      if (document.visibilityState === "hidden") return;

      inFlight = true;
      try {
        await fetchAndSetGame({ silent: true });
      } finally {
        inFlight = false;
      }
    };

    tick();
    const interval = setInterval(tick, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, id, game?.status, fetchAndSetGame]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError("");
      setInfo("");

      await acceptGame(token, id);
      await reloadGame();
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

    if (!Number.isInteger(value) || value < 1 || value > 100) {
      setError("Secret must be an integer between 1 and 100");
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

    if (!Number.isInteger(value) || value < 1 || value > 100) {
      setError("Guess must be an integer between 1 and 100");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInfo("");

      const res = await makeGuess(token, id, value);
      const result = res?.result;

      await reloadGame();
      setGuessInput("");
      setInfo(result ? `Your guess was ${result}.` : "Guess submitted.");
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

  const guesses = Array.isArray(game.guesses) ? game.guesses : [];

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Game {game._id}</h1>
        <p className="page-subtitle">
          Turn-based number guessing game between two players. Each picks a
          secret number; you take turns guessing until someone wins.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {info && (
          <p style={{ color: "#bbf7d0", fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {info}
          </p>
        )}

        <section style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <div className="item-list">
            <div className="item-row">
              <div className="item-row-header">
                <span>Game status</span>
                <span className={statusClass(game.status)}>{game.status}</span>
              </div>
              <div className="item-row-meta">
                You are: {isPlayerA ? "Player A" : isPlayerB ? "Player B" : "Spectator"}
                <br />
                Current turn:{" "}
                {game.turnUserId
                  ? String(idOf(game.turnUserId)) === String(currentUserId)
                    ? "Yours"
                    : "Opponent's"
                  : "N/A"}
              </div>
            </div>
          </div>
        </section>

        {game.status === "waiting" && isPlayerB && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 className="section-title">Accept this game</h2>
            <p className="section-subtitle">
              The game is waiting for you to accept it before anyone can pick a
              secret number.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAccept}
              disabled={loading}
            >
              {loading ? "Accepting…" : "Accept game"}
            </button>
          </section>
        )}

        {game.status === "choosing" && !mySecretSet && !isSpectator && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 className="section-title">Pick your secret number</h2>
            <p className="section-subtitle">
              Choose an integer between 1 and 100. You can only set this once.
            </p>

            <form className="form-grid" onSubmit={handleSetSecret}>
              <div className="form-field">
                <label className="form-label">Secret number</label>
                <input
                  className="form-input-number"
                  type="number"
                  min="1"
                  max="100"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="1–100"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving…" : "Set secret"}
              </button>
            </form>
          </section>
        )}

        {game.status === "active" && myTurn && !isSpectator && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 className="section-title">Your turn – make a guess</h2>
            <p className="section-subtitle">
              Enter an integer guess. You&apos;ll see whether it was too low, too
              high, or correct.
            </p>

            <form className="form-grid" onSubmit={handleGuess}>
              <div className="form-field">
                <label className="form-label">Guess value</label>
                <input
                  className="form-input-number"
                  type="number"
                  min="1"
                  max="100"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Your guess"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Guessing…" : "Submit guess"}
              </button>
            </form>
          </section>
        )}

        {game.status === "finished" && (
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 className="section-title">Game over</h2>
            <p className="section-subtitle">
              Winner:{" "}
              {game.winnerUserId &&
              String(idOf(game.winnerUserId)) === String(currentUserId)
                ? "You 🎉"
                : "Your opponent"}
            </p>
          </section>
        )}

        <section>
          <h2 className="section-title">Guess history</h2>
          {guesses.length === 0 ? (
            <p className="section-subtitle">No guesses yet.</p>
          ) : (
            <ul className="item-list">
              {guesses.map((g, idx) => (
                <li key={idx} className="item-row">
                  <div className="item-row-header">
                    <span>
                      Player{" "}
                      {String(idOf(g.player)) === String(idOf(game.playerA))
                        ? "A"
                        : String(idOf(g.player)) === String(idOf(game.playerB))
                        ? "B"
                        : "?"}
                    </span>
                    <span className="item-row-meta">
                      {new Date(g.createdAt || game.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="item-row-meta">
                    Guess: <strong>{g.value}</strong> → {g.result}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div style={{ marginTop: "1.5rem" }}>
          <Link to="/games" className="home-link">
            ← Back to all games
          </Link>
        </div>
      </div>
    </main>
  );
}
