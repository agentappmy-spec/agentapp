import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader, CheckCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [view, setView] = useState('login'); // 'login', 'register', 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // Demo Mock Data
    const DEMO_OTP = '123456';

    // Registration State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');

    useEffect(() => {
        // If already logged in, redirect
        const profile = localStorage.getItem('agent_user_profile');
        if (profile) navigate('/');
    }, [navigate]);

    const handleSendOtp = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock API Call
        setTimeout(() => {
            setIsLoading(false);
            setView('otp');
            // For demo convenience, we autofill standard emails if typing specific ones
        }, 1500);
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            if (otp === DEMO_OTP) {
                // Login Success Logic
                let role = 'free'; // Default
                let planId = 'free';
                let name = 'Agent';

                const targetEmail = view === 'register' ? regEmail.toLowerCase() : email.toLowerCase();

                if (targetEmail === 'agentapp.my@gmail.com') {
                    role = 'super_admin';
                    planId = 'pro'; // Admin gets pro features
                    name = 'Super Admin';
                } else if (targetEmail === 'pro@agentapp.my') {
                    role = 'pro';
                    planId = 'pro';
                    name = 'Pro Agent';
                } else {
                    role = 'free'; // 'free@agentapp.my' falls here
                    planId = 'free';
                    name = view === 'register' ? regName : 'Free Agent';
                }

                const newProfile = {
                    name,
                    role, // 'super_admin', 'pro', 'free'
                    planId,
                    email: targetEmail,
                    phone: '',
                    photoUrl: '',
                    bio: '',
                    licenseNo: '',
                    agencyName: '',
                    social: { facebook: '', threads: '', tiktok: '', instagram: '' }
                };

                localStorage.setItem('agent_user_profile', JSON.stringify(newProfile));
                // Force a hard reload to ensure all app state (Sidebar, Routes) updates correctly
                window.location.href = '/';
            } else {
                alert('Invalid OTP. Use 123456 for demo.');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-logo">
                        <ShieldCheck size={32} />
                    </div>
                    <h1>{view === 'register' ? 'Join AgentApp' : 'Welcome Back'}</h1>
                    <p>{view === 'otp' ? `We sent a code to ${view === 'register' ? regEmail : email}` : 'Enter your email to access your account'}</p>
                </div>

                {view === 'login' && (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-btn full-width" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : <>Send Login Code <ArrowRight size={18} /></>}
                        </button>
                        <div className="auth-footer">
                            <span>Don't have an account?</span>
                            <button type="button" className="link-btn" onClick={() => setView('register')}>Sign Up</button>
                        </div>
                    </form>
                )}

                {view === 'register' && (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Ali Baba"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon-wrapper">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-btn full-width" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                        <div className="auth-footer">
                            <span>Already have an account?</span>
                            <button type="button" className="link-btn" onClick={() => setView('login')}>Log In</button>
                        </div>
                    </form>
                )}

                {view === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <div className="form-group">
                            <label>Enter Demo OTP (Use: 123456)</label>
                            <div className="input-icon-wrapper">
                                <Lock size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    style={{ letterSpacing: '8px', fontWeight: 'bold', textAlign: 'center' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="primary-btn full-width" disabled={isLoading}>
                            {isLoading ? <Loader className="spin" size={18} /> : <>Verify & Login <CheckCircle size={18} /></>}
                        </button>
                        <div className="auth-footer">
                            <button type="button" className="link-btn" onClick={() => { setView('login'); setOtp(''); }}>Changed email?</button>
                        </div>
                    </form>
                )}

                {/* Demo Hint */}
                <div className="demo-hint">
                    <p><strong>Demo Access:</strong></p>
                    <p>Super Admin: <code>agentapp.my@gmail.com</code></p>
                    <p>Pro User: <code>pro@agentapp.my</code></p>
                    <p>Code: <code>123456</code></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
