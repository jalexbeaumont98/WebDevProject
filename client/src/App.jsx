import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import ScrollToTop from "./components/ScrollToTop"

import Home from "./pages/Home.jsx"


function App() {
  return (
    <div className="main-content">
      <Navbar />   {/* navbar component */}
      <ScrollToTop />  {/* This resets scroll on route change */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  )
}

export default App
