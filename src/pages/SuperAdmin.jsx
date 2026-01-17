import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
    Send,
    Tag
} from 'lucide-react';
import './SuperAdmin.css';

// --- Components for Auto Follow-up (Adapted) ---

const EditNodeModal = ({ node, onClose, onSave }) => {
    const [cDay, setCDay] = useState(node.day);
    const [contentSms, setContentSms] = useState(node.contentSms || node.message || '');
    const [contentWhatsapp, setContentWhatsapp] = useState(node.contentWhatsapp || node.message || '');
    const [contentEmail, setContentEmail] = useState(node.contentEmail || node.message || '');
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
            <div className="modal-content glass-panel" style={{ width: '600px', background: 'white', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Message Step</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Days after Join (Day 0 = Instant)</label>
                    <input
                        type="number"
                        value={cDay}
                        onChange={(e) => setCDay(Number(e.target.value))}
                        min="0"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                </div>

                <div className="channel-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className={`tab-btn-sm ${activeChannel === 'sms' ? 'active' : ''}`} onClick={() => setActiveChannel('sms')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: activeChannel === 'sms' ? '#2563eb' : 'white', color: activeChannel === 'sms' ? 'white' : '#64748b' }}>SMS</button>
                    <button className={`tab-btn-sm ${activeChannel === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveChannel('whatsapp')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: activeChannel === 'whatsapp' ? '#25D366' : 'white', color: activeChannel === 'whatsapp' ? 'white' : '#64748b' }}>WhatsApp</button>
                    <button className={`tab-btn-sm ${activeChannel === 'email' ? 'active' : ''}`} onClick={() => setActiveChannel('email')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: activeChannel === 'email' ? '#EA4335' : 'white', color: activeChannel === 'email' ? 'white' : '#64748b' }}>Email</button>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Message Content</label>
                    <textarea
                        rows="6"
                        value={getCurrentContent()}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#64748b' }}>Use {'{name}'} for user name.</small>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="secondary-btn" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                    <button className="primary-btn" onClick={() => onSave({ ...node, day: cDay, contentSms, contentWhatsapp, contentEmail, message: contentSms })} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- User Management Components ---

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...user,
        expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : ''
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '500px', background: 'white', padding: '2rem', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit User</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name</label>
                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Plan</label>
                        <select value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                        </select>
                    </div>

                    {formData.plan === 'Pro' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Subscription Expiry</label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <small style={{ color: '#64748b' }}>Set when this user's Pro plan ends.</small>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                    <button onClick={() => onSave(formData)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}>Save User</button>
                </div>
            </div>
        </div>
    );
};

const EditPlanModal = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.join(', ') : plan.features
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '500px', background: 'white', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.isNew ? 'New Plan' : 'Edit Plan'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Plan Name</label>
                    <input
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Monthly Price (RM)</label>
                        <input
                            type="number"
                            value={formData.price_monthly}
                            onChange={e => handleChange('price_monthly', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Yearly Price (RM)</label>
                        <input
                            type="number"
                            value={formData.price_yearly}
                            onChange={e => handleChange('price_yearly', e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Contact Limit</label>
                    <input
                        type="number"
                        value={formData.contact_limit}
                        onChange={e => handleChange('contact_limit', e.target.value)}
                        placeholder="0 for unlimited"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <small style={{ color: '#64748b' }}>Use a large number like 1000000 for "Unlimited", or 0.</small>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Monthly Message Limit</label>
                    <input
                        type="number"
                        value={formData.monthly_message_limit || 0}
                        onChange={e => handleChange('monthly_message_limit', e.target.value)}
                        placeholder="0 for no limit or check logic"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <small style={{ color: '#64748b' }}>Limit for Auto Follow Up messages (0 uses default).</small>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Features (comma separated)</label>
                    <textarea
                        rows="3"
                        value={formData.features}
                        onChange={e => handleChange('features', e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="secondary-btn" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                    <button
                        className="primary-btn"
                        onClick={() => onSave({
                            ...formData,
                            monthly_message_limit: Number(formData.monthly_message_limit) || 0,
                            contact_limit: Number(formData.contact_limit),
                            price_monthly: Number(formData.price_monthly),
                            price_yearly: Number(formData.price_yearly),
                            features: formData.features.split(',').map(f => f.trim()).filter(f => f)
                        })}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}
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
            <div className="modal-content glass-panel" style={{ width: '500px', background: 'white', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{promo.isNew ? 'New Promo Code' : 'Edit Promo Code'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Code</label>
                    <input
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace' }}
                        placeholder="e.g. WELCOME10"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Reward / Description</label>
                    <input
                        value={formData.reward}
                        onChange={e => setFormData({ ...formData, reward: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        placeholder="e.g. 30 Days Pro Trial"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Expiry Date</label>
                        <input
                            type="date"
                            value={formData.expiry}
                            onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <small style={{ color: '#64748b' }}>Leave blank for 'Never'</small>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Usage Limit</label>
                        <input
                            type="number"
                            value={formData.usage_limit || ''}
                            onChange={e => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                            placeholder="Unlimited"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
                    <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                </div>

                <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="secondary-btn" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                    <button
                        className="primary-btn"
                        onClick={() => onSave({
                            ...formData,
                            expiry: formData.expiry || 'Never',
                            usage_limit: formData.usage_limit || 0
                        })}
                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none' }}
                    >
                        Save Promo Code
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuperAdmin = () => {
    const location = useLocation();
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
        fetchUsers();
        fetchPlans();
        fetchPromoCodes();
    }, []);

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
                    plan: u.plan_id ? (u.plan_id === 'pro' ? 'Pro' : 'Free') : 'Free',
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
            { id: 1, day: 0, label: 'Welcome', message: 'Hi {name}, thanks for joining! Add your first contact now.', contentSms: 'Hi {name}, thanks for joining! Add your first contact now.' },
            { id: 2, day: 3, label: 'Tips', message: 'Did you know? Pro users get unlimited contacts.', contentSms: 'Did you know? Pro users get unlimited contacts.' }
        ],
        pro: [
            { id: 1, day: 0, label: 'Welcome Pro', message: 'Welcome to the elite club, {name}!', contentSms: 'Welcome to the elite club, {name}!' }
        ]
    });

    const [selectedRole, setSelectedRole] = useState('free');
    const [editingNode, setEditingNode] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);

    // --- Actions ---

    const handleSaveNode = (updatedNode) => {
        const list = [...followUpSettings[selectedRole]];
        const idx = list.findIndex(x => x.id === updatedNode.id);
        if (idx >= 0) list[idx] = updatedNode;
        list.sort((a, b) => a.day - b.day);

        setFollowUpSettings(prev => ({ ...prev, [selectedRole]: list }));
        setEditingNode(null);
    };

    const handleAddNode = () => {
        const list = followUpSettings[selectedRole];
        const lastDay = list.length > 0 ? list[list.length - 1].day : 0;
        const newNode = {
            id: Date.now(),
            day: lastDay + 3,
            label: `Day ${lastDay + 3}`,
            message: 'New automated message...',
            contentSms: 'New automated message...'
        };
        const newList = [...list, newNode];
        setFollowUpSettings(prev => ({ ...prev, [selectedRole]: newList }));
        setEditingNode(newNode);
    };

    const handleDeleteNode = (id) => {
        if (window.confirm('Delete this step?')) {
            setFollowUpSettings(prev => ({
                ...prev,
                [selectedRole]: prev[selectedRole].filter(n => n.id !== id)
            }));
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user. Ensure you have permission.');
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            if (userData.isNew) {
                const { data, error } = await supabase.from('profiles').insert([{
                    email: userData.email,
                    full_name: userData.name,
                    plan_id: userData.plan.toLowerCase(),
                    role: 'agent'
                }]).select();
                if (error) throw error;
                fetchUsers();
            } else {
                const updates = {
                    full_name: userData.name,
                    plan_id: userData.plan === 'Pro' ? 'pro' : 'free',
                    subscription_end_date: userData.plan === 'Pro' && userData.expiryDate ? new Date(userData.expiryDate).toISOString() : null
                };

                // If switching to free, ensure expiry is null
                if (updates.plan_id === 'free') {
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
            console.error('Error saving user (likely RLS or table missing), using Optimistic Update:', err);
        }
        setEditingUser(null);
    };

    const handleSavePlan = async (planData) => {
        try {
            const { supabase } = await import('../services/supabaseClient');

            // Format features to array if not already
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

    const checkDbRole = async () => {
        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (error) {
                    alert(`Fetch profile error: ${error.message}`);
                } else {
                    alert(`Auth ID: ${user.id}\nDB Role: ${data?.role || 'None (null)'}\n\nIf Role is not 'super_admin', you cannot edit plans.`);
                }
            } else {
                alert('Not authenticated');
            }
        } catch (e) {
            alert(`Error checking role: ${e.message}`);
        }
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
                    <Users size={18} /> User Management
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'followup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followup')}
                >
                    <MessageSquare size={18} /> Auto Follow-Up
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'promocodes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('promocodes')}
                >
                    <Tag size={18} /> Promo Codes
                </button>
                <button
                    className={`std-tab-item ${activeTab === 'plans' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plans')}
                >
                    <Settings size={18} /> Plans & Billing
                </button>
            </div>

            <div className="sa-content">
                {activeTab === 'users' && (
                    <div className="user-list-view">
                        <div className="sa-toolbar">
                            <div className="search-bar">
                                <Search size={18} className="text-gray-400" />
                                <input placeholder="Search users..." />
                            </div>
                            <div className="toolbar-actions">
                                <button onClick={fetchUsers} className="icon-btn-small" title="Refresh"><Clock size={16} /></button>
                                <button onClick={() => setEditingUser({ name: '', email: '', plan: 'Free', status: 'Active', isNew: true })} className="primary-btn small-btn">
                                    <Plus size={16} style={{ marginRight: '4px' }} /> Add User
                                </button>
                            </div>
                        </div>

                        <div className="table-responsive-wrapper">
                            <table className="sa-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Plan</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="avatar-circle">{user.name.charAt(0)}</div>
                                                    <span>{user.name}</span>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td><span className={`badge ${user.plan.toLowerCase()}`}>{user.plan}</span></td>
                                            <td>{user.joined}</td>
                                            <td><span className={`status-dot ${user.status.toLowerCase()}`}></span> {user.status}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button className="icon-btn-small" onClick={() => setEditingUser(user)} title="Edit User">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="icon-btn-small text-danger" onClick={() => handleDeleteUser(user.id)} title="Delete User">
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

                {activeTab === 'followup' && (
                    <div className="followup-view">
                        <div className="role-selector" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <button className={`role-pill ${selectedRole === 'free' ? 'active' : ''}`} onClick={() => setSelectedRole('free')}>Free User Flow</button>
                            <button className={`role-pill ${selectedRole === 'pro' ? 'active' : ''}`} onClick={() => setSelectedRole('pro')}>Pro User Flow</button>
                        </div>

                        <div className="workflow-container">
                            {followUpSettings[selectedRole].map((step, index) => (
                                <div key={step.id} className="flow-card-admin">
                                    <div className="step-badge">{index + 1}</div>
                                    <div className="flow-content">
                                        <div className="flow-header">
                                            <h4>Day {step.day}</h4>
                                            {index === 0 ? <span className="tag-instant">Instant</span> : <span className="tag-wait">Wait {step.day - (index > 0 ? followUpSettings[selectedRole][index - 1].day : 0)} days</span>}
                                        </div>
                                        <p className="preview-text">"{step.contentSms || step.message}"</p>
                                        <div className="flow-actions">
                                            <button onClick={() => setEditingNode(step)}><Edit2 size={14} /> Edit</button>
                                            <button onClick={() => handleDeleteNode(step.id)} className="delete"><Trash2 size={14} /> Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="add-step-btn" onClick={handleAddNode}>
                                <Plus size={24} /> Add Step
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'promocodes' && (
                    <div className="promocodes-view fade-in">
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>Active Promo Codes</h3>
                                <button className="primary-btn small-btn" onClick={() => setEditingPromo({ code: '', reward: '', status: 'ACTIVE', expiry: '', usage_limit: 0, isNew: true })}>+ New Code</button>
                            </div>
                            <div className="table-responsive-wrapper">
                                <table className="sa-table">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Reward</th>
                                            <th>Status</th>
                                            <th>Expiry</th>
                                            <th>Usage</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promoCodes.map(promo => (
                                            <tr key={promo.id}>
                                                <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: promo.status === 'ACTIVE' ? '#10b981' : '#64748b' }}>{promo.code}</td>
                                                <td>{promo.reward}</td>
                                                <td><span className={`badge ${promo.status === 'ACTIVE' ? 'pro' : ''}`} style={promo.status !== 'ACTIVE' ? { background: '#cbd5e1', color: '#475569' } : {}}>{promo.status}</span></td>
                                                <td>{promo.expiry || 'Never'}</td>
                                                <td>{promo.usage_count || 0}{promo.usage_limit > 0 ? `/${promo.usage_limit}` : ' / ∞'}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="icon-btn-small" onClick={() => setEditingPromo(promo)}><Edit2 size={14} /></button>
                                                        <button className="icon-btn-small text-danger" onClick={() => handleDeletePromoCode(promo.id)}><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'plans' && (
                    <div className="plans-view fade-in">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
                            <button className="secondary-btn small-btn" onClick={checkDbRole}>Check My Role</button>
                            <button className="primary-btn small-btn" onClick={handleAddPlan}>+ Add New Plan</button>
                        </div>
                        <div className="sa-plans-grid">
                            {plans.map(plan => (
                                <div key={plan.id} className="glass-panel" style={{ padding: '2rem', borderTop: `4px solid ${plan.name.toLowerCase().includes('pro') ? '#10b981' : '#3b82f6'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h3>{plan.name}</h3>
                                        <div className="flex gap-1">
                                            <button className="icon-btn-small" onClick={() => setEditingPlan(plan)}><Edit2 size={16} /></button>
                                            <button className="icon-btn-small text-danger" onClick={() => handleDeletePlan(plan.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Monthly Price (RM)</label>
                                        <input type="number" value={plan.price_monthly} disabled style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Limit</label>
                                        <input type="text" value={plan.contact_limit === 0 || plan.contact_limit > 10000 ? 'Unlimited' : plan.contact_limit} disabled style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Msg Limit</label>
                                        <input type="text" value={plan.monthly_message_limit || 0} disabled style={{ background: '#f8fafc' }} />
                                    </div>
                                    <div className="form-group">
                                        <label>Features</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {(Array.isArray(plan.features) ? plan.features : []).map((f, i) => (
                                                <span key={i} className={`badge ${plan.name.toLowerCase().includes('pro') ? 'pro' : ''}`}>{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {editingNode && <EditNodeModal node={editingNode} onClose={() => setEditingNode(null)} onSave={handleSaveNode} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
            {editingPlan && <EditPlanModal plan={editingPlan} onClose={() => setEditingPlan(null)} onSave={handleSavePlan} />}
            {editingPromo && <EditPromoCodeModal promo={editingPromo} onClose={() => setEditingPromo(null)} onSave={handleSavePromoCode} />}
        </div>
    );
};

export default SuperAdmin;
