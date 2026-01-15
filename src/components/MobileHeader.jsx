import React from 'react';
import { Settings, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../MobileStyles.css';

const MobileHeader = ({ userProfile }) => {
    const navigate = useNavigate();

    return (
        <header className="mobile-header mobile-only">
            <div className="logo-container">
                <div className="logo-icon">A</div>
                <h1 className="logo-text">AgentApp</h1>
            </div>
            <div className="header-actions">
                <button className="header-icon-btn" onClick={() => navigate('/settings')}>
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;
