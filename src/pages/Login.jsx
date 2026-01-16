import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; // Now valid
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('login'); // 'login', 'register'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    useEffect(() => {
        // If already logged in (via Supabase session), redirect
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/');
            } else {
                // Clear any stale local state if Supabase says we aren't logged in
                localStorage.removeItem('agent_user_profile');
            }
        };
        checkSession();
    }, [navigate]);

    // Clear messages on view switch
    useEffect(() => {
        setError('');
        setSuccess('');
    }, [view]);

    const loginSuccess = async (session) => {
        // We can still store profile in localStorage for fast access, 
        // but primarily rely on Supabase session.
        // For now, let's keep the mock profile structure in localStorage for compatibility 
        // with the rest of the app which expects 'agent_user_profile'.

        const user = session.user;
        let role = 'free';
        let planId = 'free';
        let name = user.user_metadata?.full_name || 'Agent';

        if (user.email.toLowerCase() === 'agentapp.my@gmail.com') {
            role = 'super_admin';
            planId = 'pro';
            name = 'Super Admin';
        }

        const newProfile = {
            name,
            role,
            planId,
            email: user.email,
            id: user.id,
            phone: '',
            photoUrl: '',
            bio: '',
            licenseNo: '',
            agencyName: '',
            social: { facebook: '', threads: '', tiktok: '', instagram: '' }
        };
        localStorage.setItem('agent_user_profile', JSON.stringify(newProfile));
        window.location.href = '/';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.session) {
                loginSuccess(data.session);
            }
        } catch (error) {
            console.error('Login Error:', error.message);
            setError(error.message || 'Failed to sign in.');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
                options: {
                    data: {
                        full_name: regName,
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                // 2. Send Welcome Email (Fire & Forget)


                loginSuccess(data.session);
            } else if (data.user && !data.session) {
                // Email confirmation required context
                setSuccess('Account created! Please check your email to verify.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Registration Error:', error.message);
            setError(error.message || 'Failed to create account.');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-icon-wrapper">
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Welcome</h1>
                    <p>Sign in to your account or create a new one</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`tab-btn ${view === 'login' ? 'active' : ''}`}
                        onClick={() => setView('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-btn ${view === 'register' ? 'active' : ''}`}
                        onClick={() => setView('register')}
                    >
                        Sign Up
                    </button>
                </div>

                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                {view === 'login' && (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : 'Sign In'}
                        </button>
                    </form>
                )}

                {view === 'register' && (
                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Ali Baba"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : 'Create Account'}
                        </button>
                    </form>
                )}

                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Login;
