import { supabase } from '../services/supabaseClient';

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    MessageSquare,
    Clock,
    Plus,
    Edit2,
    Trash2,
    Mail,
    MessageCircle,
    User,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import './FollowUp.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const isMatch = confirmText === 'DELETE';

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ margin: '0 auto', width: '50px', height: '50px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <AlertTriangle size={24} />
                </div>
                <h3 className="modal-title">Delete Follow-up Step?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    This action cannot be undone. To confirm, please type <strong>DELETE</strong> below.
                </p>
                <input
                    type="text"
                    className="delete-confirm-input"
                    placeholder="Type DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                />
                <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="primary-btn"
                        style={{ background: isMatch ? '#ef4444' : '#e2e8f0', cursor: isMatch ? 'pointer' : 'not-allowed' }}
                        disabled={!isMatch}
                        onClick={onConfirm}
                    >
                        Delete Step
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditNodeModal = ({ node, onClose, onSave }) => {
    // Determine initial cumulative day
    const [cDay, setCDay] = useState(node.day);
    const [cDate, setCDate] = useState(node.date || '');

    // Channel Content States - Initialize from node or fallback
    const [contentSms, setContentSms] = useState(node.contentSms || node.content || '');
    const [contentWhatsapp, setContentWhatsapp] = useState(node.contentWhatsapp || node.content || '');
    const [contentEmail, setContentEmail] = useState(node.contentEmail || node.content || '');

    const [activeChannel, setActiveChannel] = useState('sms'); // 'sms', 'whatsapp', 'email'
    const [subject, setSubject] = useState(node.subject || '');

    // Helper to get current content based on tab
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

    // Stats Calculation
    const currentText = getCurrentContent();
    const charCount = currentText.length;
    const smsCount = activeChannel === 'sms' ? (Math.ceil(charCount / 160) || 1) : 0;
    const isTooLong = activeChannel === 'sms' && charCount > 160;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '600px' }}>
                <h2 className="modal-title">Edit Follow Up Step</h2>

                <div className="form-group" style={{ display: node.trigger ? 'none' : 'flex' }}>
                    <label>Days after trigger (Cumulative Node Day)</label>
                    <input
                        type="number"
                        value={cDay}
                        onChange={(e) => setCDay(Number(e.target.value))}
                        min="0"
                    />
                    <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-muted)' }}>
                        This represents the cumulative day count from the start (Day 0).
                    </small>
                </div>

                {node.trigger && node.trigger !== 'Birthday' && node.date !== 'auto' && (
                    <div className="form-group">
                        <label>Event Date</label>
                        <input
                            type="date"
                            value={cDate}
                            onChange={(e) => setCDate(e.target.value)}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-primary)' }}
                        />
                    </div>
                )}

                <div className="channel-tabs">
                    <button
                        className={`tab-btn-sm ${activeChannel === 'sms' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('sms')}
                        style={{ background: activeChannel === 'sms' ? 'var(--primary)' : 'transparent', color: activeChannel === 'sms' ? 'white' : 'var(--text-secondary)' }}
                    >
                        SMS
                    </button>
                    <button
                        className={`tab-btn-sm ${activeChannel === 'whatsapp' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('whatsapp')}
                        style={{ background: activeChannel === 'whatsapp' ? '#25D366' : 'transparent', color: activeChannel === 'whatsapp' ? 'white' : 'var(--text-secondary)' }}
                    >
                        WhatsApp
                    </button>
                    <button
                        className={`tab-btn-sm ${activeChannel === 'email' ? 'active' : ''}`}
                        onClick={() => setActiveChannel('email')}
                        style={{ background: activeChannel === 'email' ? '#EA4335' : 'transparent', color: activeChannel === 'email' ? 'white' : 'var(--text-secondary)' }}
                    >
                        Email
                    </button>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Email Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject line for email notifications..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-primary)', fontWeight: '500' }}
                    />
                    <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>This subject will be used when sending email follow-ups.</small>
                </div>

                <div className="form-group">
                    <div className="shortcode-bar">
                        <span className="shortcode-label">Shortcodes:</span>
                        <div className="shortcode-chips">
                            {['{name}', '{title}', '{agent_name}', '{phone}', '{agency}', '{license}', '{bio}'].map(code => (
                                <button
                                    key={code}
                                    type="button"
                                    className="shortcode-chip"
                                    onClick={(e) => {
                                        navigator.clipboard.writeText(code);
                                        const btn = e.currentTarget;
                                        const original = btn.innerText;
                                        btn.innerText = 'Copied!';
                                        btn.classList.add('copied');
                                        setTimeout(() => {
                                            btn.innerText = original;
                                            btn.classList.remove('copied');
                                        }, 1000);
                                    }}
                                    title="Click to copy"
                                >
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        rows="8"
                        value={currentText}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        placeholder={`Enter your ${activeChannel} message template here...`}
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.4' }}
                    ></textarea>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontStyle: 'italic' }}>Tip: Click a shortcode above to copy it.</span>
                        <span>
                            {charCount} chars
                            {activeChannel === 'sms' && <span style={{ color: isTooLong ? '#ef4444' : 'inherit', marginLeft: '6px' }}>({smsCount} SMS)</span>}
                        </span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>Cancel</button>
                    <button className="primary-btn" onClick={() => onSave({
                        ...node,
                        day: cDay,
                        date: cDate,
                        contentSms,
                        contentWhatsapp,
                        contentEmail,
                        subject,
                        content: contentSms // Fallback
                    })}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const FollowUpCard = ({ step, prevStep, index, isLast, onEdit, onDelete }) => {
    // Calculate relative delay
    const delay = index === 0 ? 0 : (step.day - (prevStep ? prevStep.day : 0));
    let delayText = index === 0 ? 'Instant' : `Wait ${delay} day${delay !== 1 ? 's' : ''}`;
    const dayLabel = `Day ${step.day}`;
    const previewContent = step.contentSms || step.content || step.contentWhatsapp || step.contentEmail || 'No content';
    const emailSubject = step.subject || 'No Subject';

    // Swipe Logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isSwiped, setIsSwiped] = useState(false);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) setIsSwiped(true);
        if (isRightSwipe) setIsSwiped(false);
    };

    return (
        <div className="flow-step-wrapper" style={{ overflow: 'hidden' }}>
            <div
                className="flow-card"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                    transform: isSwiped ? 'translateX(-100px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease'
                }}
            >
                <div className="step-indicator">
                    <div className={`step-circle ${index === 0 ? 'start-node' : ''}`}>
                        {index === 0 ? <Check size={24} /> : (index + 1)}
                    </div>
                </div>

                <div className="card-content">
                    <div className="card-header">
                        <div className="step-info">
                            <h3>{dayLabel}</h3>
                            <div className="wait-badge">
                                <Clock size={12} />
                                {delayText}
                            </div>
                        </div>
                    </div>

                    <div className="card-message-preview">
                        {step.subject && (
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                                <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                Subject: {step.subject}
                            </div>
                        )}
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            "{previewContent}"
                        </div>
                    </div>

                    <div className="card-footer">
                        {/* Icons ... */}
                        <div className="channel-icons">
                            <div className="channel-icon" style={{ background: 'var(--primary)' }} title="SMS Enabled">
                                <MessageSquare size={14} />
                            </div>
                            <div className="channel-icon" style={{ background: '#25D366' }} title="WhatsApp Enabled">
                                <MessageCircle size={14} />
                            </div>
                            <div className="channel-icon" style={{ background: '#EA4335' }} title="Email Enabled">
                                <Mail size={14} />
                            </div>
                        </div>

                        {/* Desktop Actions (always visible) */}
                        <div className="card-actions desktop-only-actions">
                            <button className="action-btn" onClick={() => onEdit(step)}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                className="action-btn delete"
                                disabled={!isLast}
                                style={{ opacity: !isLast ? 0.4 : 1 }}
                                onClick={() => onDelete(step)}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Swipe Actions Background (Mobile) */}
            <div className="swipe-actions" style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '100px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                opacity: isSwiped ? 1 : 0
            }}>
                <button onClick={() => onEdit(step)} className="mobile-swipe-btn edit" style={{ background: '#3b82f6' }}>
                    <Edit2 size={18} color="white" />
                </button>
                <button
                    onClick={() => onDelete(step)}
                    className="mobile-swipe-btn delete"
                    style={{ background: '#ef4444', opacity: !isLast ? 0.5 : 1 }}
                    disabled={!isLast}
                >
                    <Trash2 size={18} color="white" />
                </button>
            </div>
        </div>
    );
};

