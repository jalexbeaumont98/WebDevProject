// client/src/api/games.js
// Helpers for /api/games

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin);

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * List games for the logged-in user.
 *
 * Example:
 *   const games = await listGames(auth.token);
 */
export async function listGames(token) {
  const res = await fetch(`${API_BASE}/api/games`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load games");
  return res.json();
}

/**
 * Create a new game vs a given opponentId.
 *
 * Example:
 *   const game = await createGame(auth.token, opponentId);
 */
export async function createGame(token, opponentId) {
  const res = await fetch(`${API_BASE}/api/games`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ opponentId }), // range is optional in backend
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create game");
  }
  return res.json();
}

/**
 * Get a single game by id.
 *
 * Example:
 *   const game = await getGame(auth.token, gameId);
 */
export async function getGame(token, gameId) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load game");
  return res.json();
}

/**
 * Accept a waiting game.
 *
 * Example:
 *   const updated = await acceptGame(auth.token, gameId);
 */
export async function acceptGame(token, gameId) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/accept`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to accept game");
  }
  return res.json();
}

/**
 * Set your secret number.
 *
 * Example:
 *   await setSecret(auth.token, gameId, 17);
 */
export async function setSecret(token, gameId, secret) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/secret`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ secret }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to set secret");
  }
  return res.json();
}

/**
 * Make a guess in an active game.
 *
 * Example:
 *   const { result, game } = await makeGuess(auth.token, gameId, 42);
 */
export async function makeGuess(token, gameId, guess) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/guess`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ guess }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to make guess");
  }
  return res.json();
}

/**
 * Delete a game (if one of the participants).
 *
 * Example:
 *   await deleteGame(auth.token, gameId);
 */
export async function deleteGame(token, gameId) {
  const res = await fetch(`${API_BASE}/api/games/${gameId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete game");
  }
  return res.json();
}