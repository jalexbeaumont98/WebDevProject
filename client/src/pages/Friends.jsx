// client/src/pages/Friends.jsx
//
// This page lets you:
// - See your accepted friends
// - See all friend requests (incoming + outgoing)
// - Send a new friend request by userId
// - Accept / decline requests
//
// Example usage of the API is shown in comments near each call.

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listFriends,
  listRequests,
  sendRequest,
  respondToRequest,
} from "../api/friends";

export default function FriendsPage() {
  const { auth } = useAuth();
  const token = auth?.token;

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newFriendId, setNewFriendId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load friends + requests on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setError("");
        const [friendsData, requestsData] = await Promise.all([
          // Example: const { friends } = await listFriends(auth.token);
          listFriends(token),
          // Example: const reqs = await listRequests(auth.token);
          listRequests(token),
        ]);
        setFriends(friendsData.friends || []);
        setRequests(requestsData || []);
      } catch (err) {
        setError(err.message || "Failed to load friends data");
      }
    })();
  }, [token]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!newFriendId.trim()) return;
    try {
      setLoading(true);
      setError("");

      // Example: await sendRequest(auth.token, toUserId);
      await sendRequest(token, newFriendId.trim());

      setNewFriendId("");
      const updated = await listRequests(token);
      setRequests(updated);
    } catch (err) {
      setError(err.message || "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      setLoading(true);
      setError("");

      // Example: await respondToRequest(auth.token, requestId, "accept");
      await respondToRequest(token, requestId, action);

      const [friendsData, requestsData] = await Promise.all([
        listFriends(token),
        listRequests(token),
      ]);
      setFriends(friendsData.friends || []);
      setRequests(requestsData || []);
    } catch (err) {
      setError(err.message || "Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Friends</h1>

        {error && <p className="auth-error">{error}</p>}

        <section style={{ marginBottom: "1.5rem" }}>
          <h2>Send Friend Request</h2>
          <p style={{ fontSize: "0.9rem" }}>
            Enter the other user&apos;s ID for now (later we can search by
            name/email).
          </p>
          <form
            onSubmit={handleSendRequest}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="Opponent userId (Mongo _id)"
              value={newFriendId}
              onChange={(e) => setNewFriendId(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h2>Friend Requests</h2>
          {requests.length === 0 ? (
            <p>No friend requests yet.</p>
          ) : (
            <ul>
              {requests.map((r) => (
                <li key={r._id}>
                  <strong>Status:</strong> {r.status}{" "}
                  <br />
                  <span>From: {r.fromUserId?.displayName || r.fromUserId}</span>
                  <br />
                  <span>To: {r.toUserId?.displayName || r.toUserId}</span>
                  <br />
                  {r.status === "pending" && (
                    <div style={{ marginTop: "0.25rem" }}>
                      <button
                        onClick={() => handleRespond(r._id, "accept")}
                        disabled={loading}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(r._id, "decline")}
                        disabled={loading}
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>My Friends</h2>
          {friends.length === 0 ? (
            <p>No friends yet.</p>
          ) : (
            <ul>
              {friends.map((f) => (
                <li key={f._id}>
                  {f.displayName} ({f.email}) – id: <code>{f._id}</code>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}