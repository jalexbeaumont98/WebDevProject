const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin);

// Utility to build auth headers
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Example usage (in a component):
 *
 *   const { auth } = useAuth();
 *   const requests = await listRequests(auth.token);
 */
export async function listRequests(token) {
  const res = await fetch(`${API_BASE}/api/friends/requests`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load friend requests");
  return res.json();
}

/**
 * Example:
 *   await sendRequest(auth.token, friendUserId);
 */
export async function sendRequest(token, toUserId) {
  const res = await fetch(`${API_BASE}/api/friends/requests`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ toUserId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send friend request");
  }
  return res.json();
}

/**
 * Accept or decline a friend request.
 *
 * Example:
 *   await respondToRequest(auth.token, requestId, "accept");
 *   await respondToRequest(auth.token, requestId, "decline");
 */
export async function respondToRequest(token, requestId, action) {
  const res = await fetch(`${API_BASE}/api/friends/requests`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ requestId, action }), // action: "accept" | "decline"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update friend request");
  }
  return res.json();
}

/**
 * Delete/cancel a friend request you’re part of.
 *
 * Example:
 *   await deleteRequest(auth.token, requestId);
 */
export async function deleteRequest(token, requestId) {
  const res = await fetch(`${API_BASE}/api/friends/requests/${requestId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete friend request");
  }
  return res.json();
}

/**
 * List your accepted friends.
 *
 * Returns: { count, friends: [{ _id, displayName, email, avatarUrl? }, ...] }
 *
 * Example:
 *   const { friends } = await listFriends(auth.token);
 */
export async function listFriends(token) {
  const res = await fetch(`${API_BASE}/api/friends`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load friends");
  return res.json();
}