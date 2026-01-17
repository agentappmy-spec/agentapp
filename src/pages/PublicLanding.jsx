import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import LandingRenderer from '../components/landing/LandingRenderer';

const PublicLanding = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Get user_id from URL query parameter
                const userId = searchParams.get('user_id');

                if (!userId) {
                    setLoading(false);
                    return;
                }

                // Fetch landing config from Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .select('landing_config')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching landing config:', error);
                } else if (data?.landing_config) {
                    setConfig(data.landing_config);
                }
            } catch (err) {
                console.error('Failed to load landing page:', err);
            }
            setLoading(false);
        };

        fetchConfig();
    }, [searchParams]);

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
