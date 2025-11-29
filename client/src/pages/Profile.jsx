// client/src/pages/Profile.jsx
import { useAuth } from "../context/AuthContext";

/*

TODO Add stats like amount of games, win percentages, etc

*/

export default function Profile() {
  const { auth } = useAuth();

  if (!auth?.user) {
    return (
      <main className="page-container">
        <div className="card">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Loading user info...</p>
        </div>
      </main>
    );
  }

  const { name, email, _id } = auth.user;

  return (
    <main className="page-container">
      
      <div className="card">
        <h1 className="page-title">Your profile</h1>
        <p className="page-subtitle">
          This is the account you use to play Guessr and connect with friends.
        </p>

        <div className="item-list">
          <div className="item-row">
            <div className="item-row-header">
              <span className="item-row-meta">Display name</span>
            </div>
            <div>{name || "(not set)"}</div>
          </div>

          <div className="item-row">
            <div className="item-row-header">
              <span className="item-row-meta">Email</span>
            </div>
            <div>{email}</div>
          </div>

          <div className="item-row">
            <div className="item-row-header">
              <span className="item-row-meta">User ID</span>
            </div>
            <div>
              <code>{_id}</code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}