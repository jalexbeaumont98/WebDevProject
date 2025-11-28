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
  const currentUserId = auth?.user?._id;

  // Handles either an id string OR a populated object like { _id: "..." }
  const idOf = (v) => (v && typeof v === "object" ? v._id : v);

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
      setError(err.message || "Failed to update friend request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="card">
        <h1 className="page-title">Friends</h1>
        <p className="page-subtitle">
          Add friends using their user ID for now, manage pending requests, and
          view your current friend list.
        </p>

        {error && <p className="auth-error">{error}</p>}

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 className="section-title">Send friend request</h2>
          <p className="section-subtitle">
            Paste another user&apos;s ID (MongoDB _id). Later, we can support
            searching by name or email.
          </p>

          <form className="form-grid" onSubmit={handleSendRequest}>
            <div className="form-field">
              <label className="form-label">Friend user ID</label>
              <input
                className="form-input"
                type="text"
                placeholder="Opponent userId (Mongo _id)"
                value={newFriendId}
                onChange={(e) => setNewFriendId(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending…" : "Send request"}
            </button>
          </form>
        </section>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 className="section-title">Friend requests</h2>
          {requests.length === 0 ? (
            <p className="section-subtitle">No friend requests yet.</p>
          ) : (
            <ul className="item-list">
              {requests.map((r) => {
                const isIncoming =
                  String(idOf(r.toUserId)) === String(currentUserId);

                return (
                  <li key={r._id} className="item-row">
                    <div className="item-row-header">
                      <span className="item-row-meta">Status: {r.status}</span>

                      {r.status === "pending" && (
                        <span className="status-pill status-pill--waiting">
                          {isIncoming ? "Incoming" : "Outgoing"}
                        </span>
                      )}
                    </div>

                    <div className="item-row-meta">
                      From: {r.fromUserId?.displayName || idOf(r.fromUserId)}
                      <br />
                      To: {r.toUserId?.displayName || idOf(r.toUserId)}
                    </div>

                    {r.status === "pending" && isIncoming && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleRespond(r._id, "accept")}
                          disabled={loading}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleRespond(r._id, "decline")}
                          disabled={loading}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="section-title">My friends</h2>
          {friends.length === 0 ? (
            <p className="section-subtitle">No friends yet.</p>
          ) : (
            <ul className="item-list">
              {friends.map((f) => (
                <li key={f._id} className="item-row">
                  <div className="item-row-header">
                    <span>
                      {f.displayName} ({f.email})
                    </span>
                  </div>
                  <div className="item-row-meta">
                    id: <code>{f._id}</code>
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
