import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Loader } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import './Login.css'; // Re-use login styles

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const handleSessionCheck = async () => {
            // 1. Check if we already have a session
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession) return;

            // 2. Check for PKCE token_hash in URL
            const params = new URLSearchParams(window.location.search);
            const token_hash = params.get('token_hash');
            const type = params.get('type');

            if (token_hash && type) {
                setIsLoading(true);
                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type,
                });
                setIsLoading(false);

                if (error) {
                    console.error('Verify OTP Error:', error);
                    setError('Invalid or expired reset link. Please try again.');
                }
                // If success, Supabase sets the session automatically
            } else {
                // If no session and no token, show error (unless it's just loading)
                setError('Invalid or expired reset link. Please try again.');
            }
        };

        handleSessionCheck();

        // Listen for auth state changes (successful recovery login)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                setError('');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Update Password Error:', error.message);
            setError(error.message);
        } finally {
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
                    <h1>Reset Password</h1>
                    <p>Enter your new password below.</p>
                </div>

                {error && <div className="auth-message error">{error}</div>}
                {success && <div className="auth-message success">{success}</div>}

                <form onSubmit={handleUpdatePassword} className="auth-form">
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={6}
                            />
                        </div>
                    </div>
                    <button type="submit" className="primary-btn" disabled={isLoading || !!success}>
                        {isLoading ? <Loader className="spin" size={18} /> : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
