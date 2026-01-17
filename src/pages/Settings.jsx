import React, { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Save, Tag, Package, Plus, Trash2, Edit2, MessageCircle, MessageSquare, Target, Facebook, Instagram, AtSign, Video, FileText, Globe, LogOut, Check, X, Star } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
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
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

    // Initialize view based on screen width
    // On Desktop (>900px), this state is ignored by CSS
    const [mobileView, setMobileView] = useState(window.innerWidth <= 900 ? 'menu' : 'content');

    // Helper to switch tabs
    const handleTabChange = (tab) => {
        // Feature Gating: Show upgrade prompt for restricted features
        if (tab === 'whatsapp' && !checkPermission('whatsapp')) {
            if (window.confirm("📱 WhatsApp Integration is a Pro feature.\n\nUpgrade now to automate your follow-ups and connect with clients seamlessly!\n\nClick OK to view upgrade options.")) {
                setActiveTab('billing');
                if (window.innerWidth <= 900) {
                    setMobileView('content');
                }
            }
            return;
        }

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

        // MVP: Hardcoded legacy check + Server-side validation preference
        // Ideally we should move this to an edge function if we want to hide logics,
        // but for now we keep the existing logic structure.
        if (promoCode === 'KDIGITAL') {
            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            // Update DB
            const { error } = await supabase.from('profiles').update({
                plan_id: 'pro',
                subscription_status: 'trial',
                subscription_end_date: expiryDate.toISOString(),
                is_trial_used: true
            }).eq('id', userProfile.id);

            if (error) {
                alert('Redemption failed. Please try again.');
                return;
            }

            // Update Local State
            const newProfile = { ...userProfile, planId: 'pro', role: 'free' }; // role stays free technically or update to pro? usually we check planId
            // Let's assume planId is source of truth for features
            setUserProfile(prev => ({
                ...prev,
                planId: 'pro',
                subscription_end_date: expiryDate.toISOString()
            }));
            localStorage.setItem('agent_user_profile', JSON.stringify({
                ...newProfile,
                planId: 'pro',
                subscription_end_date: expiryDate.toISOString()
            }));

            alert(`Code Redeemed! You are now a PRO user until ${expiryDate.toLocaleDateString()}.`);
            setPromoCode('');
        } else {
            alert('Invalid or expired code.');
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
            <h1 className="page-title desktop-only">Settings</h1>
            {mobileView === 'menu' && <h1 className="page-title mobile-only">Settings</h1>}

            <div className={`glass-panel settings-layout`}>
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
                        className={`settings-nav-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
                        onClick={() => handleTabChange('whatsapp')}
                    >
                        <MessageSquare size={18} /> Link WhatsApp
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

                                    <div className="glass-panel" style={{ marginTop: '1rem', padding: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                                            <FileText size={16} style={{ marginRight: '8px' }} /> Shortcodes
                                        </h4>
                                        <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '1rem' }}>
                                            Use these in your messages and landing page:
                                        </p>
                                        <div className="shortcode-list">
                                            <code>{`{name}`}</code>
                                            <code>{`{phone}`}</code>
                                            <code>{`{email}`}</code>
                                            <code>{`{agency}`}</code>
                                            <code>{`{license}`}</code>
                                            <code>{`{bio}`}</code>
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
                                                <label>Role / Title</label>
                                                <input
                                                    type="text"
                                                    value={userProfile.role}
                                                    onChange={e => updateProfile('role', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>Agency Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Al-Falah Agency"
                                                    value={userProfile.agencyName || ''}
                                                    onChange={e => updateProfile('agencyName', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <label>License Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 12345-T"
                                                    value={userProfile.licenseNo || ''}
                                                    onChange={e => updateProfile('licenseNo', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={userProfile.email}
                                                    onChange={e => updateProfile('email', e.target.value)}
                                                />
                                            </div>
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
                                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: `6px solid ${userProfile.planId === 'pro' ? '#10b981' : '#cbd5e1'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', letterSpacing: '1px', marginBottom: '0.5rem' }}>Current Plan</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                                                    {userProfile.planId === 'pro' ? 'Pro Plan' : 'Free Starter'}
                                                </h3>
                                                <span className={`badge ${userProfile.planId === 'pro' ? 'pro' : ''}`} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                                                    {userProfile.planId === 'pro' ? 'ACTIVE' : 'FREE'}
                                                </span>
                                            </div>
                                            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '500px' }}>
                                                {userProfile.planId === 'pro'
                                                    ? (userProfile.subscription_end_date
                                                        ? `Your subscription renews automatically on ${new Date(userProfile.subscription_end_date).toLocaleDateString()}.`
                                                        : 'Your Pro subscription is active.')
                                                    : 'You are currently on the Free Starter plan. seamless upgrade available below.'}
                                            </p>
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
                                {plans.map(plan => {
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
                                                {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                                                    <li key={idx} className="feature-item">
                                                        <Check size={18} className="check-icon" />
                                                        <span>{feature}</span>
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
                            <div className="settings-grid">
                                <SettingsCard
                                    icon={MessageCircle}
                                    title="WhatsApp Integration"
                                    description="Send automated messages via WhatsApp API (e.g. Waha, Twilio)."
                                    enabled={integrations.whatsapp.enabled}
                                    onToggle={() => toggleIntegration('whatsapp')}
                                    locked={!checkPermission('whatsapp')}
                                >
                                    <div className="form-group">
                                        <label>API Endpoint</label>
                                        <input
                                            type="text"
                                            placeholder="https://api.waha.dev/..."
                                            value={integrations.whatsapp.endpoint || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, endpoint: e.target.value } }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>API Key / Token</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••••••••"
                                            value={integrations.whatsapp.apiKey || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, apiKey: e.target.value } }))}
                                        />
                                    </div>
                                </SettingsCard>

                                <SettingsCard
                                    icon={Mail}
                                    title="Email Service"
                                    description="Connect via SMTP or API (Resend, SendGrid) for newsletters."
                                    enabled={integrations.email.enabled}
                                    onToggle={() => toggleIntegration('email')}
                                >
                                    <div className="form-group">
                                        <label>SMTP Host</label>
                                        <input
                                            type="text"
                                            placeholder="smtp.gmail.com"
                                            value={integrations.email.host || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, email: { ...prev.email, host: e.target.value } }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sender Email</label>
                                        <input
                                            type="email"
                                            value={integrations.email.sender || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, email: { ...prev.email, sender: e.target.value } }))}
                                        />
                                    </div>
                                </SettingsCard>

                                <SettingsCard
                                    icon={MessageSquare}
                                    title="SMS Gateway"
                                    description="Traditional SMS for high-priority notifications."
                                    enabled={integrations.sms.enabled}
                                    onToggle={() => toggleIntegration('sms')}
                                >
                                    <div className="form-group">
                                        <label>Provider URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://sms-provider.com/api"
                                            value={integrations.sms.url || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, sms: { ...prev.sms, url: e.target.value } }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>API Key</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={integrations.sms.apiKey || ''}
                                            onChange={(e) => setIntegrations(prev => ({ ...prev, sms: { ...prev.sms, apiKey: e.target.value } }))}
                                        />
                                    </div>
                                </SettingsCard>
                            </div>
                        </div>
                    )}

                    {activeTab === 'whatsapp' && (
                        <div className="whatsapp-section fade-in">
                            <h2 className="section-title">Link WhatsApp Device</h2>
                            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ width: '200px', height: '200px', background: '#f0f0f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="text-muted">QR Code Placeholder</span>
                                    </div>
                                </div>
                                <h3>Scan to Link Device</h3>
                                <p className="text-muted" style={{ maxWidth: '400px', margin: '1rem auto' }}>
                                    Open WhatsApp on your mobile phone, go to Settings &gt; Linked Devices &gt; Link a Device, and scan the QR code above.
                                </p>
                                <div className="status-indicator">
                                    <span className={`status-dot dot-lapsed`}></span>
                                    <span>Disconnected</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Message Template Shortcodes</h3>
                                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <tr>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Shortcode</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Description</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Example Output</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { code: '{name}', desc: 'Contact Full Name', example: 'Ahmad Albab' },
                                                { code: '{phone}', desc: 'Contact Phone Number', example: '60123456789' },
                                                { code: '{email}', desc: 'Contact Email', example: 'ahmad@example.com' },
                                                { code: '{occupation}', desc: 'Contact Occupation', example: 'Government Servant' },
                                                { code: '{birthday}', desc: 'Contact Birthday', example: '1990-05-15' },
                                                { code: '{products}', desc: 'Interested Products', example: 'Hibah, Medical Card' },
                                                { code: '{dealValue}', desc: 'Deal/Budget Value', example: 'RM 1200' },
                                                { code: '{agent_name}', desc: 'Your Name', example: 'Dzulfaqar Hashim' },
                                                { code: '{agent_phone}', desc: 'Your Phone', example: '60123456789' },
                                                { code: '{renewalDate}', desc: 'Policy Renewal Date', example: '2026-10-12' },
                                                { code: '{years}', desc: 'Years since signup', example: '2' },
                                            ].map((row, i) => (
                                                <tr key={i} style={{ borderBottom: i < 10 ? '1px solid #f1f5f9' : 'none' }}>
                                                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#7c3aed', fontWeight: 600 }}>{row.code}</td>
                                                    <td style={{ padding: '12px 16px', color: '#334155' }}>{row.desc}</td>
                                                    <td style={{ padding: '12px 16px', color: '#64748b', fontStyle: 'italic' }}>{row.example}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
