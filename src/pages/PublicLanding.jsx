import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import LandingRenderer from '../components/landing/LandingRenderer';

const PublicLanding = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const { username } = useParams();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                let query = supabase.from('profiles').select('landing_config, is_published');

                // Check if URL is @username format
                if (username) {
                    query = query.eq('username', username.toLowerCase());
                } else {
                    // Fall back to user_id query parameter (legacy)
                    const userId = searchParams.get('user_id');
                    if (!userId) {
                        setLoading(false);
                        return;
                    }
                    query = query.eq('id', userId);
                }

                const { data, error } = await query.single();

                if (error) {
                    console.error('Error fetching landing config:', error);
                    setLoading(false);
                    return;
                }

                // Check if page is published
                if (!data?.is_published) {
                    console.log('Page not published');
                    setLoading(false);
                    return;
                }

                if (data?.landing_config) {
                    setConfig(data.landing_config);
                }
            } catch (err) {
                console.error('Failed to load landing page:', err);
            }
            setLoading(false);
        };

        fetchConfig();
    }, [searchParams, username]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    if (!config) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h1>Page Not Found</h1>
                <p>This page doesn't exist or hasn't been published yet.</p>
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
