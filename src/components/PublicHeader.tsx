// src/components/PublicHeader.tsx

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
    FaHome,
    FaUserCircle,
    FaBook,
    FaBookReader,
    FaCalendar,
    FaUserShield,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    
} from "react-icons/fa"
import logo from "../assets/images/hikimalogo2.png"
import { useAuth } from "../context/AuthContext"

const PublicHeader = () => {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    
    // Function to check if a link is active
    const isActiveLink = (path: string) => {
        return location.pathname === path;
    }

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="public-header">
            <div className="logo">
                <div className="logo-icon">
                    <img src={logo} alt="Hikmah Logo" className="logo-img" />
                </div>
                <div className="logo-text">
                    <h2>Hikmah Premier Institute</h2>
                    <span>Online Islamic Education</span>
                </div>
            </div>

            <button
                type="button"
                className="menu-toggle"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            
            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                <div className={`nav-item ${isActiveLink("/") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaHome className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/" className="link" onClick={closeMenu}>Home</Link>
                    </div>
                </div>

                <div className={`nav-item ${isActiveLink("/courses") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaBookReader className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/courses" className="link" onClick={closeMenu}>Courses</Link>
                    </div>
                </div>
                
                <div className={`nav-item ${isActiveLink("/library") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaBook className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/library" className="link" onClick={closeMenu}>Library</Link>
                    </div>
                </div>
                
                <div className={`nav-item ${isActiveLink("/events") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaCalendar className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/events" className="link" onClick={closeMenu}>Events</Link>
                    </div>
                    
                </div>
            </div>
            
            <div className="user-account">
                {isAuthenticated ? (
                    <>
                        {user?.is_staff && (
                            <Link to="/admin" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
                                <FaUserShield /> Admin
                            </Link>
                        )}
                        <Link to="/my/learning" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
                            <FaBookReader /> My Learning
                        </Link>
                        <span>{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username}</span>
                        <FaUserCircle className="user-icon" />
                        <button
                            onClick={logout}
                            title="Log out"
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.75em', fontSize: '1.1em', display: 'flex', alignItems: 'center' }}
                        >
                            <FaSignOutAlt />
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="link" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                        <span>Account</span>
                        <FaUserCircle className="user-icon" />
                    </Link>
                )}
            </div>
        </header>
    )
}

export default PublicHeader