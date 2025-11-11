import { useEffect } from "react"
import { Link } from "react-router-dom"


function Home() {
  useEffect(() => {
    document.title = "Home | Number Game"
  }, [])

  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the number game!
      </p>
    </div>
  );
}

export default Home;