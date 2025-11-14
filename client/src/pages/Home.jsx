import { useEffect } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../context/AuthContext";

/*

TODO

Home page right now just shows your name and gives you a logout button, should probably a button to go to your most 
recent active game or something.


*/

export default function Home() {
  const { auth, signout } = useAuth();
  return (
    <div style={{ maxWidth: 720, margin: "80px auto", padding: 16 }}>
      <h1>Welcome{auth?.user ? `, ${auth.user.name || auth.user.displayName}` : ""}!</h1>
      <p>You’re signed in. This page is protected.</p>
      <button onClick={signout}>Sign out</button>
    </div>
  );
}