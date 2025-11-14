// client/src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

/*

TODO Add stats like amount of games, win percentages, etc

*/

export default function Profile() {
  const { auth } = useAuth();

  if (!auth?.user) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1>Profile</h1>
          <p>Loading user info...</p>
        </div>
      </div>
    );
  }

  const { displayName, email } = auth.user;

  return (
    <div className="page-container">
      <div className="page-content">
        <h1>Your Profile</h1>
        <p><strong>Name:</strong> {displayName}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>
    </div>
  );
}