import React, { useState } from 'react';
import { useOutletContext, useSearchParams, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Save, Tag, Package, Plus, Trash2, Edit2, MessageCircle, MessageSquare, Target, Facebook, Instagram, AtSign, Video, FileText, Globe, LogOut, Check, X, Star, Clock } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import MessageLogs from './MessageLogs';
import './Settings.css';

const Settings = () => {
    const {
        availableTags,
        setAvailableTags,
        availableProducts,
        setAvailableProducts,
        userProfile,
        setUserProfile,
        integrations,
        setIntegrations,
        checkPermission,
        userGoals,
        setUserGoals,
        contacts
    } = useOutletContext();

    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Check both URL params and navigation state for activeTab
    const initialTab = location.state?.activeTab || searchParams.get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Initialize view based on screen width
    // On Desktop (>900px), this state is ignored by CSS
    const [mobileView, setMobileView] = useState(window.innerWidth <= 900 ? 'menu' : 'content');
    const [usernameError, setUsernameError] = useState('');

    // Helper to switch tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (window.innerWidth <= 900) {
            setMobileView('content');
        }
    };

    const handleBack = () => {
        setMobileView('menu');
    };

    // Profile State managed by global context now
    // Local state for form editing if needed, but for now direct update or optional local buffer
    // Let's use direct update for simplicity as per requirements ("1 click")

    const updateProfile = (field, value) => {
        setUserProfile(prev => ({ ...prev, [field]: value }));
    };

    // Integration Logic
    const toggleIntegration = (key) => {
        setIntegrations(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled }
        }));
    };

    // Payment Logic
    const [upgradePlan, setUpgradePlan] = useState('monthly');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [plans, setPlans] = useState([]);

    React.useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data, error } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true });
                if (error) throw error;
                if (data && data.length > 0) {
                    setPlans(data);
                } else {
                    // Fallback if empty
                    throw new Error('No plans found');
                }
            } catch (err) {
                console.warn('Using default plans (DB fetch failed):', err);
                setPlans([
                    {
                        id: 'free',
                        name: 'Free Starter',
                        price_monthly: 0,
                        price_yearly: 0,
                        contact_limit: 50,
                        features: ["Email Only", "Dashboard", "Keep your client contact safe"]
                    },
                    {
                        id: 'pro',
                        name: 'Pro',
                        price_monthly: 22,
                        price_yearly: 220,
                        contact_limit: 1000,
                        features: ["WhatsApp", "SMS", "Email", "Auto Follow Up", "Auto Reminder", "Landing Page", "Analytics"]
                    }
                ]);
            }
        };
        fetchPlans();
    }, []);

    const handleUpgradePayment = async (targetPlanId, targetInterval) => {
        setIsProcessingPayment(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-chip-purchase', {
                body: {
                    email: userProfile.email,
                    planId: targetPlanId,
                    interval: targetInterval,
                    successUrl: window.location.origin + '/settings?billing=success',
                    failureUrl: window.location.origin + '/settings?billing=failed'
                }
            });

            if (error) throw error;
            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert('Payment initialization failed. Please try again.');
            }
        } catch (err) {
            console.error('Payment Error:', err);
            alert('Failed to start payment. Server might be busy.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Promo Code Logic
    const [promoCode, setPromoCode] = useState('');
    const handleRedeemCode = async () => {
        if (!promoCode.trim()) return;

        try {
            // Fetch promo code from database
            const { data: promoData, error: fetchError } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .single();

            if (fetchError || !promoData) {
                alert('❌ Invalid promo code. Please check and try again.');
                return;
            }

            // Validate promo code
            if (promoData.status !== 'ACTIVE') {
                alert('❌ This promo code is no longer active.');
                return;
            }

            // Check expiry
            if (promoData.expiry && promoData.expiry !== 'Never') {
                const expiryDate = new Date(promoData.expiry);
                if (expiryDate < new Date()) {
                    alert('❌ This promo code has expired.');
                    return;
                }
            }

            // Check usage limit
            if (promoData.usage_limit > 0 && promoData.usage_count >= promoData.usage_limit) {
                alert('❌ This promo code has reached its usage limit.');
                return;
            }

            // Apply reward based on reward text
            const reward = promoData.reward.toLowerCase();
            let updateData = {};
            let successMessage = '';

            if (reward.includes('30 days pro trial') || reward.includes('pro trial')) {
                // Grant 30-day Pro trial
                const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                updateData = {
                    plan_id: 'pro',
                    subscription_end_date: expiryDate.toISOString()
                };
                // IMPORTANT: Do NOT change role - preserve existing role (especially super_admin)
                successMessage = `🎉 Code Redeemed! You now have PRO access until ${expiryDate.toLocaleDateString()}.`;
            } else if (reward.includes('50% off') || reward.includes('discount')) {
                // For discount codes, just show a message (payment integration needed for actual discount)
                alert(`✅ Promo code "${promoCode}" validated!\n\n${promoData.reward}\n\nThis discount will be applied at checkout.`);
                setPromoCode('');

                // Increment usage count for discount codes too
                await supabase
                    .from('promo_codes')
                    .update({ usage_count: promoData.usage_count + 1 })
                    .eq('id', promoData.id);

                return;
            } else {
                // Generic reward - grant Pro access
                const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                updateData = {
                    plan_id: 'pro',
                    subscription_end_date: expiryDate.toISOString()
                };
                // IMPORTANT: Do NOT change role
                successMessage = `🎉 Code Redeemed! ${promoData.reward}`;
            }

            // Update user profile in database (ONLY plan_id and subscription_end_date, NOT role)
            const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userProfile.id);

            if (updateError) {
                console.error('Profile update error:', updateError);
                alert('❌ Redemption failed. Please try again.');
                return;
            }

            // Increment usage count
            await supabase
                .from('promo_codes')
                .update({ usage_count: promoData.usage_count + 1 })
                .eq('id', promoData.id);

            // Update local state (preserve role, only update planId and subscription_end_date)
            setUserProfile({
                ...userProfile,
                planId: updateData.plan_id,
                subscription_end_date: updateData.subscription_end_date
                // NOTE: role is intentionally NOT updated here
            });

            alert(successMessage);
            setPromoCode('');

        } catch (error) {
            console.error('Promo code redemption error:', error);
            alert('❌ An error occurred. Please try again.');
        }
    };

    // Tag Manager Logic (Inline)
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [managerTab, setManagerTab] = useState('products'); // sub-tab within Config

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        if (managerTab === 'products') setAvailableProducts([...availableProducts, newItemName.trim()]);
        else setAvailableTags([...availableTags, newItemName.trim()]);
        setNewItemName('');
    };

    const handleDeleteItem = (item) => {
        // Protection: AgentApp Leads cannot be deleted
        if (item === 'AgentApp Leads') {
            alert('Cannot delete "AgentApp Leads". This is a system tag for leads from the public form.');
            return;
        }

        // Validation: Check if item is used in contacts
        const isUsed = contacts.some(contact => {
            if (managerTab === 'products') {
                return contact.products && contact.products.includes(item);
            } else {
                return contact.tags && contact.tags.includes(item);
            }
        });

        if (isUsed) {
            alert(`Cannot delete "${item}". It is currently assigned to one or more contacts.`);
            return;
        }

        if (confirm(`Are you sure you want to delete "${item}"?`)) {
            if (managerTab === 'products') setAvailableProducts(availableProducts.filter(i => i !== item));
            else setAvailableTags(availableTags.filter(i => i !== item));
        }
    };

    const startEditing = (item) => {
        // Protection: AgentApp Leads cannot be edited
        if (item === 'AgentApp Leads') {
            alert('Cannot edit "AgentApp Leads". This is a system tag for leads from the public form.');
            return;
        }
        setEditingId(item);
        setEditName(item);
    };

    const saveEdit = () => {
        if (!editName.trim()) return;
        if (managerTab === 'products') {
            setAvailableProducts(availableProducts.map(i => i === editingId ? editName.trim() : i));
        } else {
            setAvailableTags(availableTags.map(i => i === editingId ? editName.trim() : i));
        }
        setEditingId(null);
    };

    const SettingsCard = ({ icon: Icon, title, description, enabled, onToggle, children, locked }) => (
        <div className={`integration-card ${enabled ? 'enabled' : ''}`}>
            <div className="card-header-row">
                <div className="card-icon-wrapper">
                    <Icon size={24} />
                </div>
                <div className="card-info">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                            if (locked) {
                                e.preventDefault();
                                if (window.confirm("🚀 This is a Pro feature.\n\nUpgrade now to unlock advanced integrations!\n\nClick OK to view upgrade options.")) {
                                    window.location.href = '/settings?tab=billing';
                                }
                            } else {
                                onToggle(e);
                            }
                        }}
                    />
                    <span className="slider"></span>
                </div>
            </div>
            {enabled && !locked && (
                <div className="card-config animated-fade-in">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className={`settings-container ${mobileView === 'content' ? 'mobile-content-active' : ''}`}>
            {/* Desktop Header */}
            <header className="page-header desktop-only">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your profile, subscription, and app configuration.</p>
                </div>
                {activeTab === 'profile' && (
                    <div className="badge pro" style={{ alignSelf: 'center' }}>
                        {userProfile.planId === 'pro' ? 'PRO ACCOUNT' : 'FREE ACCOUNT'}
                    </div>
                )}
            </header>

            {/* Mobile Header Title */}
            {mobileView === 'menu' && <h1 className="page-title mobile-only" style={{ padding: '0 1rem' }}>Settings</h1>}

            <div className={`settings-layout`}>
                {/* Mobile: Show Back Button if in content mode */}
                {mobileView === 'content' && (
                    <div className="mobile-only settings-back-header">
                        <button onClick={handleBack} className="mobile-back-btn">
                            ← Back to Settings
                        </button>
                    </div>
                )}

                <div className={`settings-sidebar ${mobileView === 'content' ? 'hidden-on-mobile' : ''}`}>
                    <button
                        className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => handleTabChange('profile')}
                    >
                        <User size={18} /> My Profile
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
                        onClick={() => handleTabChange('billing')}
                    >
                        <Tag size={18} /> Billing & Plan
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'config' ? 'active' : ''}`}
                        onClick={() => handleTabChange('config')}
                    >
                        <Package size={18} /> Products & Tags
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'goals' ? 'active' : ''}`}
                        onClick={() => handleTabChange('goals')}
                    >
                        <Target size={18} /> Goals & KPIs
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
                        onClick={() => handleTabChange('integrations')}
                    >
                        <MessageCircle size={18} /> Integrations
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => handleTabChange('logs')}
                    >
                        <FileText size={18} /> Message Logs
                    </button>

                    {userProfile.role === 'super_admin' && (
                        <div style={{ padding: '1rem', marginTop: '1rem', borderTop: '1px solid #eee' }}>
                            <small style={{ color: '#888', fontWeight: 600 }}>ADMIN</small>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Switch to Admin Dashboard for global settings.
                            </div>
                        </div>
                    )}

                    <button
                        className="settings-nav-item danger-text"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            localStorage.removeItem('agent_user_profile');
                            window.location.href = '/login';
                        }}
                        style={{ marginTop: 'auto', color: '#ef4444' }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                <div className={`settings-content ${mobileView === 'menu' ? 'hidden-on-mobile' : ''}`}>
                    {activeTab === 'profile' && (
                        <div className="profile-section fade-in">
                            <h2 className="section-title">Agent Profile</h2>
                            {/* ... (Existing Profile Content) ... */}
                            <div className="profile-grid-layout">
                                {/* Left Column: Photo & Shortcodes */}
                                <div className="profile-left-col">
                                    <div className="glass-panel text-center" style={{ padding: '2rem' }}>
                                        <div className="profile-avatar-preview">
                                            {userProfile.photoUrl ? (
                                                <img src={userProfile.photoUrl} alt="Profile" className="avatar-img" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
                                            ) : (
                                                <div className="avatar-placeholder"><User size={48} /></div>
                                            )}
                                        </div>
                                        <div className="form-group" style={{ marginTop: '1rem' }}>
                                            <label style={{ fontSize: '0.8rem' }}>Profile Photo URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://imgur.com/..."
                                                value={userProfile.photoUrl || ''}
                                                onChange={e => updateProfile('photoUrl', e.target.value)}
                                                style={{ fontSize: '0.8rem' }}
                                            />
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>Paste a direct image link (fast & small).</small>
                                        </div>
                                    </div>


                                </div>

                                {/* Right Column: Details */}
                                <div className="profile-right-col">
                                    <div className="profile-form">
                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>Display Name</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.name}
                                                    onChange={e => updateProfile('name', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <label>Professional Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Takaful Advisor"
                                                    value={userProfile.title || ''}
                                                    onChange={e => updateProfile('title', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>System Role <span style={{ fontWeight: 'normal', color: '#64748b' }}>(Read-only)</span></label>
                                                <input
                                                    type="text"
                                                    value={userProfile.role}
                                                    disabled
                                                    style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <label>Agency Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Al-Falah Agency"
                                                    value={userProfile.agencyName || ''}
                                                    onChange={e => updateProfile('agencyName', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>License Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 12345-T"
                                                    value={userProfile.licenseNo || ''}
                                                    onChange={e => updateProfile('licenseNo', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={userProfile.email}
                                                    onChange={e => updateProfile('email', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>Phone</label>
                                                <input
                                                    type="tel"
                                                    value={userProfile.phone}
                                                    onChange={e => updateProfile('phone', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Professional Bio</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Brief introduction about yourself..."
                                                value={userProfile.bio || ''}
                                                onChange={e => updateProfile('bio', e.target.value)}
                                                style={{ resize: 'vertical' }}
                                            />
                                        </div>

                                        <h3 className="subsection-title" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Public Bio Link</h3>
                                        <div className="form-group">
                                            <label>Username <span style={{ color: '#64748b', fontWeight: 'normal' }}>(for your public bio link)</span></label>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                <div style={{ position: 'relative', flex: 1 }}>
                                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '600' }}>@</span>
                                                    <input
                                                        type="text"
                                                        placeholder="yourname"
                                                        value={userProfile.username || ''}
                                                        onChange={async (e) => {
                                                            const value = e.target.value.toLowerCase().replace(/[^a-z]/g, '').substring(0, 10);
                                                            updateProfile('username', value);

                                                            // Real-time validation
                                                            if (value.length > 0 && value.length < 4) {
                                                                setUsernameError('Username must be at least 4 characters');
                                                            } else {
                                                                setUsernameError('');

                                                                if (value.length >= 4) {
                                                                    const { data } = await supabase
                                                                        .from('profiles')
                                                                        .select('id')
                                                                        .eq('username', value)
                                                                        .single();

                                                                    if (data && data.id !== userProfile.id) {
                                                                        setUsernameError('Username is already taken');
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        onBlur={async () => {
                                                            if (usernameError) return;

                                                            if (userProfile.username && userProfile.username.length >= 4) {
                                                                const { error } = await supabase
                                                                    .from('profiles')
                                                                    .update({ username: userProfile.username })
                                                                    .eq('id', userProfile.id);

                                                                if (error) {
                                                                    setUsernameError('Failed to save username. It might be taken.');
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            paddingLeft: '32px',
                                                            borderColor: usernameError ? '#ef4444' : ''
                                                        }}
                                                    />
                                                    {usernameError && (
                                                        <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                                                            {usernameError}
                                                        </div>
                                                    )}
                                                </div>
                                                {userProfile.username && userProfile.username.length >= 4 && (
                                                    <button
                                                        type="button"
                                                        className="secondary-btn"
                                                        onClick={() => {
                                                            const url = `${window.location.origin}/@${userProfile.username}`;
                                                            navigator.clipboard.writeText(url);
                                                            alert('✅ Link copied to clipboard!');
                                                        }}
                                                        style={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        Copy Link
                                                    </button>
                                                )}
                                            </div>
                                            {userProfile.username && userProfile.username.length >= 3 && (
                                                <small style={{ display: 'block', marginTop: '0.5rem', color: '#10b981', fontSize: '0.8rem' }}>
                                                    ✓ Your public link: <strong>{window.location.origin}/@{userProfile.username}</strong>
                                                </small>
                                            )}
                                            {userProfile.username && userProfile.username.length < 3 && (
                                                <small style={{ display: 'block', marginTop: '0.5rem', color: '#ef4444', fontSize: '0.8rem' }}>
                                                    Username must be at least 3 characters
                                                </small>
                                            )}
                                            <small className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.5rem' }}>
                                                3-20 characters. Letters, numbers, hyphens, and underscores only.
                                            </small>
                                        </div>

                                        <h3 className="subsection-title" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Social Media</h3>
                                        <div className="social-grid">
                                            <div className="form-group">
                                                <label><Facebook size={14} /> Facebook (Personal)</label>
                                                <input
                                                    type="text"
                                                    placeholder="fb.com/username"
                                                    value={userProfile.social?.facebook || ''}
                                                    onChange={e => setUserProfile(prev => ({ ...prev, social: { ...prev.social, facebook: e.target.value } }))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label><Instagram size={14} /> Instagram</label>
                                                <input
                                                    type="text"
                                                    placeholder="@username"
                                                    value={userProfile.social?.instagram || ''}
                                                    onChange={e => setUserProfile(prev => ({ ...prev, social: { ...prev.social, instagram: e.target.value } }))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label><Video size={14} /> TikTok</label>
                                                <input
                                                    type="text"
                                                    placeholder="@username"
                                                    value={userProfile.social?.tiktok || ''}
                                                    onChange={e => setUserProfile(prev => ({ ...prev, social: { ...prev.social, tiktok: e.target.value } }))}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="@username"
                                                    value={userProfile.social?.threads || ''}
                                                    onChange={e => setUserProfile(prev => ({ ...prev, social: { ...prev.social, threads: e.target.value } }))}
                                                />
                                            </div>
                                            <button className="primary-btn" style={{ marginTop: '2rem', width: '100%', opacity: 0.8, cursor: 'default' }} disabled>
                                                <Save size={18} style={{ marginRight: '8px' }} /> Changes Saved Automatically
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="animate-fade-in">
                            <div className="animate-fade-in">
                                <h2 className="section-title">Billing & Subscription</h2>

                                {/* Current Plan Summary */}
                                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: `6px solid ${userProfile.planId === 'pro' || userProfile.planId === 'super_admin' ? '#10b981' : '#cbd5e1'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '1px', marginBottom: '0.5rem' }}>Current Plan</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                                                    {userProfile.planId === 'super_admin' ? 'Super Admin' : (userProfile.planId === 'pro' ? 'Pro Plan' : 'Free Starter')}
                                                </h3>
                                                <span className={`badge ${userProfile.planId === 'pro' || userProfile.planId === 'super_admin' ? 'pro' : ''}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                                                    {userProfile.planId === 'super_admin' ? 'UNLIMITED' : (userProfile.planId === 'pro' ? 'ACTIVE' : 'FREE')}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.95rem' }}>
                                                {userProfile.planId === 'super_admin'
                                                    ? 'You have full system access with no limits.'
                                                    : (userProfile.planId === 'pro'
                                                        ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span>Your Pro subscription is active.</span>
                                                                {userProfile.subscription_end_date && (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308', fontWeight: '600', marginTop: '4px' }}>
                                                                        <Clock size={16} />
                                                                        <span>
                                                                            Expires on {new Date(userProfile.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                        : 'You are currently on the Free Starter plan. seamless upgrade available below.')
                                                }
                                            </div>
                                        </div>

                                        <div style={{ alignSelf: 'center' }}>
                                            {userProfile.planId === 'pro' ? (
                                                <button className="secondary-btn" onClick={() => alert('Manage subscription via Portal (Coming Soon)')} style={{ border: '1px solid #e2e8f0' }}>Manage Subscription</button>
                                            ) : (
                                                <div style={{ textAlign: 'right', display: 'none' }}></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="subsection-title" style={{ marginBottom: '1.5rem', marginTop: '3rem' }}>Available Plans</h3>

                                <div className="pricing-toggle-container">
                                    <div className="pricing-toggle">
                                        <div
                                            className={`toggle-option ${upgradePlan === 'monthly' ? 'active' : ''}`}
                                            onClick={() => setUpgradePlan('monthly')}
                                        >
                                            Monthly
                                        </div>
                                        <div
                                            className={`toggle-option ${upgradePlan === 'yearly' ? 'active' : ''}`}
                                            onClick={() => setUpgradePlan('yearly')}
                                        >
                                            Annual
                                        </div>
                                        <div className="discount-badge">Save ~17%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pricing-grid">
                                {plans
                                    .filter(plan => userProfile.role === 'super_admin' || plan.id !== 'super_admin') // Hide Super Admin plan for others
                                    .map(plan => {
                                        const isCurrent = (userProfile.planId || 'free') === plan.id;
                                        const isPro = plan.name.toLowerCase().includes('pro');
                                        const price = upgradePlan === 'yearly' ? plan.price_yearly : plan.price_monthly;

                                        return (
                                            <div key={plan.id} className={`pricing-card ${isPro ? 'popular' : ''}`}>
                                                {isPro && <div className="popular-badge"><Star size={12} fill="white" /> Most Popular</div>}
                                                <div className="plan-name">{plan.name}</div>
                                                <div className="plan-desc">{isPro ? "Advanced features to track and grow your sales." : "Essential tools to manage your leads."}</div>
                                                <div className="plan-price">
                                                    {upgradePlan === 'yearly' && plan.price_yearly > 0 && <span className="old-price">RM {plan.price_yearly * 1.2}</span>}
                                                    RM {price}
                                                    <small>{upgradePlan === 'yearly' ? '/ year' : '/ mo'}</small>
                                                </div>

                                                <ul className="plan-features">
                                                    <li className="feature-item">
                                                        <Check size={18} className="check-icon" />
                                                        <span>{plan.contact_limit === 0 || plan.contact_limit > 10000 ? <strong>Unlimited</strong> : plan.contact_limit} Contacts</span>
                                                    </li>
                                                    {Array.isArray(plan.features) && plan.features
                                                        .filter(f => f !== 'white_label') // Hide White Label feature
                                                        .map((feature, idx) => (
                                                            <li key={idx} className="feature-item">
                                                                <Check size={18} className="check-icon" />
                                                                <span>{feature.replace(/_/g, ' ')}</span>
                                                            </li>
                                                        ))}
                                                </ul>

                                                {isCurrent ? (
                                                    <button className="plan-btn outline" disabled>Current Plan</button>
                                                ) : (
                                                    <button
                                                        className={`plan-btn ${isPro ? 'primary' : 'outline'}`}
                                                        onClick={() => isPro ? handleUpgradePayment(plan.id, upgradePlan) : alert('Please contact support to downgrade.')}
                                                        disabled={isProcessingPayment}
                                                    >
                                                        {isPro ? (isProcessingPayment ? 'Processing...' : 'Upgrade to Pro') : 'Downgrade'}
                                                    </button>
                                                )}

                                                {isPro && <div className="guarantee-text">30-day money-back guarantee</div>}
                                            </div>
                                        );
                                    })}
                            </div>


                            {/* Promo Code Section */}
                            <div className="promo-section">
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Have a promo code?</div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter your code below to redeem special offers.</div>
                                <div className="promo-input-group">
                                    <input
                                        type="text"
                                        className="promo-input"
                                        placeholder="e.g. KDIGITAL"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    />
                                    <button className="promo-btn" onClick={handleRedeemCode}>
                                        Redeem
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    {activeTab === 'config' && (
                        <div className="config-section fade-in">
                            <h2 className="section-title">Reference Data Configuration</h2>

                            <div className="std-tabs-container">
                                <button
                                    className={`std-tab-item ${managerTab === 'products' ? 'active' : ''}`}
                                    onClick={() => setManagerTab('products')}
                                >
                                    Products
                                </button>
                                <button
                                    className={`std-tab-item ${managerTab === 'tags' ? 'active' : ''}`}
                                    onClick={() => setManagerTab('tags')}
                                >
                                    Behavior Tags
                                </button>
                            </div>

                            <div className="manager-toolbar">
                                <form onSubmit={handleAddItem} className="add-item-row">
                                    <input
                                        type="text"
                                        placeholder={`Add new ${managerTab === 'products' ? 'product' : 'tag'}...`}
                                        value={newItemName}
                                        onChange={e => setNewItemName(e.target.value)}
                                    />
                                    <button type="submit" className="icon-btn-primary">
                                        <Plus size={18} />
                                    </button>
                                </form>
                            </div>

                            <ul className="config-list">
                                {(managerTab === 'products' ? availableProducts : availableTags).map((item, idx) => (
                                    <li key={idx} className="config-item">
                                        {editingId === item ? (
                                            <div className="edit-mode-inline">
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />
                                                <button onClick={saveEdit} className="save-btn-sm"><Save size={14} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{item}</span>
                                                <div className="item-actions">
                                                    <button onClick={() => startEditing(item)} className="action-btn-sm" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item)} className="action-btn-sm danger" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'goals' && (
                        <div className="goals-section fade-in">
                            <h2 className="section-title">Business Goals & KPIs</h2>
                            <p className="section-subtitle text-muted" style={{ marginBottom: '1.5rem' }}>Set your magic numbers to track your progress on the dashboard.</p>

                            <div className="profile-form">
                                <div className="form-group">
                                    <label>Monthly Revenue Target (RM)</label>
                                    <input
                                        type="number"
                                        value={userGoals.monthlyRevenue}
                                        onChange={e => setUserGoals(prev => ({ ...prev, monthlyRevenue: Number(e.target.value) }))}
                                        placeholder="5000"
                                    />
                                    <small className="text-muted">Target commission/profit per month.</small>
                                </div>
                                <div className="form-group">
                                    <label>Monthly Case Count Target</label>
                                    <input
                                        type="number"
                                        value={userGoals.monthlyCases}
                                        onChange={e => setUserGoals(prev => ({ ...prev, monthlyCases: Number(e.target.value) }))}
                                        placeholder="5"
                                    />
                                    <small className="text-muted">Number of new policies closed.</small>
                                </div>
                                <div className="form-group">
                                    <label>Yearly MDRT / Production Goal (RM)</label>
                                    <input
                                        type="number"
                                        value={userGoals.mdrtGoal}
                                        onChange={e => setUserGoals(prev => ({ ...prev, mdrtGoal: Number(e.target.value) }))}
                                        placeholder="600000"
                                    />
                                    <small className="text-muted">Target for Million Dollar Round Table.</small>
                                </div>
                                <button className="primary-btn" style={{ marginTop: '1rem', opacity: 0.7, cursor: 'default' }} disabled>
                                    <Save size={18} style={{ marginRight: '8px' }} /> Auto-Saved
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="integrations-section fade-in">
                            <h2 className="section-title">External Integrations</h2>
                            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                                Connect your favorite tools to automate your workflow.
                            </p>

                            <div className="settings-grid">
                                <SettingsCard
                                    icon={Mail}
                                    title="Email Service"
                                    description="Automated email follow-ups and notifications."
                                    enabled={integrations.email?.enabled}
                                    onToggle={() => toggleIntegration('email')}
                                    locked={false}
                                >
                                    <div className="card-config-field">
                                        <label>Sender Email</label>
                                        <input
                                            type="text"
                                            value={userProfile.email}
                                            disabled
                                            className="disabled-input"
                                        />
                                        <small className="text-muted">Sends via AgentApp premium delivery network.</small>
                                    </div>
                                </SettingsCard>

                                <SettingsCard
                                    icon={MessageCircle}
                                    title="WhatsApp Integration"
                                    description="Send automated WhatsApp messages to your leads."
                                    enabled={integrations.whatsapp?.enabled}
                                    onToggle={() => toggleIntegration('whatsapp')}
                                    locked={userProfile.planId !== 'pro' && userProfile.planId !== 'super_admin'}
                                >
                                    <div className="status-badge success">
                                        ✓ System Provisioned
                                    </div>
                                    <p className="config-text">
                                        WhatsApp automation is handled by our cloud servers. No setup required.
                                    </p>
                                </SettingsCard>

                                <SettingsCard
                                    icon={MessageSquare}
                                    title="SMS Gateway"
                                    description="High-delivery SMS for urgent follow-ups."
                                    enabled={integrations.sms?.enabled}
                                    onToggle={() => toggleIntegration('sms')}
                                    locked={userProfile.planId !== 'pro' && userProfile.planId !== 'super_admin'}
                                >
                                    <div className="status-badge success">
                                        ✓ Ready to use
                                    </div>
                                    <p className="config-text">
                                        SMS credits are included in your Pro subscription.
                                    </p>
                                </SettingsCard>
                            </div>

                            {userProfile.planId !== 'pro' && userProfile.planId !== 'super_admin' && (
                                <div className="upgrade-box glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem', color: '#123456' }}>
                                        <Star size={20} fill="#f59e0b" color="#f59e0b" />
                                        <h3 style={{ margin: 0 }}>Unlock Pro Integrations</h3>
                                    </div>
                                    <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                        WhatsApp and SMS automation are exclusive to Pro members.
                                    </p>
                                    <button className="primary-btn-sm" onClick={() => setActiveTab('billing')}>
                                        View Pricing Options
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="logs-section fade-in">
                            <MessageLogs userProfile={userProfile} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
