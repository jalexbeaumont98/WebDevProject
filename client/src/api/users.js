// src/api/users.js
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
 * Look up a user by displayName.
 *
 * Example:
 *   const user = await getUserByDisplayName(auth.token, "Alice");
 *   console.log(user._id, user.displayName, user.email);
 */
export async function getUserByDisplayName(token, displayName) {
  const res = await fetch(
    `${API_BASE}/api/users/by-display-name/${encodeURIComponent(displayName)}`,
    {
      method: "GET",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to fetch user");
  }

  return res.json();
}