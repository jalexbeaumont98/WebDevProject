import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import ScrollToTop from "./components/ScrollToTop"
import ProtectedRoute from "./auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";


function App() {
  return (
    <div className="main-content">
      {/*<Navbar />    navbar component */}
      {/*<ScrollToTop />   This resets scroll on route change */}
      <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      {/* add more protected pages like above */}
    </Routes>
    </div>
  )
}


export default App
