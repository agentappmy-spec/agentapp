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

import { supabase } from '../services/supabaseClient';

const Sidebar = ({ userProfile, checkPermission, setUserProfile }) => {
    const navigate = useNavigate();
    const isSuperAdmin = userProfile?.role === 'super_admin';

    const handleLogout = async () => {
        try {
            // 1. Sign out from Supabase
            await supabase.auth.signOut();

            // 2. Clear state in App.jsx
            if (setUserProfile) setUserProfile(null);

            // 3. Redirect
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: still redirect
            navigate('/login');
        }
    };

    return (
        <aside className={`sidebar desktop-only`}>
            <div className="sidebar-header">
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#0f172a',
                        color: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '18px'
                    }}>A</div>
                    <h1 className="logo-text" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>AgentApp</h1>
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
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#64748b', /* Muted gray */
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 500,
                        justifyContent: 'flex-start' /* Align left like other nav items */
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                    }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
