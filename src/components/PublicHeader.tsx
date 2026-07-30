// // src/components/PublicHeader.tsx

// import { Link, useLocation } from "react-router-dom"
// import {
//     FaHome,
//     FaUserCircle,
//     FaBook,
//     FaBookReader,
//     FaCalendar,
//     FaUserShield,
//     FaSignOutAlt,
    
// } from "react-icons/fa"
// import logo from "../assets/images/hikimalogo2.png"
// import { useAuth } from "../context/AuthContext"

// const PublicHeader = () => {
//     const location = useLocation();
//     const { user, isAuthenticated, logout } = useAuth();
    
//     // Function to check if a link is active
//     const isActiveLink = (path: string) => {
//         return location.pathname === path;
//     }

//     return (
//         <header className="public-header">
//             <div className="logo">
//                 <div className="logo-icon">
//                     <img src={logo} alt="Hikmah Logo" className="logo-img" />
//                 </div>
//                 <div className="logo-text">
//                     <h2>Hikmah Premier Institute</h2>
//                     <span>Online Islamic Education</span>
//                 </div>
//             </div>
            
//             <div className="nav-links">
//                 <div className={`nav-item ${isActiveLink("/") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaHome className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/" className="link">Home</Link>
//                     </div>
//                 </div>

//                 <div className={`nav-item ${isActiveLink("/courses") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaBookReader className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/courses" className="link">Courses</Link>
//                     </div>
//                 </div>
                
//                 <div className={`nav-item ${isActiveLink("/library") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaBook className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/library" className="link">Library</Link>
//                     </div>
//                 </div>
                
//                 <div className={`nav-item ${isActiveLink("/events") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaCalendar className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/events" className="link">Events</Link>
//                     </div>
                    
//                 </div>
//             </div>
            
//             <div className="user-account">
//                 {isAuthenticated ? (
//                     <>
//                         {user?.is_staff && (
//                             <Link to="/admin" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                                 <FaUserShield /> Admin
//                             </Link>
//                         )}
//                         <Link to="/my/learning" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                             <FaBookReader /> My Learning
//                         </Link>
//                         <span>{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username}</span>
//                         <FaUserCircle className="user-icon" />
//                         <button
//                             onClick={logout}
//                             title="Log out"
//                             style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.75em', fontSize: '1.1em', display: 'flex', alignItems: 'center' }}
//                         >
//                             <FaSignOutAlt />
//                         </button>
//                     </>
//                 ) : (
//                     <Link to="/login" className="link" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
//                         <span>Account</span>
//                         <FaUserCircle className="user-icon" />
//                     </Link>
//                 )}
//             </div>
//         </header>
//     )
// }

// export default PublicHeader

// src/components/PublicHeader.tsx

// import { useState } from "react"
// import { Link, useLocation } from "react-router-dom"
// import {
//     FaHome,
//     FaUserCircle,
//     FaBook,
//     FaBookReader,
//     FaCalendar,
//     FaUserShield,
//     FaSignOutAlt,
//     FaBars,
//     FaTimes,
// } from "react-icons/fa"
// import logo from "../assets/images/hikimalogo2.png"
// import { useAuth } from "../context/AuthContext"
// import "./PublicHeader.responsive.css"

// const PublicHeader = () => {
//     const location = useLocation();
//     const { user, isAuthenticated, logout } = useAuth();
//     const [menuOpen, setMenuOpen] = useState(false);

//     // Function to check if a link is active
//     const isActiveLink = (path: string) => {
//         return location.pathname === path;
//     }

//     const closeMenu = () => setMenuOpen(false);

//     return (
//         <header className="public-header">
//             <div className="logo">
//                 <div className="logo-icon">
//                     <img src={logo} alt="Hikmah Logo" className="logo-img" />
//                 </div>
//                 <div className="logo-text">
//                     <h2>Hikmah Premier Institute</h2>
//                     <span>Online Islamic Education</span>
//                 </div>
//             </div>

//             {/* Hamburger toggle - visible only on small screens */}
//             <button
//                 className="menu-toggle"
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 aria-label={menuOpen ? "Close menu" : "Open menu"}
//                 aria-expanded={menuOpen}
//             >
//                 {menuOpen ? <FaTimes /> : <FaBars />}
//             </button>

//             {/* Overlay for mobile menu */}
//             {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

//             <div className={`nav-links ${menuOpen ? "open" : ""}`}>
//                 <div className={`nav-item ${isActiveLink("/") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaHome className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/" className="link" onClick={closeMenu}>Home</Link>
//                     </div>
//                 </div>

//                 <div className={`nav-item ${isActiveLink("/courses") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaBookReader className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/courses" className="link" onClick={closeMenu}>Courses</Link>
//                     </div>
//                 </div>

