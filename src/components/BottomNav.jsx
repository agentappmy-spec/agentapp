import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MessageSquare, Calendar, Plus } from 'lucide-react';
import '../MobileStyles.css';

const BottomNav = ({ onAddContact, checkPermission }) => {

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

            <NavLink to="/landing-page" className={({ isActive }) => `nav-item-mobile ${isActive ? 'active' : ''}`}>
                <Calendar size={24} />
                <span>Your Page</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
