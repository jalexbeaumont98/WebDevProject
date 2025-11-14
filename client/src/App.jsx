import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import ScrollToTop from "./components/ScrollToTop"
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}


export default App
