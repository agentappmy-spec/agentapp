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
            <div className="modal-content glass-panel" style={{ width: '400px', textAlign: 'center' }}>
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
            <div className="modal-content glass-panel" style={{ width: '600px' }}>
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
                    <label>Message Content ({activeChannel.toUpperCase()})</label>
                    <textarea
                        rows="8"
                        value={currentText}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        placeholder={`Enter your ${activeChannel} message template here...`}
                        style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.4' }}
                    ></textarea>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Use {'{name}'} to customize with contact's name.</span>
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
    // If it's the first step (index 0), delay is 0 (Instant).
    // If index > 0, delay = step.day - prevStep.day.
    const delay = index === 0 ? 0 : (step.day - (prevStep ? prevStep.day : 0));

    // Display text logic
    let delayText = '';
    if (index === 0) {
        delayText = 'Instant'; // First message is always immediate
    } else {
        delayText = `Wait ${delay} day${delay !== 1 ? 's' : ''}`;
    }

    // Determine cumulative label ("Day X")
    const dayLabel = `Day ${step.day}`;

    // Get a preview content (prioritize SMS for preview if available)
    const previewContent = step.contentSms || step.content || step.contentWhatsapp || step.contentEmail || 'No content';

    return (
        <div className="flow-step-wrapper">
            <div className="flow-card">
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

                        <div className="card-actions">
                            <button className="action-btn" onClick={() => onEdit(step)}>
                                <Edit2 size={14} /> Edit
                            </button>
                            <button
                                className="action-btn delete"
                                disabled={!isLast}
                                title={!isLast ? "Can only delete the last step" : "Delete step"}
                                style={{ opacity: !isLast ? 0.4 : 1 }}
                                onClick={() => onDelete(step)}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowList = ({ steps, onEditNode, onDeleteNode }) => {
    if (!steps || steps.length === 0) return <div className="text-center p-8 text-muted">No steps configured.</div>;

    // Sort steps by day just in case
    const sortedSteps = [...steps].sort((a, b) => a.day - b.day);

    return (
        <div className="flow-list-container">
            {sortedSteps.map((step, index) => (
                <FollowUpCard
                    key={step.id}
                    step={step}
                    prevStep={index > 0 ? sortedSteps[index - 1] : null}
                    index={index}
                    isLast={index === sortedSteps.length - 1} // Only last item is true
                    onEdit={onEditNode}
                    onDelete={onDeleteNode}
                />
            ))}
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
                <div className="tabs-header">
                    <button className={`tab-btn ${activeTab === 'prospect' ? 'active' : ''}`} onClick={() => setActiveTab('prospect')}>
                        Prospect Flow
                    </button>
                    <button className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`} onClick={() => setActiveTab('client')}>
                        Client Flow
                    </button>
                    <button className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`} onClick={() => setActiveTab('global')}>
                        Global Reminders
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
                            />
                            <button className="fab-add" onClick={handleAddNode} title="Add New Step">
                                <Plus size={24} />
                            </button>
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
