import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Save,
    Layout,
    Trash2,
    Move,
    Smartphone,
    Monitor,
    Plus,
    Minus,
    Grid,
    Link as LinkIcon,
    RotateCcw
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import LandingRenderer from '../components/landing/LandingRenderer';
import './LandingPage.css';

// Template Definitions
const TEMPLATES = {
    basic: {
        name: 'Basic Profile',
        theme: { font: 'Inter, sans-serif', primaryColor: '#db2777' },
        sections: [
            {
                id: 'profile-1', type: 'profile_hero', name: 'Profile Header',
                content: { name: 'Your Name', role: 'Takaful Advisor', primaryColor: '#db2777', imageUrl: '' }
            },
            {
                id: 'links-1', type: 'links', name: 'My Links',
                content: {
                    buttonColor: '#db2777', textColor: '#ffffff',
                    items: [
                        { label: 'WhatsApp Me', url: 'https://wa.me/', iconType: 'whatsapp' },
                        { label: 'My Website', url: 'https://example.com', iconType: 'link' }
                    ]
                }
            },
            { id: 'footer-1', type: 'footer', name: 'Footer', content: { text: '© 2026. All rights reserved.' } }
        ]
    },
    pro: {
        name: 'Professional Site',
        theme: { font: 'Inter, sans-serif', primaryColor: '#db2777' },
        sections: [
            {
                id: 'hero-1', type: 'profile_hero', name: 'Welcome',
                content: { name: 'Your Name', role: 'Professional Advisor', primaryColor: '#db2777', imageUrl: '' }
            },
            {
                id: 'bio-1', type: 'bio', name: 'About Me',
                content: { text: 'Hello! I help individuals and families secure their financial future through proper planning and protection.' }
            },
            {
                id: 'products-1', type: 'products_grid', name: 'My Services',
                content: {
                    title: 'How can I help?',
                    cardColor: '#ffffff', accentColor: '#db2777',
                    items: [
                        { name: 'Hibah Takaful', description: 'Debt cancellation and income replacement.' },
                        { name: 'Medical Card', description: 'Comprehensive medical coverage.' },
                        { name: 'Investment', description: 'Grow your wealth with shariah-compliant funds.' }
                    ]
                }
            },
            {
                id: 'links-1', type: 'links', name: 'Quick Links',
                content: {
                    buttonColor: '#db2777', textColor: '#ffffff',
                    items: [
                        { label: 'Free Consultation', url: 'https://wa.me/', iconType: 'whatsapp' }
                    ]
                }
            },
            {
                id: 'form-1', type: 'form', name: 'Contact Form',
                content: { title: 'Get a Quote Today', buttonText: 'Submit Request', fields: ['name', 'phone', 'email'] }
            },
            { id: 'footer-1', type: 'footer', name: 'Footer', content: { text: '© 2026 AgentApp. All rights reserved.' } }
        ]
    }
};

