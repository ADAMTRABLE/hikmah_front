import logo from "../assets/images/hikimalogo2.png"

import {
    FaUserCircle,
    FaSignOutAlt,
    FaBars,
} from "react-icons/fa"
import { useAuth } from '../context/AuthContext'

type AdminHeaderProps = {
    onMenuClick?: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
    const { user, logout } = useAuth();

    return (
        <>
            <header className="admin-header">
                <div className="admin-header-left">
                    {onMenuClick && (
                        <button
                            type="button"
                            className="menu-toggle sidebar-toggle"
                            onClick={onMenuClick}
                            aria-label="Toggle sidebar menu"
                        >
                            <FaBars />
                        </button>
                    )}
                    <div className="logo">
                        <div className="logo-icon">
                            <img src={logo} alt="Hikmah Logo" className="logo-img" />
                        </div>
                        <div className="logo-text">
                            <h2>Hikmah Premier Institute</h2>
                            <span>Admin Control Center</span>
                        </div>
                    </div>
                </div>
                <div className="user-account">
                    <span>{user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Account'}</span>
                    <FaUserCircle className="user-icon" />
                    <button
                        onClick={logout}
                        title="Log out"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            marginLeft: '1em',
                            fontSize: '1.3em',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </header>

        </>
    )
}

export default AdminHeader;