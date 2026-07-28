// src/components/PublicHeader.tsx

import { Link, useLocation } from "react-router-dom"
import {
    FaHome,
    FaUserCircle,
    FaBook,
    FaBookReader,
    FaCalendar,
    FaUserShield,
    FaSignOutAlt,
    
} from "react-icons/fa"
import logo from "../assets/images/hikimalogo2.png"
import { useAuth } from "../context/AuthContext"

const PublicHeader = () => {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    
    // Function to check if a link is active
    const isActiveLink = (path: string) => {
        return location.pathname === path;
    }

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
            
            <div className="nav-links">
                <div className={`nav-item ${isActiveLink("/") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaHome className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/" className="link">Home</Link>
                    </div>
                </div>

                <div className={`nav-item ${isActiveLink("/courses") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaBookReader className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/courses" className="link">Courses</Link>
                    </div>
                </div>
                
                <div className={`nav-item ${isActiveLink("/library") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaBook className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/library" className="link">Library</Link>
                    </div>
                </div>
                
                <div className={`nav-item ${isActiveLink("/events") ? "active" : ""}`}>
                    <div className="nav-icon">
                        <FaCalendar className="link-icon" />
                    </div>
                    <div className="nav-link">
                        <Link to="/events" className="link">Events</Link>
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