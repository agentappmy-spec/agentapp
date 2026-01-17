import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, Globe, Plus, Crown } from 'lucide-react';
import '../MobileStyles.css';

const BottomNav = ({ onAddContact, checkPermission }) => {
    const profile = JSON.parse(localStorage.getItem('agent_user_profile') || '{}');
    const isSuperAdmin = profile.role === 'super_admin';

    return (
        <nav className="bottom-nav mobile-only">
            <NavLink to="/" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>

            <NavLink to="/databases" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Users size={24} />
                <span>DB</span>
            </NavLink>

            <div className="nav-fab-container">
                <button className="nav-fab" onClick={onAddContact}>
                    <Plus size={32} />
                </button>
            </div>

            <NavLink to="/follow-up" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <MessageSquare size={24} />
                <span>Msgs</span>
            </NavLink>

            <NavLink to="/landing-page" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Globe size={24} />
                <span>Page</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
