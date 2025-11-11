// src/components/Navbar.jsx
import { NavLink } from "react-router-dom"
import "./Navbar.css"

function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                    Home
                </NavLink>
                {/*
                <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                    About
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => (isActive ? "active" : "")}>
                    Projects
                </NavLink>
                <NavLink to="/education" className={({ isActive }) => (isActive ? "active" : "")}>
                    Education
                </NavLink>
                <NavLink to="/services" className={({ isActive }) => (isActive ? "active" : "")}>
                    Services
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                    Contact
                </NavLink>
                */}
            </div>
        </nav>
    )
}

export default Navbar