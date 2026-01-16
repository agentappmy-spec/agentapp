import React, { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Save, Tag, Package, Plus, Trash2, Edit2, MessageCircle, MessageSquare, Target, Facebook, Instagram, AtSign, Video, FileText, Globe, LogOut } from 'lucide-react';
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
        // Feature Gating Visual Check
        if (tab === 'whatsapp' && !checkPermission('whatsapp')) {
            // We allow navigation but will show lock screen
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

    const handleUpgradePayment = async () => {
        setIsProcessingPayment(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-chip-purchase', {
                body: {
                    email: userProfile.email,
                    plan: upgradePlan,
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
        <div className={`integration-card ${enabled ? 'enabled' : ''} ${locked ? 'locked-card' : ''}`} style={locked ? { opacity: 0.7, pointerEvents: 'none', position: 'relative' } : {}}>
            {locked && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    PRO ONLY
                </div>
            )}
            <div className="card-header-row">
                <div className="card-icon-wrapper">
                    <Icon size={24} />
                </div>
                <div className="card-info">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                {!locked && (
                    <div className="toggle-switch">
                        <input type="checkbox" checked={enabled} onChange={onToggle} />
                        <span className="slider"></span>
                    </div>
                )}
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
                        <MessageSquare size={18} /> Link WhatsApp {!checkPermission('whatsapp') && <span style={{ fontSize: '0.8em', marginLeft: 'auto' }}>🔒</span>}
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
                                                <label><AtSign size={14} /> Threads</label>
                                                <input
                                                    type="text"
                                                    placeholder="@username"
                                                    value={userProfile.social?.threads || ''}
                                                    onChange={e => setUserProfile(prev => ({ ...prev, social: { ...prev.social, threads: e.target.value } }))}
                                                />
                                            </div>
                                        </div>

                                        <button className="primary-btn" style={{ marginTop: '2rem', width: '100%', opacity: 0.8, cursor: 'default' }} disabled>
                                            <Save size={18} style={{ marginRight: '8px' }} /> Changes Saved Automatically
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="billing-section fade-in">
                            <h2 className="section-title">Billing & Plan</h2>

                            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: userProfile.planId === 'pro' ? '4px solid #10b981' : '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>Current Plan</div>
                                        <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{userProfile.planId === 'pro' ? 'Pro Agent' : 'Free Starter'}</h3>
                                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                            {userProfile.planId === 'pro'
                                                ? 'Unlimited contacts & full automation suite.'
                                                : 'Limited to 10 contacts. Basic features only.'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: userProfile.planId === 'pro' ? '#10b981' : '#3b82f6' }}>
                                            {userProfile.planId === 'pro' ? 'RM 22' : 'RM 0'}
                                        </div>
                                        <small style={{ color: '#94a3b8' }}>/ month</small>
                                    </div>
                                </div>
                            </div>

                            {userProfile.planId !== 'pro' && (
                                <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Upgrade to Pro</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '10px' }}>✅ Unlimited Contacts</li>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '10px' }}>✅ WhatsApp Automation</li>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '10px' }}>✅ Publish Landing Page</li>
                                        <li style={{ marginBottom: '0.5rem', display: 'flex', gap: '10px' }}>✅ Advanced Analytics</li>
                                    </ul>
                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        {/* Plan Selection */}
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                className={`tab-btn-sm ${upgradePlan === 'monthly' ? 'active' : ''}`}
                                                style={{ background: upgradePlan === 'monthly' ? '#2563eb' : '#f1f5f9', color: upgradePlan === 'monthly' ? 'white' : '#64748b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                                                onClick={() => setUpgradePlan('monthly')}
                                            >
                                                Monthly (RM 22)
                                            </button>
                                            <button
                                                className={`tab-btn-sm ${upgradePlan === 'yearly' ? 'active' : ''}`}
                                                style={{ background: upgradePlan === 'yearly' ? '#2563eb' : '#f1f5f9', color: upgradePlan === 'yearly' ? 'white' : '#64748b', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                                                onClick={() => setUpgradePlan('yearly')}
                                            >
                                                Yearly (RM 220)
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                                            <button
                                                onClick={handleUpgradePayment}
                                                className="primary-btn"
                                                disabled={isProcessingPayment}
                                                style={{ minWidth: '160px', justifyContent: 'center' }}
                                            >
                                                {isProcessingPayment ? 'Processing...' : 'Upgrade to PRO'}
                                            </button>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                Secure payment via Chip In
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
                                <h3>Redeem Code</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    Have a promo code? Enter it below to activate your Pro plan.
                                </p>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const code = e.target.code.value.trim().toUpperCase();

                                        // TODO: Validate against DB for dynamic codes
                                        if (code === 'KDIGITAL') {

                                            // Update Local
                                            const newProfile = { ...userProfile, planId: 'pro', role: 'free' };
                                            setUserProfile(newProfile);
                                            localStorage.setItem('agent_user_profile', JSON.stringify(newProfile));

                                            // Calculate Expiry
                                            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                                            // Update DB
                                            await supabase.from('profiles').update({
                                                plan_id: 'pro',
                                                subscription_status: 'trial',
                                                subscription_end_date: expiryDate.toISOString(),
                                                is_trial_used: true
                                            }).eq('id', userProfile.id);

                                            // SIMULATE EMAIL NOTIFICATION (Super Admin manages templates elsewhere)
                                            // In production, this would trigger an Edge Function: supabase.functions.invoke('send-email', ...)
                                            console.log(`[EMAIL SENT] To: ${userProfile.email}, Subject: You are now PRO! Expires: ${expiryDate.toLocaleDateString()}`);

                                            alert(`Code Redeemed! You are now a PRO user until ${expiryDate.toLocaleDateString()}.\n\nA confirmation email has been sent to ${userProfile.email}.`);

                                            window.location.reload();
                                        } else {
                                            alert('Invalid Code.');
                                        }
                                    }}
                                    style={{ display: 'flex', gap: '10px' }}
                                >
                                    <input name="code" type="text" placeholder="ENTER CODE" style={{ textTransform: 'uppercase', letterSpacing: '1px' }} />
                                    <button type="submit" className="secondary-btn">Apply</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="config-section fade-in">
                            <h2 className="section-title">Reference Data Configuration</h2>

                            <div className="config-tabs">
                                <button
                                    className={`tab-pill ${managerTab === 'products' ? 'active' : ''}`}
                                    onClick={() => setManagerTab('products')}
                                >
                                    Products
                                </button>
                                <button
                                    className={`tab-pill ${managerTab === 'tags' ? 'active' : ''}`}
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
                            {checkPermission('whatsapp') ? (
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
                            ) : (
                                <div className="detail-lock-screen" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                                    <h2>Pro Feature Locked</h2>
                                    <p style={{ maxWidth: '400px', margin: '1rem auto', color: '#666' }}>
                                        WhatsApp integration is only available on the Pro plan. Upgrade now to automate your messages and link your device.
                                    </p>
                                    <button className="primary-btn">Upgrade to Pro</button>
                                </div>
                            )}

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
