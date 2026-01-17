import React from 'react';
import { Settings, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../MobileStyles.css';

const MobileHeader = ({ userProfile }) => {
    const navigate = useNavigate();
    const isSuperAdmin = userProfile?.role === 'super_admin';

    return (
        <header className="mobile-header mobile-only">
            <div className="logo-container">
                <div className="logo-icon">A</div>
                <h1 className="logo-text">AgentApp</h1>
            </div>
            <div className="header-actions">
                {isSuperAdmin && (
                    <button className="header-icon-btn" onClick={() => navigate('/super-admin')} style={{ color: '#eab308' }}>
                        <Crown size={20} />
                    </button>
                )}
                <button className="header-icon-btn" onClick={() => navigate('/settings')}>
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;
