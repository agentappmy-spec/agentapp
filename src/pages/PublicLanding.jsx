import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import LandingRenderer from '../components/landing/LandingRenderer';

const PublicLanding = () => {
    const [config, setConfig] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const { username } = useParams();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                let query = supabase.from('profiles').select('landing_config, is_published, username, full_name, photo_url, title, bio, products, phone');

                // Check if URL is @username format or clean slug
                if (username) {
                    // Extract clean username (remove @ if present)
                    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
                    console.log('Looking for username:', cleanUsername);
                    query = query.eq('username', cleanUsername.toLowerCase());
                } else {
                    // Fall back to user_id query parameter (legacy)
                    const userId = searchParams.get('user_id');
                    if (!userId) {
                        setError('No username or user ID provided');
                        setLoading(false);
                        return;
                    }
                    query = query.eq('id', userId);
                }

                const { data, error: fetchError } = await query.single();

                if (fetchError) {
                    console.error('Error fetching landing config:', fetchError);
                    if (fetchError.code === 'PGRST116') {
                        setError('User not found');
                    } else {
                        setError('Failed to load page');
                    }
                    setLoading(false);
                    return;
                }

                console.log('Fetched data:', data);

                // Check if page is published
                if (!data?.is_published) {
                    console.log('Page not published');
                    setError('Page not published');
                    setLoading(false);
                    return;
                }

                if (data?.landing_config) {
                    setConfig(data.landing_config);
                    setProfile(data);
                } else {
                    setError('No landing page configured');
                }
            } catch (err) {
                console.error('Failed to load landing page:', err);
                setError('Something went wrong');
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
                <p>{error || "This page doesn't exist or hasn't been published yet."}</p>
                {username && <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>Looking for: @{username}</p>}
            </div>
        );
    }

    return (
        <div className="public-landing-page">
            <LandingRenderer config={config} profile={profile} />
            <footer style={{ textAlign: 'center', padding: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
                Powered by AgentApp
            </footer>
        </div>
    );
};

export default PublicLanding;
