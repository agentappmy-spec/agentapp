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
                    className="nav-item"
                    style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        justifyContent: 'flex-start'
                    }}
                >
                    <LogOut size={20} className="nav-icon" />
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
