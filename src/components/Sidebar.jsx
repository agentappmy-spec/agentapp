import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    MessageSquare,
    Globe,
    Settings,
    Crown,
    LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const profile = JSON.parse(localStorage.getItem('agent_user_profile') || '{}');
    const isSuperAdmin = profile.role === 'super_admin';

    const handleLogout = () => {
        localStorage.removeItem('agent_user_profile');
        navigate('/login');
    };

    return (
        <aside className={`sidebar desktop-only`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>🚀</span>
                    <h1 className="logo-text">AgentApp</h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} className="nav-icon" />
                    <span className="nav-text">Dashboard</span>
                </NavLink>

                <NavLink to="/databases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Database size={20} className="nav-icon" />
                    <span className="nav-text">Databases</span>
                </NavLink>

                <NavLink to="/follow-up" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <MessageSquare size={20} className="nav-icon" />
                    <span className="nav-text">Follow Up</span>
                </NavLink>

                <NavLink to="/landing-page" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Globe size={20} className="nav-icon" />
                    <span className="nav-text">Landing Page</span>
                </NavLink>

                {isSuperAdmin && (
                    <NavLink to="/super-admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Crown size={20} className="nav-icon" color="#eab308" />
                        <span className="nav-text">Super Admin</span>
                    </NavLink>
                )}

                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} className="nav-icon" />
                    <span className="nav-text">Settings</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={handleLogout}
                    className="logout-btn"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: '#0f172a', /* Premium Dark */
                        border: '1px solid #0f172a',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 500,
                        justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#1e293b';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#0f172a';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
