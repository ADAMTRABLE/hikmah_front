import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Header from '../components/AdminHeader'
import AdminSidebar from '../components/AdminSidebar'
import { useAuth } from '../context/AuthContext'

const AdminLayout = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#1a5e63' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user?.is_staff) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', color: '#2c3e50', textAlign: 'center', padding: '0 20px' }}>
                <i className="fas fa-lock" style={{ fontSize: '2rem', color: '#c0392b' }}></i>
                <h2 style={{ margin: 0 }}>Admin access required</h2>
                <p style={{ margin: 0, color: '#6b7a80' }}>Your account doesn't have permission to view the Control Center.</p>
                <a href="/" style={{ color: '#1a5e63', fontWeight: 600 }}>Return to the site</a>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div style={{ display: 'flex' }}>
                <AdminSidebar />
                <main style={{ flex: 1, minWidth: 0, background: '#f5f7f7', minHeight: 'calc(100vh - 76px)' }}>
                    <Outlet />
                </main>
            </div>
        </>
    )
}

export default AdminLayout