import React, { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import {
    Users,
    MessageCircle,
    MessageSquare,
    Settings,
    Search,
    Filter,
    Edit2,
    Trash2,
    Plus,
    X,
    Clock,
    RotateCw,
    Send,
    Tag,
    CheckCircle2,
    Crown,
    Zap,
    AlertCircle
} from 'lucide-react';
import { ROLES, APP_PLANS, FEATURE_NAMES } from '../utils/constants';
import './SuperAdmin.css';

// --- System Configuration for Plans ---
// Add new features here to make them appear in the Plan Editor
const AVAILABLE_FEATURES = [
    { id: 'dashboard_access', label: 'Dashboard Access', type: 'boolean', value: 'dashboard_access' },
    { id: 'email_enabled', label: 'Email Integration', type: 'boolean', value: 'email_enabled' },
    { id: 'sms_enabled', label: 'SMS Integration', type: 'boolean', value: 'sms_enabled' },
    { id: 'whatsapp_enabled', label: 'WhatsApp Integration', type: 'boolean', value: 'whatsapp_enabled' },
    { id: 'global_reminders_enabled', label: 'Global Reminders', type: 'boolean', value: 'global_reminders_enabled' },
    { id: 'auto_followup_enabled', label: 'Auto Follow Up', type: 'boolean', value: 'auto_followup_enabled' },
    { id: 'landing_page_edit', label: 'Landing Page Editor', type: 'boolean', value: 'landing_page_edit' },
    { id: 'landing_page_publish', label: 'Publish Landing Page', type: 'boolean', value: 'landing_page_publish' },
    { id: 'analytics_advanced', label: 'Advanced Analytics', type: 'boolean', value: 'analytics_advanced' },
    { id: 'white_label', label: 'White Labeling', type: 'boolean', value: 'white_label' }
];

// --- Components for Auto Follow-up (Adapted) ---

const EditNodeModal = ({ node, onClose, onSave }) => {
    const [cDay, setCDay] = useState(node.day);
    const [contentSms, setContentSms] = useState(node.contentSms || node.message || '');
    const [contentWhatsapp, setContentWhatsapp] = useState(node.contentWhatsapp || node.message || '');
    const [contentEmail, setContentEmail] = useState(node.contentEmail || node.message || '');
    const [subject, setSubject] = useState(node.subject || '');
    const [activeChannel, setActiveChannel] = useState('sms');

    const getCurrentContent = () => {
        if (activeChannel === 'sms') return contentSms;
        if (activeChannel === 'whatsapp') return contentWhatsapp;
        return contentEmail;
    };

    const setCurrentContent = (val) => {
        if (activeChannel === 'sms') setContentSms(val);
        else if (activeChannel === 'whatsapp') setContentWhatsapp(val);
        else setContentEmail(val);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="modal-title" style={{ margin: 0, border: 'none', padding: 0 }}>Edit Automation Step</h2>
                    <button className="sa-icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="form-group">
                    <label>Days after Join (Day 0 = Instant)</label>
                    <input
                        type="number"
                        className="sa-input-modern"
                        value={cDay}
                        onChange={(e) => setCDay(Number(e.target.value))}
                        min="0"
                    />
                </div>

                <div className="channel-tabs" style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', margin: '1.5rem 0' }}>
                    <button className={`role-tab-btn ${activeChannel === 'sms' ? 'active' : ''}`} onClick={() => setActiveTabProp('sms', setActiveChannel)} style={{ flex: 1, padding: '0.6rem' }}>SMS</button>
                    <button className={`role-tab-btn ${activeChannel === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTabProp('whatsapp', setActiveChannel)} style={{ flex: 1, padding: '0.6rem' }}>WhatsApp</button>
                    <button className={`role-tab-btn ${activeChannel === 'email' ? 'active' : ''}`} onClick={() => setActiveTabProp('email', setActiveChannel)} style={{ flex: 1, padding: '0.6rem' }}>Email</button>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Email Subject</label>
                    <input
                        type="text"
                        className="sa-input-modern"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject line for automation emails..."
                        style={{ fontWeight: '600' }}
                    />
                    <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>This subject will be used for email notifications to users.</small>
                </div>

                <div className="form-group">
                    <label>Message Content</label>
                    <textarea
                        rows="6"
                        className="sa-input-modern"
                        value={getCurrentContent()}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        style={{ fontFamily: 'monospace', resize: 'vertical' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                        💡 Use <strong>{'{name}'}</strong> to personalize with the user's name.
                    </small>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button className="primary-btn" onClick={() => onSave({ ...node, day: cDay, subject, contentSms, contentWhatsapp, contentEmail, message: contentSms })}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper for modal tabs
const setActiveTabProp = (val, setter) => setter(val);

// --- User Management Components ---

const EditUserModal = ({ user, onClose, onSave, plans = [] }) => {
    const [formData, setFormData] = useState({
        ...user,
        expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : ''
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="modal-title" style={{ margin: 0, border: 'none', padding: 0 }}>{user.isNew ? 'Add New User' : 'Edit User'}</h2>
                    <button className="sa-icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="sa-input-modern" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter user name" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="sa-input-modern" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                        <label>Subscription Plan</label>
                        <select className="sa-input-modern" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                            <option value="Free">Free Starter</option>
                            <option value="Pro">Pro Plan</option>
                            {plans.filter(p => p.id !== 'free' && p.id !== 'pro').map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {formData.plan === 'Pro' && (
                        <div className="form-group slide-down">
                            <label>Pro Subscription Expiry</label>
                            <input
                                type="date"
                                className="sa-input-modern"
                                value={formData.expiryDate}
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                            <small style={{ color: '#64748b', fontWeight: '500', marginTop: '0.5rem', display: 'block' }}>Set when this user's Pro access should end.</small>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Account Status</label>
                        <select className="sa-input-modern" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button className="primary-btn" onClick={() => onSave(formData)}>Save User Profile</button>
                </div>
            </div>
        </div>
    );
};

const EditPlanModal = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : []
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (featureValue) => {
        setFormData(prev => {
            const currentFeatures = prev.features || [];
            if (currentFeatures.includes(featureValue)) {
                return { ...prev, features: currentFeatures.filter(f => f !== featureValue) };
            } else {
                return { ...prev, features: [...currentFeatures, featureValue] };
            }
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="modal-title" style={{ margin: 0, border: 'none', padding: 0 }}>
                        {plan.isNew ? 'Create New Plan' : 'Edit Plan Details'}
                    </h2>
                    <button className="sa-icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="sa-scrollable-form" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                    <div className="form-group">
                        <label>Plan Name</label>
                        <input
                            className="sa-input-modern"
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="e.g. Pro Platinum"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Monthly Price (RM)</label>
                            <input
                                type="number"
                                className="sa-input-modern"
                                value={formData.price_monthly}
                                onChange={e => handleChange('price_monthly', e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Yearly Price (RM)</label>
                            <input
                                type="number"
                                className="sa-input-modern"
                                value={formData.price_yearly}
                                onChange={e => handleChange('price_yearly', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* LIMITS SECTION */}
                    <h4 style={{ margin: '1.5rem 0 1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        Usage Limits
                    </h4>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Database Limit (Contacts)</label>
                            <input
                                type="number"
                                className="sa-input-modern"
                                value={formData.contact_limit}
                                onChange={e => handleChange('contact_limit', e.target.value)}
                                placeholder="0 for unlimited"
                            />
                            <small className="text-muted">Enter 0 for Unlimited</small>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Message Limit</label>
                            <input
                                type="number"
                                className="sa-input-modern"
                                value={formData.monthly_message_limit || 0}
                                onChange={e => handleChange('monthly_message_limit', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* FEATURES CHECKLIST SECTION */}
                    <h4 style={{ margin: '1.5rem 0 1rem', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        Features Included
                    </h4>

                    <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {AVAILABLE_FEATURES.map(feat => {
                            const isChecked = formData.features.includes(feat.value);
                            return (
                                <div
                                    key={feat.id}
                                    className={`feature-toggle-card ${isChecked ? 'active' : ''}`}
                                    onClick={() => toggleFeature(feat.value)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: isChecked ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                        background: isChecked ? '#eff6ff' : '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '4px',
                                            border: isChecked ? 'none' : '2px solid #cbd5e1',
                                            background: isChecked ? '#2563eb' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}
                                    >
                                        {isChecked && <CheckCircle2 size={14} />}
                                    </div>
                                    <span style={{ fontWeight: '500', color: isChecked ? '#1e293b' : '#64748b', fontSize: '0.9rem' }}>
                                        {feat.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="primary-btn"
                        onClick={() => onSave({
                            ...formData,
                            monthly_message_limit: Number(formData.monthly_message_limit) || 0,
                            contact_limit: Number(formData.contact_limit),
                            price_monthly: Number(formData.price_monthly),
                            price_yearly: Number(formData.price_yearly),
                            features: formData.features
                        })}
                    >
                        Save Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditPromoCodeModal = ({ promo, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...promo,
        expiry: promo.expiry && promo.expiry !== 'Never' ? new Date(promo.expiry).toISOString().split('T')[0] : ''
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="modal-title" style={{ margin: 0, border: 'none', padding: 0 }}>{promo.isNew ? 'New Promo Code' : 'Edit Promo Code'}</h2>
                    <button className="sa-icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label>Promo Code</label>
                        <input
                            className="sa-input-modern"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g. SAVE50"
                            style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Reward Description</label>
                        <input
                            className="sa-input-modern"
                            value={formData.reward}
                            onChange={e => setFormData({ ...formData, reward: e.target.value })}
                            placeholder="e.g. 50% Off First Month"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Expiry Date</label>
                            <input
                                type="date"
                                className="sa-input-modern"
                                value={formData.expiry}
                                onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                            />
                            <small style={{ color: '#64748b', fontWeight: '500', marginTop: '0.5rem', display: 'block' }}>Leave blank for 'Never'</small>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Usage Limit</label>
                            <input
                                type="number"
                                className="sa-input-modern"
                                value={formData.usage_limit || ''}
                                onChange={e => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                                placeholder="∞"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Initial Status</label>
                        <select
                            className="sa-input-modern"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="primary-btn"
                        onClick={() => onSave({
                            ...formData,
                            expiry: formData.expiry || 'Never',
                            usage_limit: formData.usage_limit || 0
                        })}
                    >
                        Save Promo Code
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const isMatch = confirmText === 'DELETE';

    const handleConfirm = async () => {
        if (isMatch) {
            setIsDeleting(true);
            await onConfirm();
            setIsDeleting(false);
            setConfirmText('');
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', width: '50px', height: '50px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <AlertCircle size={24} />
                </div>
                <h3 className="modal-title">Delete User?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    You are about to delete <strong>{userName}</strong>.
                </p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    This action completely removes their profile and cannot be undone. To confirm, please type <strong>DELETE</strong> below.
                </p>
                <input
                    type="text"
                    className="sa-input-modern"
                    placeholder="Type DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    style={{ marginBottom: '1.5rem', textAlign: 'center' }}
                />
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button className="secondary-btn" onClick={() => { setConfirmText(''); onClose(); }}>Cancel</button>
                    <button
                        className="primary-btn"
                        style={{ background: isMatch ? '#ef4444' : '#e2e8f0', cursor: isMatch ? 'pointer' : 'not-allowed', border: 'none' }}
                        disabled={!isMatch || isDeleting}
                        onClick={handleConfirm}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete User'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuperAdmin = () => {
    const location = useLocation();
    const { userProfile } = useOutletContext(); // Get Auth State
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'users');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    // Real Data from Supabase
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [promoCodes, setPromoCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only fetch if profile is loaded (Auth is ready)
        if (userProfile) {
            fetchUsers();
            fetchPlans();
            fetchPromoCodes();
            fetchWorkflowTemplates();
        }
    }, [userProfile]); // Rerun when profile loads

    const fetchWorkflowTemplates = async () => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data, error } = await supabase
                .from('workflow_templates')
                .select('*')
                .order('day', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                const grouped = {
                    free: data.filter(d => d.workflow_type === 'free_user').map(d => ({
                        ...d,
                        contentSms: d.content_sms,
                        contentEmail: d.content_email,
                        contentWhatsapp: d.content_whatsapp,
                        message: d.content_sms
                    })),
                    pro: data.filter(d => d.workflow_type === 'pro_user').map(d => ({
                        ...d,
                        contentSms: d.content_sms,
                        contentEmail: d.content_email,
                        contentWhatsapp: d.content_whatsapp,
                        message: d.content_sms
                    }))
                };
                setFollowUpSettings(grouped);
            }
        } catch (err) {
            console.warn('Failed to fetch workflow templates:', err);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            if (data) {
                const mappedUsers = data.map(u => ({
                    id: u.id,
                    name: u.full_name || u.email?.split('@')[0] || 'User',
                    email: u.email,
                    plan: u.plan_id ? (u.plan_id === 'pro' ? 'Pro' : (u.plan_id === 'free' ? 'Free' : u.plan_id)) : 'Free',
                    status: 'Active',
                    expiryDate: u.subscription_end_date,
                    joined: new Date(u.created_at || Date.now()).toLocaleDateString()
                }));
                setUsers(mappedUsers);
            }
        } catch (err) {
            console.warn('Failed to fetch users:', err);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data, error } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                setPlans(data);
            } else {
                throw new Error('No plans found');
            }
        } catch (err) {
            console.warn('Using default plans (DB fetch failed):', err);
            // Fallback default data
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
                    id: APP_PLANS.PRO,
                    name: 'Pro',
                    price_monthly: 22,
                    price_yearly: 220,
                    contact_limit: 1000,
                    features: [FEATURE_NAMES.WHATSAPP, FEATURE_NAMES.SMS, FEATURE_NAMES.EMAIL, "Auto Follow Up", "Auto Reminder", FEATURE_NAMES.LANDING_PAGE, "Analytics"]
                }
            ]);
        }
    };

    const fetchPromoCodes = async () => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setPromoCodes(data);
            }
        } catch (err) {
            console.warn('Fetching promo codes failed, using fallback:', err);
            // Fallback mock data
            setPromoCodes([
                { id: '1', code: 'KDIGITAL', reward: '30 Days Pro Trial', status: 'ACTIVE', expiry: 'Never', usage_count: 50, usage_limit: 0 },
                { id: '2', code: 'WELCOME50', reward: '50% Off First Month', status: 'INACTIVE', expiry: '2025-12-31', usage_count: 0, usage_limit: 100 }
            ]);
        }
    };

    const [followUpSettings, setFollowUpSettings] = useState({
        free: [
            { id: 1, day: 0, label: 'Welcome', subject: 'Welcome to AgentApp! 🎉', message: 'Hi {name}, thanks for joining! Add your first contact now.', contentSms: 'Hi {name}, thanks for joining! Add your first contact now.', contentEmail: 'Hi {name}, thanks for joining! Add your first contact now.' },
            { id: 2, day: 3, label: 'Tips', subject: 'Unlock More with Pro 🚀', message: 'Did you know? Pro users get unlimited contacts.', contentSms: 'Did you know? Pro users get unlimited contacts.', contentEmail: 'Did you know? Pro users get unlimited contacts.' }
        ],
        pro: [
            { id: 1, day: 0, label: 'Welcome Pro', subject: 'Welcome to the elite club! 💎', message: 'Welcome to the elite club, {name}!', contentSms: 'Welcome to the elite club, {name}!', contentEmail: 'Welcome to the elite club, {name}!' }
        ]
    });

    const [selectedRole, setSelectedRole] = useState('free');
    const [editingNode, setEditingNode] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);

    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilterPlan, setSelectedFilterPlan] = useState('All');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = selectedFilterPlan === 'All' || user.plan === selectedFilterPlan;
        return matchesSearch && matchesPlan;
    });

    // --- Actions ---

    const handleSaveNode = async (updatedNode) => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const payload = {
                day: updatedNode.day,
                subject: updatedNode.subject,
                content_sms: updatedNode.contentSms,
                content_email: updatedNode.contentEmail,
                content_whatsapp: updatedNode.contentWhatsapp,
                workflow_type: selectedRole === 'free' ? 'free_user' : 'pro_user'
            };

            if (typeof updatedNode.id === 'string' && updatedNode.id.length > 10) {
                // Existing node in DB
                const { error } = await supabase
                    .from('workflow_templates')
                    .update(payload)
                    .eq('id', updatedNode.id);
                if (error) throw error;
            } else {
                // New node
                const { error } = await supabase
                    .from('workflow_templates')
                    .insert([payload]);
                if (error) throw error;
            }

            fetchWorkflowTemplates();
            setEditingNode(null);
        } catch (err) {
            console.error('Error saving node:', err);
            // Fallback for UI if DB fails
            const list = [...followUpSettings[selectedRole]];
            const idx = list.findIndex(x => x.id === updatedNode.id);
            if (idx >= 0) list[idx] = updatedNode;
            list.sort((a, b) => a.day - b.day);
            setFollowUpSettings(prev => ({ ...prev, [selectedRole]: list }));
            setEditingNode(null);
        }
    };

    const handleAddNode = () => {
        const list = followUpSettings[selectedRole];
        const lastDay = list.length > 0 ? list[list.length - 1].day : 0;
        const newNode = {
            id: Date.now(),
            day: lastDay + 3,
            label: `Day ${lastDay + 3}`,
            subject: 'New Subject',
            message: 'New automated message...',
            contentSms: 'New automated message...',
            contentEmail: 'New automated message...'
        };
        const newList = [...list, newNode];
        setFollowUpSettings(prev => ({ ...prev, [selectedRole]: newList }));
        setEditingNode(newNode);
    };

    const handleDeleteNode = async (id) => {
        if (!confirm('Delete this step?')) return;
        try {
            const { supabase } = await import('../services/supabaseClient');
            if (typeof id === 'string' && id.length > 10) {
                const { error } = await supabase
                    .from('workflow_templates')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            }

            setFollowUpSettings(prev => ({
                ...prev,
                [selectedRole]: prev[selectedRole].filter(n => n.id !== id)
            }));
        } catch (err) {
            console.error('Error deleting node:', err);
        }
    };

    const [deletingUser, setDeletingUser] = useState(null);

    const handleDeleteUser = (user) => {
        // Prevent Super Admin from deleting themselves
        if (user.id === userProfile.id) {
            alert("Security Alert: You cannot delete your own Super Admin account.");
            return;
        }
        setDeletingUser(user);
    };

    const confirmDeleteUser = async () => {
        if (!deletingUser) return;

        try {
            const { supabase } = await import('../services/supabaseClient');

            // Invoke Server-Side Deletion (handles auth, profiles, contacts, logs)
            const { data, error } = await supabase.functions.invoke('delete-user-data', {
                body: { user_id: deletingUser.id }
            });

            if (error) {
                // Supabase Edge Function connectivity error
                throw error;
            }
            if (data && data.error) {
                // Logic error returned by function
                throw new Error(data.error);
            }

            setUsers(users.filter(u => u.id !== deletingUser.id));
            // Optional: Success message
            // alert(`Successfully deleted ${deletingUser.name}`); 
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(`Failed to delete user: ${err.message || 'Server Error'}`);
        }
    };


    const handleSaveUser = async (userData) => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            if (userData.isNew) {
                const { data, error } = await supabase.from('profiles').insert([{
                    email: userData.email,
                    full_name: userData.name,
                    plan_id: userData.plan.toLowerCase() === 'pro' ? APP_PLANS.PRO : APP_PLANS.FREE,
                    role: ROLES.AGENT || 'agent'
                }]).select();
                if (error) throw error;
                fetchUsers();
            } else {
                let planId = APP_PLANS.FREE;
                if (userData.plan === 'Pro') planId = APP_PLANS.PRO;
                else if (userData.plan === 'Free') planId = APP_PLANS.FREE;
                else {
                    const found = plans.find(p => p.name === userData.plan);
                    planId = found ? found.id : APP_PLANS.FREE;
                }

                const updates = {
                    full_name: userData.name,
                    plan_id: planId,
                    subscription_end_date: planId !== 'free' && userData.expiryDate ? new Date(userData.expiryDate).toISOString() : null
                };

                // If switching to free, ensure expiry is null
                if (updates.plan_id === APP_PLANS.FREE) {
                    updates.subscription_end_date = null;
                }

                const { data, error } = await supabase.from('profiles').update(updates).eq('id', userData.id).select();

                if (error) throw error;
                if (!data || data.length === 0) {
                    alert('Update failed: Check permissions.');
                    fetchUsers();
                    return;
                }
                setUsers(users.map(u => u.id === userData.id ? { ...userData, status: 'Active' } : u));
            }
        } catch (err) {
            setUsers(users.map(u => u.id === userData.id ? { ...userData, status: 'Active' } : u));
            console.error('Error saving user:', err);
        }
        setEditingUser(null);
    };

    const handleSavePlan = async (planData) => {
        try {
            const { supabase } = await import('../services/supabaseClient');

            // Features are already an array from the new UI
            const formattedFeatures = Array.isArray(planData.features) ? planData.features : [];

            if (planData.isNew) {
                const newId = planData.name.toLowerCase().replace(/\s+/g, '_');
                const { error } = await supabase.from('plans').insert([{
                    id: newId,
                    name: planData.name,
                    price_monthly: planData.price_monthly,
                    price_yearly: planData.price_yearly,
                    contact_limit: planData.contact_limit,
                    monthly_message_limit: planData.monthly_message_limit,
                    features: formattedFeatures,
                    is_active: true
                }]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('plans').update({
                    name: planData.name,
                    price_monthly: planData.price_monthly,
                    price_yearly: planData.price_yearly,
                    contact_limit: planData.contact_limit,
                    monthly_message_limit: planData.monthly_message_limit,
                    features: formattedFeatures
                }).eq('id', planData.id);
                if (error) throw error;
            }
            fetchPlans();
        } catch (err) {
            console.error('Error saving plan:', err);
            alert(`Failed to save to Database: ${err.message || JSON.stringify(err)}\n\nUpdating locally only (refresh will reset).`);

            // Local fallback
            if (planData.isNew) {
                setPlans([...plans, { ...planData, id: Date.now().toString() }]);
            } else {
                setPlans(plans.map(p => p.id === planData.id ? planData : p));
            }
        }
        setEditingPlan(null);
    };




    const handleAddPlan = () => {
        setEditingPlan({
            isNew: true,
            name: '',
            price_monthly: 0,
            price_yearly: 0,
            contact_limit: 0,
            monthly_message_limit: 0,
            features: []
        });
    };

    const handleDeletePlan = async (id) => {
        if (!confirm('Delete this plan?')) return;
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { error } = await supabase.from('plans').delete().eq('id', id);
            if (error) throw error;
            fetchPlans();
        } catch (err) {
            console.error('Error deleting plan:', err);
            setPlans(plans.filter(p => p.id !== id));
        }
    };

    const handleSavePromoCode = async (promoData) => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const payload = {
                code: promoData.code,
                reward: promoData.reward,
                status: promoData.status,
                expiry: promoData.expiry,
                usage_limit: promoData.usage_limit
            };

            if (promoData.isNew) {
                const { error } = await supabase.from('promo_codes').insert([payload]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('promo_codes').update(payload).eq('id', promoData.id);
                if (error) throw error;
            }
            fetchPromoCodes();
        } catch (err) {
            console.error('Error saving promo code:', err);
            alert('Failed to save promo code to Database. Updating locally...');
            if (promoData.isNew) {
                setPromoCodes([{ ...promoData, id: Date.now().toString(), usage_count: 0 }, ...promoCodes]);
            } else {
                setPromoCodes(promoCodes.map(p => p.id === promoData.id ? promoData : p));
            }
        }
        setEditingPromo(null);
    };

    const handleDeletePromoCode = async (id) => {
        if (!confirm('Delete this promo code?')) return;
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { error } = await supabase.from('promo_codes').delete().eq('id', id);
            if (error) throw error;
            fetchPromoCodes();
        } catch (err) {
            console.error('Error deleting promo code:', err);
            setPromoCodes(promoCodes.filter(p => p.id !== id));
        }
    };

    return (
        <div className="super-admin-container">
            <header className="sa-header">
                <div>
                    <h1>Super Admin Dashboard</h1>
                    <p>Manage SaaS Users & Automation</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="std-tabs-container">
                <button
                    className={`std-tab-item ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} /> Users
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'followup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followup')}
                >
                    <MessageSquare size={16} /> Automation
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'promocodes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('promocodes')}
                >
                    <Tag size={16} /> Promos
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                >
                    <Settings size={16} /> Plans
                </button>
            </div>

            <div className="sa-content">
                {activeTab === 'users' && (
                    <div className="user-list-view fade-in">
                        <div className="sa-toolbar-enhanced">
                            <div className="sa-search-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    placeholder="Search name, email, etc..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="sa-toolbar-actions">
                                <button
                                    className={`icon-btn-filter ${isFilterOpen ? 'active' : ''}`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    title="Filters"
                                >
                                    <Filter size={20} />
                                </button>
                                <button onClick={fetchUsers} className="secondary-btn" title="Refresh Data" style={{ padding: '0.75rem' }}>
                                    <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                                <button onClick={() => setEditingUser({ name: '', email: '', plan: 'Free', status: 'Active', isNew: true })} className="primary-btn">
                                    <Plus size={18} style={{ marginRight: '8px' }} />
                                    <span className="desktop-only">Add New User</span>
                                    <span className="mobile-only">Add</span>
                                </button>
                            </div>
                        </div>

                        {isFilterOpen && (
                            <div className="sa-filter-panel fade-in">
                                <div className="filter-group">
                                    <label>Filter by Plan:</label>
                                    <div className="filter-pills">
                                        {['All', 'Free', 'Pro'].map(p => (
                                            <button
                                                key={p}
                                                className={`filter-pill ${selectedFilterPlan === p ? 'active' : ''}`}
                                                onClick={() => setSelectedFilterPlan(p)}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="table-responsive-wrapper">
                            <table className="sa-table-modern">
                                <thead>
                                    <tr>
                                        <th>User Profile</th>
                                        <th>Plan ID</th>
                                        <th>Status</th>
                                        <th>Joined Date</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="sa-user-cell">
                                                    <div className={`sa-avatar ${user.plan === 'Pro' ? 'pro' : ''}`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="sa-user-info">
                                                        <div className="sa-user-name">{user.name}</div>
                                                        <div className="sa-user-email">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Plan ID">
                                                <span className={`sa-badge ${user.plan.toLowerCase()}`}>
                                                    {user.plan}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <div className="sa-status-wrapper">
                                                    <span className={`sa-status-dot ${user.status.toLowerCase()}`}></span>
                                                    <span className="sa-status-text">{user.status}</span>
                                                </div>
                                            </td>
                                            <td data-label="Joined Date">
                                                <div className="sa-date-cell">
                                                    <Clock size={12} className="text-muted" />
                                                    <span>{user.joined}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="sa-row-actions">
                                                    <button className="sa-icon-btn" onClick={() => setEditingUser(user)} title="Edit User">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="sa-icon-btn text-danger" onClick={() => handleDeleteUser(user)} title="Delete User">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-state">
                                                <Search size={40} className="empty-icon" />
                                                <p>No users found matching your criteria</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'followup' && (
                    <div className="followup-view fade-in">
                        <div style={{ textAlign: 'center' }}>
                            <div className="role-tabs">
                                <button
                                    className={`role-tab-btn ${selectedRole === 'free' ? 'active' : ''}`}
                                    onClick={() => setSelectedRole('free')}
                                >
                                    Free User Flow
                                </button>
                                <button
                                    className={`role-tab-btn ${selectedRole === 'pro' ? 'active' : ''}`}
                                    onClick={() => setSelectedRole('pro')}
                                >
                                    Pro User Flow
                                </button>
                            </div>
                        </div>

                        <div className="workflow-container">
                            {followUpSettings[selectedRole].map((step, index) => (
                                <div key={step.id} className="flow-card-admin">
                                    <div className="step-badge">{index + 1}</div>
                                    <div className="flow-content">
                                        <div className="flow-header">
                                            <h4>Day {step.day}</h4>
                                            {index === 0 ? (
                                                <span className="sa-badge pro" style={{ fontSize: '0.65rem' }}>Instant</span>
                                            ) : (
                                                <span className="sa-badge free" style={{ fontSize: '0.65rem' }}>
                                                    Wait {step.day - (index > 0 ? followUpSettings[selectedRole][index - 1].day : 0)} days
                                                </span>
                                            )}
                                        </div>
                                        <div className="preview-text">
                                            {step.subject && <div style={{ fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '2px' }}>Subj: {step.subject}</div>}
                                            "{step.contentSms || step.message}"
                                        </div>
                                        <div className="sa-row-actions" style={{ justifyContent: 'flex-start' }}>
                                            <button className="sa-icon-btn" onClick={() => setEditingNode(step)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="sa-icon-btn text-danger" onClick={() => handleDeleteNode(step.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="add-step-btn" onClick={handleAddNode}>
                                <Plus size={24} /> <span>Add Automation Step</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'promocodes' && (
                    <div className="promocodes-view fade-in">
                        <div className="sa-toolbar-enhanced">
                            <div className="sa-section-info">
                                <h3>Active Promo Codes</h3>
                                <p>Manage discounts and trial codes</p>
                            </div>
                            <button className="primary-btn" onClick={() => setEditingPromo({ code: '', reward: '', status: 'ACTIVE', expiry: '', usage_limit: 0, isNew: true })}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> New Code
                            </button>
                        </div>

                        <div className="table-responsive-wrapper" style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            <table className="sa-table-modern">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Reward</th>
                                        <th>Status</th>
                                        <th>Expiry</th>
                                        <th>Usage</th>
                                        <th style={{ textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promoCodes.map(promo => (
                                        <tr key={promo.id}>
                                            <td data-label="Code" style={{ fontWeight: 'bold', fontFamily: 'monospace', color: promo.status === 'ACTIVE' ? '#10b981' : '#64748b' }}>
                                                {promo.code}
                                            </td>
                                            <td data-label="Reward">{promo.reward}</td>
                                            <td data-label="Status">
                                                <span className={`sa-badge ${promo.status === 'ACTIVE' ? 'pro' : 'free'}`}>
                                                    {promo.status}
                                                </span>
                                            </td>
                                            <td data-label="Expiry">{promo.expiry || 'Never'}</td>
                                            <td data-label="Usage">{promo.usage_count || 0}{promo.usage_limit > 0 ? `/${promo.usage_limit}` : ' / ∞'}</td>
                                            <td>
                                                <div className="sa-row-actions">
                                                    <button className="sa-icon-btn" onClick={() => setEditingPromo(promo)}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="sa-icon-btn text-danger" onClick={() => handleDeletePromoCode(promo.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="plans-view fade-in">
                        <div className="sa-plans-header">
                            <div className="sa-section-info">
                                <h3>Subscription Plans</h3>
                                <p>Manage available tiers and pricing</p>
                            </div>
                            <button className="primary-btn" onClick={handleAddPlan}>
                                <Plus size={18} style={{ marginRight: '8px' }} /> Add New Plan
                            </button>
                        </div>
                        <div className="sa-plans-grid-modern">
                            {plans.map(plan => {
                                const isProPlan = plan.id === APP_PLANS.PRO || plan.name.toLowerCase().includes('pro');
                                return (
                                    <div key={plan.id} className={`sa-plan-card ${isProPlan ? 'pro' : ''}`}>
                                        <div className="sa-plan-header">
                                            <div className="sa-plan-title-group">
                                                <div className="sa-plan-icon">
                                                    {isProPlan ? <Crown size={24} /> : <Zap size={24} />}
                                                </div>
                                                <div>
                                                    <h4>{plan.name}</h4>
                                                    <span className={`sa-plan-status-badge ${isProPlan ? 'active' : ''}`}>
                                                        {isProPlan ? 'PREMIUM' : 'BASE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="sa-plan-actions">
                                                <button className="sa-action-btn" onClick={() => setEditingPlan(plan)}><Edit2 size={16} /></button>
                                                <button className="sa-action-btn text-danger" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </div>

                                        <div className="sa-plan-pricing">
                                            <span className="currency">RM</span>
                                            <span className="amount">{plan.price_monthly}</span>
                                            <span className="period">/month</span>
                                        </div>

                                        <div className="sa-plan-features-stats">
                                            <div className="sa-feature-stat">
                                                <Users size={16} />
                                                <div className="stat-info">
                                                    <span className="stat-value">{plan.contact_limit === 0 || plan.contact_limit > 10000 ? 'Unlimited' : plan.contact_limit}</span>
                                                    <span className="stat-label">Contacts</span>
                                                </div>
                                            </div>
                                            <div className="sa-feature-stat">
                                                <MessageSquare size={16} />
                                                <div className="stat-info">
                                                    <span className="stat-value">{plan.monthly_message_limit || 0}</span>
                                                    <span className="stat-label">MSGs / month</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sa-plan-features-list">
                                            <div className="feature-list-title">Included Features</div>
                                            <div className="feature-tags">
                                                {(Array.isArray(plan.features) ? plan.features : []).map((f, i) => {
                                                    const featureDef = AVAILABLE_FEATURES.find(af => af.value === f || af.id === f);
                                                    const label = featureDef ? featureDef.label : f.replace(/_/g, ' ');
                                                    // Fallback label formatting if not found in constant

                                                    return (
                                                        <div key={i} className="feature-tag">
                                                            <CheckCircle2 size={12} />
                                                            <span>{label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {editingNode && <EditNodeModal node={editingNode} onClose={() => setEditingNode(null)} onSave={handleSaveNode} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} plans={plans} />}
            {editingPlan && <EditPlanModal plan={editingPlan} onClose={() => setEditingPlan(null)} onSave={handleSavePlan} />}
            {editingPromo && <EditPromoCodeModal promo={editingPromo} onClose={() => setEditingPromo(null)} onSave={handleSavePromoCode} />}

            <DeleteConfirmationModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={confirmDeleteUser}
                userName={deletingUser?.name}
            />
        </div>
    );
};

export default SuperAdmin;
