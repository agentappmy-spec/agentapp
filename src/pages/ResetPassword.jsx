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
        // Check if we have the session from the URL hash (Supabase handles this automatically usually, 
        // but we need to ensure the user is actually authenticated to update the password)
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                // If the link is invalid or expired, they won't have a session here.
                setError('Invalid or expired reset link. Please try again.');
            }
        };
        checkSession();
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