const LandingPage = () => {
    const { setContacts, landingConfig, setLandingConfig, checkPermission, userProfile, setUserProfile } = useOutletContext();
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [usernameError, setUsernameError] = useState('');

    // Initialize with template if no config exists
    useEffect(() => {
        if (!landingConfig) {
            setLandingConfig(TEMPLATES.pro);
        }
    }, [landingConfig, setLandingConfig]);

    // Track changes to mark as unsaved
    useEffect(() => {
        if (landingConfig) {
            setHasUnsavedChanges(true);
        }
    }, [landingConfig]);

    // Use landingConfig from context (synced with DB)
    const pageConfig = landingConfig || TEMPLATES.pro;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ landing_config: landingConfig })
                .eq('id', userProfile.id);

            if (error) {
                alert('❌ Failed to save. Please try again.');
                console.error('Save error:', error);
            } else {
                setHasUnsavedChanges(false);
                alert('✅ Changes saved successfully!');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Something went wrong. Please try again.');
        }
        setIsSaving(false);
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/@${userProfile.username}`;
        navigator.clipboard.writeText(url);
        alert('✅ Link copied to clipboard!');
    };

    const handleOpenInNewTab = () => {
        const url = `${window.location.origin}/@${userProfile.username}`;
        window.open(url, '_blank');
    };

    const handleUnpublish = async () => {
        if (!window.confirm('📝 Unpublish your landing page?\n\nYour page will no longer be publicly accessible until you publish it again.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_published: false })
                .eq('id', userProfile.id);

            if (error) {
                alert('❌ Failed to unpublish. Please try again.');
                console.error('Unpublish error:', error);
                return;
            }

            setUserProfile(prev => ({ ...prev, is_published: false }));
            alert('📝 Your landing page has been unpublished.\n\nYou can now make changes.');
        } catch (err) {
            console.error('Unpublish error:', err);
            alert('❌ Something went wrong. Please try again.');
        }
    };

    const handlePublish = async () => {
        // Check for unsaved changes
        if (hasUnsavedChanges) {
            alert('⚠️ You have unsaved changes!\n\nPlease save your changes before publishing.');
            return;
        }

        // Check permission (super admins and PRO users bypass this)
        const isPro = userProfile?.role === 'pro' || userProfile?.planId === 'pro';

        if (userProfile?.role !== 'super_admin' && !isPro && !checkPermission('landing_page')) {
            if (window.confirm("📢 Publishing your Landing Page is a Pro feature.\n\nFree users can design and edit, but only Pro users can publish their page for the public to see.\n\nUpgrade now to share your professional landing page!\n\nClick OK to view upgrade options.")) {
                window.location.href = '/settings?tab=billing';
            }
            return;
        }

        // Check if user has set a username
        if (!userProfile?.username) {
            if (window.confirm("⚠️ You need to set a username first!\n\nYour username will be your public bio link URL (e.g., agentapp.com/@yourname)\n\nGo to Settings to set your username now?")) {
                window.location.href = '/settings?tab=profile';
            }
            return;
        }

        try {
            // Toggle publish status
            const newPublishStatus = !userProfile?.is_published;

            const { error } = await supabase
                .from('profiles')
                .update({ is_published: newPublishStatus })
                .eq('id', userProfile.id);

            if (error) {
                alert('❌ Failed to publish. Please try again.');
                console.error('Publish error:', error);
                return;
            }

            // Update local state
            setUserProfile(prev => ({ ...prev, is_published: newPublishStatus }));

            if (newPublishStatus) {
                const publicUrl = `${window.location.origin}/@${userProfile.username}`;
                alert(`✅ Your landing page is now published!\n\nPublic URL: ${publicUrl}\n\nCopy this link and add it to your social media bios!`);
            } else {
                alert('📝 Your landing page has been unpublished.\n\nIt is no longer publicly accessible.');
            }
        } catch (err) {
            console.error('Publish error:', err);
            alert('❌ Something went wrong. Please try again.');
        }
    };

    // Handle leads
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'LEAD_SUBMIT') {
                const leadData = event.data.data;
                setContacts(prev => [
                    ...prev,
                    {
                        id: leadData.id,
                        name: leadData.name,
                        phone: leadData.phone,
                        email: leadData.email,
                        role: 'Prospect',
                        status: 'New',
                        tags: ['AgentApp Leads', 'Landing Page'],
                        nextAction: 'Intro Call',
                        dealValue: 0,
                    }
                ]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setContacts]);

    const handleUpdateSection = (id, newContent) => {
        setLandingConfig(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...newContent } } : s)
        }));
    };

    const handleAddSection = (type) => {
        const newId = `${type}-${Date.now()}`;
        let baseContent = {};

        // Defaults using Profile Data
        if (type === 'bg_hero') baseContent = { title: userProfile?.name || "Welcome", subtitle: userProfile?.title || "Professional Advisor", buttonText: "Contact Me" };
        if (type === 'profile_hero') baseContent = {
            name: userProfile?.name || "Your Name",
            role: userProfile?.title || "Professional Advisor",
            primaryColor: pageConfig.theme.primaryColor,
            imageUrl: userProfile?.photoUrl || ''
        };
        if (type === 'bio') baseContent = { text: userProfile?.bio || "Hello! I am here to help you." };
        if (type === 'links') baseContent = {
            items: [{ label: 'WhatsApp Me', url: `https://wa.me/${userProfile?.phone || ''}`, iconType: 'whatsapp' }],
            buttonColor: pageConfig.theme.primaryColor
        };
        if (type === 'products_grid') baseContent = { title: "My Services", items: [{ name: "Service Name", description: "Service Description" }] };
        if (type === 'form') baseContent = { title: "Get in Touch", buttonText: "Submit", fields: ['name', 'phone'] };
        if (type === 'footer') baseContent = { text: `© ${new Date().getFullYear()} ${userProfile?.name || 'AgentApp'}. All rights reserved.` };

        const newSection = { id: newId, type, name: `New ${type}`, content: baseContent };

        setLandingConfig(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        setSelectedSectionId(newId);
    };

    const handleDeleteSection = (id) => {
        if (window.confirm('Delete this section?')) {
            setLandingConfig(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== id)
            }));
            if (selectedSectionId === id) setSelectedSectionId(null);
        }
    };

    const applyTemplate = (templateKey) => {
        const template = JSON.parse(JSON.stringify(TEMPLATES[templateKey]));

        // Inject Profile Data into sections
        template.sections = template.sections.map(section => {
            if (section.type === 'profile_hero' || section.type === 'hero') {
                return {
                    ...section,
                    content: {
                        ...section.content,
                        name: userProfile?.name || section.content.name,
                        role: userProfile?.title || section.content.role,
                        imageUrl: userProfile?.photoUrl || section.content.imageUrl
                    }
                };
            }
            if (section.type === 'bio' && userProfile?.bio) {
                return { ...section, content: { ...section.content, text: userProfile.bio } };
            }
            if (section.type === 'footer') {
                return { ...section, content: { ...section.content, text: `© ${new Date().getFullYear()} ${userProfile?.name || 'AgentApp'}. All rights reserved.` } };
            }
            return section;
        });

        setLandingConfig(template);
        setSelectedSectionId(null);
    };

    const handleResetToDefault = async () => {
        const confirmed = window.confirm(
            '⚠️ Reset to Default Template?\n\n' +
            'This will replace your current landing page with the default Pro template. ' +
            'All your customizations will be lost.\n\n' +
            'Are you sure you want to continue?'
        );

        if (!confirmed) return;

        // Apply the Pro template as default
        applyTemplate('pro');

        // Save to database immediately
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ landing_config: TEMPLATES.pro })
                .eq('id', userProfile.id);

            if (error) throw error;

            alert('✅ Landing page has been reset to default template!');
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error resetting landing page:', error);
            alert('❌ Failed to reset landing page. Please try again.');
        }
    };

    const selectedSection = pageConfig.sections.find(s => s.id === selectedSectionId);

    // Helper: Link Items Editor
    const LinkEditor = ({ items, onChange }) => {
        const updateItem = (idx, field, val) => {
            const newItems = [...items];
            newItems[idx] = { ...newItems[idx], [field]: val };
            onChange(newItems);
        };
        const addItem = () => onChange([...items, { label: 'New Link', url: '#', iconType: 'link' }]);
        const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

        return (
            <div className="list-editor">
                {items.map((item, idx) => (
                    <div key={idx} className="list-item-box">
                        <div className="form-group-row">
                            <input placeholder="Label" value={item.label} onChange={e => updateItem(idx, 'label', e.target.value)} />
                            <input placeholder="URL" value={item.url} onChange={e => updateItem(idx, 'url', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <select value={item.iconType} onChange={e => updateItem(idx, 'iconType', e.target.value)} style={{ fontSize: '0.8rem' }}>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="link">Website</option>
                                <option value="calendar">Calendar</option>
                                <option value="document">Doc</option>
                            </select>
                            <button className="text-danger" onClick={() => removeItem(idx)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                <button className="secondary-btn small-btn" onClick={addItem} style={{ marginTop: '0.5rem' }}>+ Add Link</button>
            </div>
        );
    };

    // Helper: Product Items Editor
    const ProductEditor = ({ items, onChange }) => {
        const updateItem = (idx, field, val) => {
            const newItems = [...items];
            // Handle if item is string or object
            const current = typeof newItems[idx] === 'string' ? { name: newItems[idx] } : newItems[idx];
            newItems[idx] = { ...current, [field]: val };
            onChange(newItems);
        };
        const addItem = () => onChange([...items, { name: 'New Product', description: '' }]);
        const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

        return (
            <div className="list-editor">
                {items.map((item, idx) => (
                    <div key={idx} className="list-item-box">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                value={typeof item === 'string' ? item : item.name}
                                onChange={e => updateItem(idx, 'name', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                rows="2"
                                value={item.description || ''}
                                onChange={e => updateItem(idx, 'description', e.target.value)}
                            />
                        </div>
                        <button className="text-danger small-btn" onClick={() => removeItem(idx)}>Remove Product</button>
                    </div>
                ))}
                <button className="secondary-btn small-btn" onClick={addItem} style={{ marginTop: '0.5rem' }}>+ Add Product</button>
            </div>
        );
    };

    return (
        <div className="landing-builder-container">
            {/* Header */}
            <header className="builder-header">
                <div className="header-left">
                    <div className="icon-wrapper">
                        <Layout size={24} />
                    </div>
                    <div>
                        <h1 className="header-title">Page Builder</h1>
                        <p className="header-subtitle">Create your personal brand.</p>
                    </div>
                </div>

                <div className="header-controls">
                    {/* Status Badge */}
                    <div className="status-badge">
                        {userProfile?.is_published ? (
                            <span className="badge-published">● Published</span>
                        ) : (
                            <span className="badge-draft">○ Draft Mode</span>
                        )}
                    </div>

                    <div className="divider-vertical"></div>

                    <div className="control-group">
                        <span className="control-label">Template</span>
                        <div className="btn-group">
                            <button
                                className={`std-tab-item small-btn ${pageConfig.name === TEMPLATES.basic.name ? 'active' : ''}`}
                                onClick={() => applyTemplate('basic')}
                                disabled={userProfile?.is_published}
                            >
                                Basic
                            </button>
                            <button
                                className={`std-tab-item small-btn ${pageConfig.name === TEMPLATES.pro.name ? 'active' : ''}`}
                                onClick={() => applyTemplate('pro')}
                                disabled={userProfile?.is_published}
                            >
                                Pro
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <span className="control-label">Preview</span>
                        <div className="btn-group">
                            <button
                                className={`std-tab-item small-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                                onClick={() => setPreviewMode('desktop')}
                            >
                                <Monitor size={16} />
                            </button>
                            <button
                                className={`std-tab-item small-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                                onClick={() => setPreviewMode('mobile')}
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="divider-vertical"></div>

                    {/* Reset Button */}
                    {!userProfile?.is_published && (
                        <button
                            className="secondary-btn"
                            onClick={handleResetToDefault}
                            title="Reset to default template"
                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <RotateCcw size={16} />
                            <span className="btn-text-desktop">Reset</span>
                        </button>
                    )}

                    <div className="divider-vertical"></div>

                    {/* Action Buttons */}
                    {!userProfile?.is_published ? (
                        <>
                            <button
                                className="secondary-btn save-btn"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges || isSaving}
                            >
                                <Save size={18} />
                                <span className="btn-text-desktop">
                                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                                </span>
                                <span className="btn-text-mobile">
                                    {isSaving ? '...' : hasUnsavedChanges ? 'Save' : 'Saved'}
                                </span>
                            </button>
                            <button
                                className="primary-btn save-btn"
                                onClick={handlePublish}
                                disabled={hasUnsavedChanges}
                            >
                                <Layout size={18} />
                                <span>Publish</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="secondary-btn save-btn" onClick={handleCopyLink}>
                                <div className="btn-text-desktop"><LinkIcon size={18} /> Copy Link</div>
                                <div className="btn-text-mobile"><LinkIcon size={18} /> Link</div>
                            </button>
                            <button className="secondary-btn save-btn" onClick={handleOpenInNewTab}>
                                <div className="btn-text-desktop"><Grid size={18} /> Open Page</div>
                                <div className="btn-text-mobile"><Grid size={18} /> View</div>
                            </button>
                            <button className="primary-btn save-btn" onClick={handleUnpublish}>
                                <Minus size={18} />
                                <span>Unpublish</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Public Bio Link Section */}
            <div className="public-bio-section">
                <div className="bio-link-header">
                    <h3 className="bio-link-title">Public Bio Link</h3>
                    <p className="bio-link-subtitle">Set your custom username for your public landing page.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: '600', fontSize: '0.95rem' }}>@</span>
                        <input
                            type="text"
                            className={`bio-link-input ${usernameError ? 'error' : ''}`}
                            placeholder="yourname"
                            value={userProfile?.username || ''}
                            onChange={async (e) => {
                                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 20);
                                setUserProfile(prev => ({ ...prev, username: value }));

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

                                if (userProfile?.username && userProfile.username.length >= 4) {
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ username: userProfile.username })
                                        .eq('id', userProfile.id);

                                    if (error) {
                                        setUsernameError('Failed to save username. It might be taken.');
                                    }
                                }
                            }}
                        />
                        {usernameError && (
                            <div className="bio-link-error">{usernameError}</div>
                        )}
                    </div>
                    {userProfile?.username && userProfile.username.length >= 4 && !usernameError && (
                        <button
                            className="secondary-btn bio-link-copy-btn"
                            onClick={() => {
                                const url = `${window.location.origin}/@${userProfile.username}`;
                                navigator.clipboard.writeText(url);
                                alert('✅ Link copied to clipboard!');
                            }}
                        >
                            <LinkIcon size={16} />
                            <span className="btn-text-desktop">Copy Link</span>
                        </button>
                    )}
                </div>
                {userProfile?.username && userProfile.username.length >= 4 && !usernameError && (
                    <div className="bio-link-success">
                        ✓ Your public link: <strong>{window.location.origin}/@{userProfile.username}</strong>
                    </div>
                )}
                {userProfile?.username && userProfile.username.length < 4 && (
                    <div className="bio-link-warning">
                        Username must be at least 4 characters
                    </div>
                )}
                <div className="bio-link-hint">
                    4-20 characters. Letters, numbers, hyphens, and underscores only.
                </div>
            </div>

            <div className="builder-body">
                {/* Edit Lock Overlay */}
                {userProfile?.is_published && (
                    <div className="edit-lock-overlay">
                        <div className="lock-message">
                            <div className="lock-icon">🔒</div>
                            <h3>Page is Published</h3>
                            <p>Unpublish to make changes</p>
                        </div>
                    </div>
                )}

                {/* Left Sidebar */}
                <aside className={`builder-sidebar ${userProfile?.is_published ? 'locked' : ''}`}>
                    {selectedSection ? (
                        <div className="section-editor">
                            <div className="sidebar-header">
                                <button onClick={() => setSelectedSectionId(null)} className="back-btn">← Back</button>
                                <h3 className="section-title">Edit {selectedSection.name}</h3>
                            </div>

                            <div className="editor-form">
                                {selectedSection.type === 'profile_hero' && (
                                    <>
                                        <div className="form-group">
                                            <label>Name <span className="sync-note">(Synced from Profile)</span></label>
                                            <input value={userProfile?.name || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Title <span className="sync-note">(Synced from Profile)</span></label>
                                            <input value={userProfile?.title || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                        <div className="form-group">
                                            <label>Theme Color</label>
                                            <input type="color" value={selectedSection.content.primaryColor} onChange={e => handleUpdateSection(selectedSection.id, { primaryColor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Image URL <span className="sync-note">(Synced from Profile)</span></label>
                                            <input value={userProfile?.photoUrl || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === 'bio' && (
                                    <div className="form-group">
                                        <label>Bio Text <span className="sync-note">(Synced from Profile)</span></label>
                                        <textarea rows="6" value={userProfile?.bio || ''} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                                    </div>
                                )}

                                {selectedSection.type === 'links' && (
                                    <>
                                        <div className="form-group">
                                            <label>Button Color</label>
                                            <input type="color" value={selectedSection.content.buttonColor} onChange={e => handleUpdateSection(selectedSection.id, { buttonColor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Links</label>
                                            <LinkEditor items={selectedSection.content.items || []} onChange={items => handleUpdateSection(selectedSection.id, { items })} />
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === 'products_grid' && (
                                    <>
                                        <div className="form-group">
                                            <label>Section Title</label>
                                            <input value={selectedSection.content.title} onChange={e => handleUpdateSection(selectedSection.id, { title: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Card Color</label>
                                            <input type="color" value={selectedSection.content.cardColor} onChange={e => handleUpdateSection(selectedSection.id, { cardColor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Accent Color</label>
                                            <input type="color" value={selectedSection.content.accentColor} onChange={e => handleUpdateSection(selectedSection.id, { accentColor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Products <span className="sync-note">(Synced from Products Settings)</span></label>
                                            <div className="list-editor">
                                                {userProfile?.products?.length > 0 ? (
                                                    userProfile.products.map((p, idx) => {
                                                        const pName = typeof p === 'string' ? p : p.name;
                                                        const pDesc = selectedSection.content.items?.find(i => (typeof i === 'string' ? i : i.name) === pName)?.description || (typeof p === 'object' ? p.description : '');

                                                        return (
                                                            <div key={idx} className="list-item-box" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                                <div className="form-group" style={{ marginBottom: '8px' }}>
                                                                    <label style={{ fontSize: '0.75rem', fontWeight: '800' }}>Product Name</label>
                                                                    <div style={{ padding: '0.6rem 0.8rem', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
                                                                        {pName}
                                                                    </div>
                                                                </div>
                                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                                    <label style={{ fontSize: '0.75rem', fontWeight: '800' }}>Description (Landing Page)</label>
                                                                    <textarea
                                                                        rows="2"
                                                                        value={pDesc}
                                                                        onChange={(e) => {
                                                                            const newItems = [...(selectedSection.content.items || [])];
                                                                            const existingIdx = newItems.findIndex(i => (typeof i === 'string' ? i : i.name) === pName);
                                                                            if (existingIdx >= 0) {
                                                                                newItems[existingIdx] = { ...newItems[existingIdx], name: pName, description: e.target.value };
                                                                            } else {
                                                                                newItems.push({ name: pName, description: e.target.value });
                                                                            }
                                                                            handleUpdateSection(selectedSection.id, { items: newItems });
                                                                        }}
                                                                        placeholder="Write a custom description for your landing page..."
                                                                        style={{ fontSize: '0.9rem' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>No products configured. Set them in Settings &gt; Products.</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === 'form' && (
                                    <>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input value={selectedSection.content.title} onChange={e => handleUpdateSection(selectedSection.id, { title: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Button Text</label>
                                            <input value={selectedSection.content.buttonText} onChange={e => handleUpdateSection(selectedSection.id, { buttonText: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === 'footer' && (
                                    <div className="form-group">
                                        <label>Footer Text <span className="sync-note">(Auto-generated)</span></label>
                                        <input value={`© ${new Date().getFullYear()} ${userProfile?.name || 'Agent'}. All rights reserved.`} disabled style={{ backgroundColor: '#f8fafc', color: '#64748b' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="section-list">
                            <h3 style={{ marginBottom: '1rem' }}>Your Sections</h3>
                            <div className="draggable-list">
                                {pageConfig.sections.map((section, idx) => (
                                    <div key={section.id} className={`section-item ${selectedSectionId === section.id ? 'active' : ''}`} onClick={() => setSelectedSectionId(section.id)}>
                                        <div className="flex items-center gap-2">
                                            <Move size={14} className="text-gray-400" />
                                            <span>{section.name}</span>
                                        </div>
                                        <button className="delete-icon" onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="add-section-area">
                                <h4>Add Element</h4>
                                <div className="element-grid">
                                    <button className="add-btn" onClick={() => handleAddSection('profile_hero')}> <Layout size={16} /> Header</button>
                                    <button className="add-btn" onClick={() => handleAddSection('bio')}> <Layout size={16} /> Bio Text</button>
                                    <button className="add-btn" onClick={() => handleAddSection('links')}> <LinkIcon size={16} /> Links</button>
                                    <button className="add-btn" onClick={() => handleAddSection('products_grid')}> <Grid size={16} /> Products</button>
                                    <button className="add-btn" onClick={() => handleAddSection('form')}> <Layout size={16} /> Form</button>
                                    <button className="add-btn" onClick={() => handleAddSection('footer')}> <Layout size={16} /> Footer</button>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>

                <main className="builder-canvas">
                    <div className={`preview-wrapper ${previewMode}`}>
                        <LandingRenderer config={pageConfig} profile={userProfile} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