const WorkflowList = ({ steps, onEditNode, onDeleteNode, onAddStep }) => {
    // Determine the empty state but still show the add button even if empty
    const sortedSteps = (steps || []).sort((a, b) => a.day - b.day);

    return (
        <div className="flow-list-container">
            {sortedSteps.length === 0 ? (
                <div className="text-center p-8 text-muted">No steps configured. Start by adding one below.</div>
            ) : (
                sortedSteps.map((step, index) => (
                    <FollowUpCard
                        key={step.id}
                        step={step}
                        prevStep={index > 0 ? sortedSteps[index - 1] : null}
                        index={index}
                        isLast={index === sortedSteps.length - 1}
                        onEdit={onEditNode}
                        onDelete={onDeleteNode}
                    />
                ))
            )}

            <button className="add-step-card" onClick={onAddStep}>
                <Plus size={20} /> Add Next Step
            </button>
        </div>
    );
};

const FollowUp = () => {
    // Note: We no longer rely on 'followUpSchedules' from context for the data source
    // We will fetch from Supabase 'workflow_steps' table.
    const { userProfile } = useOutletContext();
    const [activeTab, setActiveTab] = useState('prospect'); // 'prospect', 'client', 'global'
    const [editingNode, setEditingNode] = useState(null);
    const [deletingNode, setDeletingNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dbSteps, setDbSteps] = useState({ prospect: [], client: [], global: [] });

    // Fetch Steps on Mount
    useEffect(() => {
        fetchSteps();
    }, []);

    const fetchSteps = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('workflow_steps')
                .select('*')
                .order('day', { ascending: true });

            if (error) throw error;

            // Strategy: Separate Global (user_id is null) vs Personal (user_id is set)
            // Create a map where Personal overrides Global for the same slot (day or trigger_name)

            const mergedData = [];
            const personalMap = new Map();
            const globalList = [];

            // 1. Identify Personal Overrides
            data.forEach(item => {
                if (item.user_id) {
                    // Create unique key for slot
                    const key = `${item.template_id}-${item.day !== null ? item.day : item.trigger_name}`;
                    personalMap.set(key, item);
                } else {
                    globalList.push(item);
                }
            });

            // 2. Build Final List
            // Start with Global items. If a personal override exists, use that instead.
            // also include personal items that might be purely new additions (not overriding global) - though UI doesn't explicitly support 'add new' unless logic allows.

            // Set of keys processed from global
            const processedKeys = new Set();

            globalList.forEach(globalItem => {
                const key = `${globalItem.template_id}-${globalItem.day !== null ? globalItem.day : globalItem.trigger_name}`;
                if (personalMap.has(key)) {
                    // Use Personal Override
                    // Add a flag to UI to show it's 'Edited'
                    const pItem = personalMap.get(key);
                    mergedData.push({ ...pItem, isPersonal: true });
                } else {
                    // Use Global Default
                    mergedData.push({ ...globalItem, isGlobal: true });
                }
                processedKeys.add(key);
            });

            // 3. Add any Personal items that didn't match a global key (Custom added steps)
            personalMap.forEach((item, key) => {
                if (!processedKeys.has(key)) {
                    mergedData.push({ ...item, isPersonal: true });
                }
            });

            // Group by template_id
            const grouped = {
                prospect: mergedData.filter(d => d.template_id === 'prospect'),
                client: mergedData.filter(d => d.template_id === 'client'),
                global: mergedData.filter(d => d.template_id === 'global').sort((a, b) => {
                    if (a.date && b.date && a.date !== 'auto' && a.date !== 'auto') {
                        return new Date(a.date) - new Date(b.date);
                    }
                    return 0;
                })
            };

            setDbSteps(grouped);
        } catch (err) {
            console.error('Error fetching steps:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNode = async (updatedNode) => {
        try {
            // Check if we are editing a Global Node (user_id is null)
            // If so, we must INSERT a new personal copy.
            // If it's already Personal (user_id is set), we UPDATE.

            const isGlobal = !updatedNode.user_id;

            if (isGlobal) {
                // CLONE ON WRITE (Insert Personal Override)
                const { data: { user } } = await supabase.auth.getUser(); // Ensure we have user
                if (!user) throw new Error("No user found");

                const newStep = {
                    user_id: user.id, // Use authenticated user ID directly
                    template_id: updatedNode.template_id,
                    day: updatedNode.day,
                    date: updatedNode.date,
                    content_sms: updatedNode.contentSms || updatedNode.content,
                    content_whatsapp: updatedNode.contentWhatsapp,
                    content_email: updatedNode.contentEmail,
                    subject: updatedNode.subject,
                    trigger_name: updatedNode.trigger_name || updatedNode.label,
                    is_active: true,
                    // Copy other fields if needed
                    client_only: updatedNode.client_only,
                    mandatory: updatedNode.mandatory,
                    days_before: updatedNode.days_before
                };

                const { error } = await supabase.from('workflow_steps').insert([newStep]);
                if (error) throw error;

            } else {
                // UPDATE Existing Personal Node
                const { error } = await supabase
                    .from('workflow_steps')
                    .update({
                        day: updatedNode.day,
                        date: updatedNode.date,
                        content_sms: updatedNode.contentSms || updatedNode.content,
                        content_whatsapp: updatedNode.contentWhatsapp,
                        content_email: updatedNode.contentEmail,
                        subject: updatedNode.subject,
                        trigger_name: updatedNode.trigger_name || updatedNode.label,
                        updated_at: new Date()
                    })
                    .eq('id', updatedNode.id);

                if (error) throw error;
            }

            fetchSteps();
            setEditingNode(null);
        } catch (err) {
            console.error('Error saving step:', err);
            alert('Failed to save changes.');
        }
    };

    // Add Step Logic (Insert to DB) - Always specific user
    const handleAddNode = async () => {
        const currentList = dbSteps[activeTab];
        const lastDay = currentList.length > 0 ? (currentList[currentList.length - 1].day || 0) : 0;

        try {
            const newNode = {
                user_id: userProfile?.id, // Personal Step
                template_id: activeTab,
                day: lastDay + 3,
                trigger_name: `Day ${lastDay + 3}`,
                content_sms: 'New message template...',
                content_whatsapp: 'New message template...',
                content_email: 'New message template...',
                is_active: true
            };

            const { data, error } = await supabase
                .from('workflow_steps')
                .insert([newNode])
                .select();

            if (error) throw error;

            fetchSteps();
            if (data && data[0]) {
                const created = data[0];
                setEditingNode({
                    ...created,
                    contentSms: created.content_sms,
                    contentWhatsapp: created.content_whatsapp,
                    contentEmail: created.content_email,
                    subject: created.subject
                });
            }
        } catch (err) {
            console.error('Error creating step:', err);
        }
    };

    const handleDeleteClick = (node) => {
        // If Global, warn or disallow
        if (!node.user_id) {
            // Optional: You could allow "hiding" via another mechanism, but for now strict "no delete default"
            alert("You cannot delete a System Default step. You can only edit it to create your own version.");
            return;
        }
        setDeletingNode(node);
    };

    const confirmDelete = async () => {
        if (!deletingNode) return;
        try {
            const { error } = await supabase
                .from('workflow_steps')
                .delete()
                .eq('id', deletingNode.id);

            if (error) throw error;
            fetchSteps();
            setDeletingNode(null);
        } catch (err) {
            console.error('Error deleting step:', err);
            alert('Failed to delete step.');
        }
    };

    // --- Mapper Function to Bridge DB Schema to UI Components ---
    // The UI components (FollowUpCard, EditNodeModal) expect specific props like `contentSms` not `content_sms`
    const mapDbToUi = (items) => {
        return items.map(item => ({
            ...item,
            label: item.trigger_name || `Day ${item.day}`,
            contentSms: item.content_sms,
            contentWhatsapp: item.content_whatsapp,
            contentEmail: item.content_email,
            content: item.content_sms // Fallback key
        }));
    };

    const activeList = mapDbToUi(dbSteps[activeTab] || []);

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading workflows...</div>;
    }

    return (
        <div className="followup-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Auto Follow Up</h1>
                    <p className="page-subtitle">Visual workflow builder for automated customer journeys.</p>
                </div>
            </header>

            <div className="content-wrapper glass-panel no-padding">
                <div className="std-tabs-container">
                    <button className={`std-tab-item ${activeTab === 'prospect' ? 'active' : ''}`} onClick={() => setActiveTab('prospect')}>
                        <User size={16} /> Prospect
                    </button>
                    <button className={`std-tab-item ${activeTab === 'client' ? 'active' : ''}`} onClick={() => setActiveTab('client')}>
                        <Check size={16} /> Client
                    </button>
                    <button className={`std-tab-item ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
                        <Clock size={16} /> Reminders
                    </button>
                </div>

                <div className="tab-content no-padding" style={{ background: '#f9fafb', height: '100%', overflowY: 'auto' }}>
                    {activeTab === 'global' ? (
                        <div className="global-reminders-grid" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {activeList.map(item => (
                                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {(item.trigger_name || '').includes('Birthday') ? <User size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.trigger_name || item.trigger}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {item.date ? (item.date === 'auto' ? 'Auto-detected' : (() => {
                                                    const [y, m, d] = item.date.split('-');
                                                    return `Date: ${d}-${m}-${y}`;
                                                })()) : 'Based on Contact Data'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badges for Client-Only and Mandatory */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {item.client_only && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: 500, border: '1px solid #bfdbfe' }}>
                                                Clients Only
                                            </span>
                                        )}
                                        {item.mandatory && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 500, border: '1px solid #fde68a' }}>
                                                Mandatory
                                            </span>
                                        )}
                                        {item.days_before && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7c3aed', fontWeight: 500, border: '1px solid #e9d5ff' }}>
                                                {item.days_before} days before
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        "{item.contentSms || item.content}"
                                    </div>
                                    <button
                                        className="secondary-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => setEditingNode(item)}
                                    >
                                        <Edit2 size={16} /> Edit Message
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <WorkflowList
                                steps={activeList}
                                onEditNode={setEditingNode}
                                onDeleteNode={handleDeleteClick}
                                onAddStep={handleAddNode}
                            />
                        </>
                    )}
                </div>
            </div>

            {editingNode && (
                <EditNodeModal
                    node={editingNode}
                    onClose={() => setEditingNode(null)}
                    onSave={handleSaveNode}
                />
            )}

            {deletingNode && (
                <DeleteConfirmationModal
                    isOpen={!!deletingNode}
                    onClose={() => setDeletingNode(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
};

export default FollowUp;