//                 <div className={`nav-item ${isActiveLink("/library") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaBook className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/library" className="link" onClick={closeMenu}>Library</Link>
//                     </div>
//                 </div>

//                 <div className={`nav-item ${isActiveLink("/events") ? "active" : ""}`}>
//                     <div className="nav-icon">
//                         <FaCalendar className="link-icon" />
//                     </div>
//                     <div className="nav-link">
//                         <Link to="/events" className="link" onClick={closeMenu}>Events</Link>
//                     </div>
//                 </div>

//                 {/* Account section is duplicated into the mobile slide-in menu */}
//                 <div className="user-account mobile-account">
//                     {isAuthenticated ? (
//                         <>
//                             {user?.is_staff && (
//                                 <Link to="/admin" className="link" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                                     <FaUserShield /> Admin
//                                 </Link>
//                             )}
//                             <Link to="/my/learning" className="link" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                                 <FaBookReader /> My Learning
//                             </Link>
//                             <span>{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username}</span>
//                             <FaUserCircle className="user-icon" />
//                             <button
//                                 onClick={() => { logout(); closeMenu(); }}
//                                 title="Log out"
//                                 style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.75em', fontSize: '1.1em', display: 'flex', alignItems: 'center' }}
//                             >
//                                 <FaSignOutAlt />
//                             </button>
//                         </>
//                     ) : (
//                         <Link to="/login" className="link" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
//                             <span>Account</span>
//                             <FaUserCircle className="user-icon" />
//                         </Link>
//                     )}
//                 </div>
//             </div>

//             {/* Desktop-only account section (hidden on mobile via CSS) */}
//             <div className="user-account desktop-account">
//                 {isAuthenticated ? (
//                     <>
//                         {user?.is_staff && (
//                             <Link to="/admin" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                                 <FaUserShield /> Admin
//                             </Link>
//                         )}
//                         <Link to="/my/learning" className="link" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}>
//                             <FaBookReader /> My Learning
//                         </Link>
//                         <span>{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username}</span>
//                         <FaUserCircle className="user-icon" />
//                         <button
//                             onClick={logout}
//                             title="Log out"
//                             style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.75em', fontSize: '1.1em', display: 'flex', alignItems: 'center' }}
//                         >
//                             <FaSignOutAlt />
//                         </button>
//                     </>
//                 ) : (
//                     <Link to="/login" className="link" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
//                         <span>Account</span>
//                         <FaUserCircle className="user-icon" />
//                     </Link>
//                 )}
//             </div>
//         </header>
//     )
// }

// export default PublicHeader

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
import "./PublicHeader.responsive.css"

const navItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/courses", label: "Courses", icon: FaBookReader },
    { path: "/library", label: "Library", icon: FaBook },
    { path: "/events", label: "Events", icon: FaCalendar },
]

const PublicHeader = () => {
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActiveLink = (path: string) => location.pathname === path;
    const closeMenu = () => setMenuOpen(false);

    // Single source of truth for the account block — rendered for both
    // mobile (onClick closes the menu) and desktop (no-op close).
    const renderAccount = (onNavigate: () => void = () => {}) => (
        <>
            {isAuthenticated ? (
                <>
                    {user?.is_staff && (
                        <Link
                            to="/admin"
                            className="link"
                            onClick={onNavigate}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}
                        >
                            <FaUserShield /> Admin
                        </Link>
                    )}
                    <Link
                        to="/my/learning"
                        className="link"
                        onClick={onNavigate}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '1em' }}
                    >
                        <FaBookReader /> My Learning
                    </Link>
                    <span>{`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username}</span>
                    <FaUserCircle className="user-icon" />
                    <button
                        onClick={() => { logout(); onNavigate(); }}
                        title="Log out"
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.75em', fontSize: '1.1em', display: 'flex', alignItems: 'center' }}
                    >
                        <FaSignOutAlt />
                    </button>
                </>
            ) : (
                <Link
                    to="/login"
                    className="link"
                    onClick={onNavigate}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
                >
                    <span>Account</span>
                    <FaUserCircle className="user-icon" />
                </Link>
            )}
        </>
    );

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
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {menuOpen && <div className="menu-overlay" onClick={closeMenu} />}

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                {navItems.map(({ path, label, icon: Icon }) => (
                    <div key={path} className={`nav-item ${isActiveLink(path) ? "active" : ""}`}>
                        <div className="nav-icon">
                            <Icon className="link-icon" />
                        </div>
                        <div className="nav-link">
                            <Link to={path} className="link" onClick={closeMenu}>{label}</Link>
                        </div>
                    </div>
                ))}

                <div className="user-account mobile-account">
                    {renderAccount(closeMenu)}
                </div>
            </div>

            <div className="user-account desktop-account">
                {renderAccount()}
            </div>
        </header>
    )
}

export default PublicHeader