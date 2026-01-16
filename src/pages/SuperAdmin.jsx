import React, { useState, useEffect } from 'react';
import {
    Users,
    MessageCircle,
    Settings,
    Search,
    Filter,
    Edit2,
    Trash2,
    Plus,
    X,
    Clock,
    Send
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
    const [formData, setFormData] = useState({ ...user });

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


const SuperAdmin = () => {
    const [activeTab, setActiveTab] = useState('users');

    // Real Data from Supabase
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        // Try to fetch from 'profiles' table first (if created)
        // Since we don't have a guaranteed 'profiles' table yet, this might fail unless backend exists.
        // Fallback: We can't list authorized users client-side without Admin API.
        // BUT, for this specific app, let's assume we relying on 'profiles' table or similar.

        try {
            const { supabase } = await import('../services/supabaseClient');

            // 1. Try fetching profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            if (data) {
                // Map Supabase profile to UI format
                const mappedUsers = data.map(u => ({
                    id: u.id,
                    name: u.full_name || u.email?.split('@')[0] || 'User',
                    email: u.email,
                    plan: u.plan_id ? (u.plan_id === 'pro' ? 'Pro' : 'Free') : 'Free', // Fallback
                    status: 'Active',
                    joined: new Date(u.created_at || Date.now()).toLocaleDateString()
                }));
                setUsers(mappedUsers);
            }
        } catch (err) {
            console.warn('Failed to fetch users from Supabase (Table "profiles" likely missing).', err);
            // Fallback: No users if connection fails or table missing.
            setUsers([]);
        } finally {
            setIsLoading(false);
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

    // --- Actions ---

    const handleSaveNode = (updatedNode) => {
        const list = [...followUpSettings[selectedRole]];
        const idx = list.findIndex(x => x.id === updatedNode.id);
        if (idx >= 0) list[idx] = updatedNode;
        list.sort((a, b) => a.day - b.day);

        setFollowUpSettings(prev => ({
            ...prev,
            [selectedRole]: list
        }));
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

    const handleSaveUser = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    return (
        <div className="super-admin-container">
            <header className="sa-header">
                <div>
                    <h1>Super Admin Dashboard</h1>
                    <p>Manage SaaS Users & Automation</p>
                </div>
            </header>

            {/* Redesigned Tabs - Modern Look */}
            <div className="sa-tabs-modern">
                <button
                    className={`sa-tab-item ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} /> User Management
                </button>
                <button
                    className={`sa-tab-item ${activeTab === 'followup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followup')}
                >
                    <MessageCircle size={18} /> Auto Follow-Up
                </button>
            </div>

            <div className="sa-content">
                {activeTab === 'users' && (
                    <div className="user-list-view">
                        <div className="toolbar" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <div className="search-bar" style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '0.5rem', width: '300px' }}>
                                <Search size={18} className="text-gray-400" />
                                <input placeholder="Search users..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
                            </div>
                            <button onClick={fetchUsers} className="icon-btn-small" title="Refresh"><Clock size={16} /></button>
                        </div>

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
                                            <button className="icon-btn-small" onClick={() => setEditingUser(user)} title="Edit User">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
            </div>

            {editingNode && <EditNodeModal node={editingNode} onClose={() => setEditingNode(null)} onSave={handleSaveNode} />}
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
        </div>
    );
};

export default SuperAdmin;
