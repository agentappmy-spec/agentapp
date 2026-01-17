import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, Calendar, Plus } from 'lucide-react';
import '../MobileStyles.css';

const BottomNav = ({ onAddContact, checkPermission }) => {

    const handleLockedClick = (e) => {
        if (!checkPermission('landing_page')) {
            e.preventDefault();
            if (window.confirm("🚀 Landing Page Builder is a Pro feature.\n\nUpgrade now to create your professional landing page and grow your business!\n\nClick OK to view upgrade options.")) {
                window.location.href = '/settings?tab=billing';
            }
        }
    };

    return (
        <nav className="bottom-nav mobile-only">
            <NavLink to="/" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Dashboard</span>
            </NavLink>

            <NavLink to="/databases" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Users size={24} />
                <span>Databases</span>
            </NavLink>

            <div className="nav-fab-container">
                <button className="nav-fab" onClick={onAddContact}>
                    <Plus size={32} />
                </button>
            </div>

            <NavLink to="/follow-up" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <MessageSquare size={24} />
                <span>Follow Up</span>
            </NavLink>

            <NavLink
                to={checkPermission('landing_page') ? "/landing-page" : "#"}
                onClick={handleLockedClick}
                className={({ isActive }) => `nav-item-mobile ${isActive && checkPermission('landing_page') ? 'active' : ''}`}
            >
                <Calendar size={24} />
                <span>Your Page</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
