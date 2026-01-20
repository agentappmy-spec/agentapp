import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import TermsModal from '../components/TermsModal';
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
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    useEffect(() => {
        // If already logged in (via Supabase session), redirect
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/');
            } else {
                // Not logged in - user will see login form
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
        const user = session.user;
        let role = 'free';
        let planId = 'free';
        let name = user.user_metadata?.full_name || 'Agent';

        // Allow original email OR new backup admin email
        if (user.email.toLowerCase() === 'agentapp.my@gmail.com' || user.email.toLowerCase() === 'admin@agentapp.my') {
            role = 'super_admin';
            planId = 'pro';
            name = 'Super Admin';
        }

        try {
            // 1. Sync to Supabase 'profiles' table
            // Check if profile exists first to prevent overwriting 'pro' role with default 'free'
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role, plan_id')
                .eq('id', user.id)
                .single();

            const isSuperAdminEmail = user.email.toLowerCase() === 'agentapp.my@gmail.com' || user.email.toLowerCase() === 'admin@agentapp.my';

            if (isSuperAdminEmail) {
                // Force update for Super Admin
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    full_name: name,
                    role: 'super_admin',
                    plan_id: 'pro',
                    updated_at: new Date()
                });
            } else if (existingProfile) {
                // Existing user: Update basic info ONLY. Preserve role/plan!
                await supabase.from('profiles').update({
                    email: user.email,
                    full_name: name,
                    updated_at: new Date()
                }).eq('id', user.id);
            } else {
                // New user: Insert with defaults
                await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    full_name: name,
                    phone: user.user_metadata?.phone || '',
                    role: 'free',
                    plan_id: 'free',
                    updated_at: new Date()
                });
            }
        } catch (err) {
            console.warn('Profile sync failed:', err);
        }

        // 2. Navigate (profile will be loaded from DB by App.jsx)
        window.location.href = '/';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) throw error;

            if (data.session) {
                loginSuccess(data.session);
            }
        } catch (error) {
            console.error('Login Error:', error.message);
            let msg = error.message;
            if (msg.includes('Invalid login credentials')) {
                msg = 'Invalid credentials. If you just signed up, please verify your email first.';
            }
            setError(msg || 'Failed to sign in.');
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            setSuccess('Password reset link sent! Check your email.');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validate terms acceptance
        if (!termsAccepted) {
            setError('Please accept the Terms and Conditions to continue.');
            setIsLoading(false);
            return;
        }

        // Validate phone format (basic check)
        if (!regPhone || regPhone.trim().length < 10) {
            setError('Please enter a valid phone number.');
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: regEmail.trim(),
                password: regPassword,
                options: {
                    data: {
                        full_name: regName,
                        phone: regPhone.trim(),
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                loginSuccess(data.session);
            } else if (data.user && !data.session) {
                // Email confirmation required
                setSuccess('Account created! Please check your email to verify your account before logging in.');
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
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'right', display: 'block', width: '100%', marginTop: '0.5rem' }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : 'Sign In'}
                        </button>
                    </form>
                )}

                {view === 'register' && (
                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="form-group">
                            <label>Full Name *</label>
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
                            <label>Email Address *</label>
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
                            <label>Phone Number *</label>
                            <div className="input-wrapper">
                                <Phone className="input-icon" size={18} />
                                <input
                                    type="tel"
                                    required
                                    placeholder="e.g. 0123456789"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Create Password *</label>
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
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="terms-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    required
                                />
                                <span>
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            padding: 0,
                                            font: 'inherit'
                                        }}
                                    >
                                        Terms and Conditions
                                    </button>
                                </span>
                            </label>
                        </div>
                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : 'Create Account'}
                        </button>
                    </form>
                )}

                <TermsModal
                    isOpen={showTermsModal}
                    onClose={() => setShowTermsModal(false)}
                />

                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Login;
