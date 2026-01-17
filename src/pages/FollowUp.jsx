import React, { useState } from 'react';
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

// --- Components ---

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

                <div className="form-group">
                    <div className="shortcode-bar">
                        <span className="shortcode-label">Shortcodes:</span>
                        <div className="shortcode-chips">
                            {['{name}', '{title}', '{phone}', '{email}', '{agency}', '{license}', '{bio}'].map(code => (
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
                        "{previewContent}"
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
    const { followUpSchedules, setFollowUpSchedules } = useOutletContext();
    const [activeTab, setActiveTab] = useState('prospect'); // 'prospect', 'client'
    const [editingNode, setEditingNode] = useState(null);
    const [deletingNode, setDeletingNode] = useState(null); // Node pending deletion

    const handleSaveNode = (updatedNode) => {
        const currentList = [...followUpSchedules[activeTab]];
        const idx = currentList.findIndex(x => x.id === updatedNode.id);

        if (idx >= 0) {
            currentList[idx] = updatedNode;
        }

        // Sort by day to ensure correct flow
        currentList.sort((a, b) => a.day - b.day);

        setFollowUpSchedules(prev => ({
            ...prev,
            [activeTab]: currentList
        }));
        setEditingNode(null);
    };

    const handleAddNode = () => {
        const currentList = followUpSchedules[activeTab];
        const lastDay = currentList.length > 0 ? currentList[currentList.length - 1].day : 0;
        const newId = `${activeTab.charAt(0)}${Date.now()}`;

        const newNode = {
            id: newId,
            day: lastDay + 3, // Default add 3 days
            label: `Day ${lastDay + 3}`,
            type: 'Unified',
            contentSms: 'New message template...',
            contentWhatsapp: 'New message template...',
            contentEmail: 'New message template...',
            content: 'New message template...'
        };

        const newList = [...currentList, newNode];
        setFollowUpSchedules(prev => ({
            ...prev,
            [activeTab]: newList
        }));
        // Automatically open edit for the new node
        setEditingNode(newNode);
    };

    const handleDeleteClick = (node) => {
        setDeletingNode(node);
    };

    const confirmDelete = () => {
        if (!deletingNode) return;
        const currentList = followUpSchedules[activeTab].filter(n => n.id !== deletingNode.id);

        setFollowUpSchedules(prev => ({
            ...prev,
            [activeTab]: currentList
        }));
        setDeletingNode(null);
    };

    return (
        <div className="followup-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Auto Follow Up</h1>
                    <p className="page-subtitle">Visual workflow builder for automated customer journeys.</p>
                </div>
            </header>

            <div className="content-wrapper glass-panel no-padding">
                <div className="std-tabs-container" style={{ margin: '1.5rem 1.5rem 0' }}>
                    <button className={`std-tab-item ${activeTab === 'prospect' ? 'active' : ''}`} onClick={() => setActiveTab('prospect')}>
                        <User size={16} /> Prospect Flow
                    </button>
                    <button className={`std-tab-item ${activeTab === 'client' ? 'active' : ''}`} onClick={() => setActiveTab('client')}>
                        <Check size={16} /> Client Flow
                    </button>
                    <button className={`std-tab-item ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
                        <Clock size={16} /> Global Reminders
                    </button>
                </div>

                <div className="tab-content no-padding" style={{ background: '#f9fafb', height: '100%', overflowY: 'auto' }}>
                    {activeTab === 'global' ? (
                        <div className="global-reminders-grid" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {followUpSchedules.global && followUpSchedules.global.map(item => (
                                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.trigger === 'Birthday' ? <User size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.trigger}</h3>
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
                                        {item.clientOnly && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: 500, border: '1px solid #bfdbfe' }}>
                                                Clients Only
                                            </span>
                                        )}
                                        {item.mandatory && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 500, border: '1px solid #fde68a' }}>
                                                Mandatory
                                            </span>
                                        )}
                                        {item.daysBefore && (
                                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#7c3aed', fontWeight: 500, border: '1px solid #e9d5ff' }}>
                                                {item.daysBefore} days before
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
                                steps={followUpSchedules[activeTab]}
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
