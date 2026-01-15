import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Link as LinkIcon,
    Database,
    MessageSquare,
    Send,
    Globe,
    ChevronRight,
    Menu,
    Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ userProfile, checkPermission, setUserProfile }) => {
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Databases', icon: Database, path: '/databases' },
        { name: 'Follow Up', icon: MessageSquare, path: '/follow-up' },
        {
            name: 'Landing Page',
            icon: Globe,
            path: '/landing-page',
            locked: !checkPermission('landing_page')
        },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    // Add Admin Panel if super_admin
    if (userProfile?.role === 'super_admin') {
        // We don't have a real path yet for admin
    }

    const handleNavClick = (e, item) => {
        if (item.disabled) e.preventDefault();
        if (item.locked) {
            e.preventDefault();
            alert("This feature is available on the Pro plan.");
        }
    };

    return (
        <>
            <aside className={`sidebar ${isOpen ? 'open' : 'closed'} desktop-only`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">A</div>
                        {isOpen && <h1 className="logo-text">AgentApp</h1>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.disabled || item.locked ? '#' : item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive && !item.disabled && !item.locked ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${item.locked ? 'locked-nav-item' : ''}`
                            }
                            onClick={(e) => handleNavClick(e, item)}
                        >
                            <item.icon size={20} className="nav-icon" />
                            {isOpen && <span className="nav-text">{item.name}</span>}
                            {isOpen && item.badge && <span className="nav-badge">{item.badge}</span>}
                            {isOpen && item.locked && <span className="nav-lock-icon">🔒</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Developer Role Switcher (Compact) */}
                    {isOpen && (
                        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', fontSize: '0.75rem' }}>
                            <div style={{ marginBottom: '4px', fontWeight: 600, color: '#666' }}>DEV: Switch Role</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    onClick={() => setUserProfile(prev => ({ ...prev, role: 'free', planId: 'free' }))}
                                    style={{ flex: 1, padding: '2px', border: '1px solid #ddd', borderRadius: '4px', background: userProfile.role === 'free' ? '#333' : '#fff', color: userProfile.role === 'free' ? '#fff' : '#333', cursor: 'pointer' }}
                                >Free</button>
                                <button
                                    onClick={() => setUserProfile(prev => ({ ...prev, role: 'pro', planId: 'pro' }))}
                                    style={{ flex: 1, padding: '2px', border: '1px solid #ddd', borderRadius: '4px', background: userProfile.planId === 'pro' && userProfile.role !== 'super_admin' ? '#333' : '#fff', color: userProfile.planId === 'pro' && userProfile.role !== 'super_admin' ? '#fff' : '#333', cursor: 'pointer' }}
                                >Pro</button>
                                <button
                                    onClick={() => setUserProfile(prev => ({ ...prev, role: 'super_admin', planId: 'pro' }))}
                                    style={{ flex: 1, padding: '2px', border: '1px solid #ddd', borderRadius: '4px', background: userProfile.role === 'super_admin' ? '#333' : '#fff', color: userProfile.role === 'super_admin' ? '#fff' : '#333', cursor: 'pointer' }}
                                >Admin</button>
                            </div>
                        </div>
                    )}

                    <div className="user-info">
                        <div className="avatar">{userProfile?.name?.charAt(0) || 'D'}</div>
                        {isOpen && (
                            <div className="user-details">
                                <span className="user-name">{userProfile?.name || 'Agent'}</span>
                                <span className="user-role">{userProfile?.role === 'super_admin' ? 'Super Admin' : userProfile?.role === 'pro' ? 'Pro Agent' : 'Free Agent'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
