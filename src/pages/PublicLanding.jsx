import React, { useState, useEffect } from 'react';
import LandingRenderer from '../components/landing/LandingRenderer';

const PublicLanding = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching from database
        // In a real app, we would fetch /api/agents/:id/landing-config
        const saved = localStorage.getItem('agent_landing_config');
        if (saved) {
            setConfig(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    if (!config) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h1>Page Not Found</h1>
                <p>This agent has not published a landing page yet.</p>
            </div>
        );
    }

    return (
        <div className="public-landing-page">
            <LandingRenderer config={config} />
            <footer style={{ textAlign: 'center', padding: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                Powered by AgentApp
            </footer>
        </div>
    );
};

export default PublicLanding;
