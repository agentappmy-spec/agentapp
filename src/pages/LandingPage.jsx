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
    Link as LinkIcon
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

        // Check permission (super admins bypass this)
        if (userProfile?.role !== 'super_admin' && !checkPermission('landing_page')) {
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

        // Defaults
        if (type === 'bg_hero') baseContent = { title: "New Title", subtitle: "Subtitle...", buttonText: "Click Me" }; // Old hero style fallback
        if (type === 'profile_hero') baseContent = { name: "Name", role: "Role", primaryColor: pageConfig.theme.primaryColor };
        if (type === 'bio') baseContent = { text: "Your bio goes here." };
        if (type === 'links') baseContent = { items: [{ label: 'New Link', url: '#' }], buttonColor: pageConfig.theme.primaryColor };
        if (type === 'products_grid') baseContent = { title: "My Products", items: [{ name: "New Product", description: "Desc" }] };
        if (type === 'form') baseContent = { title: "Contact Us", buttonText: "Send", fields: ['name', 'phone'] };
        if (type === 'footer') baseContent = { text: "Copyright text" };

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
        // Direct switch for better UX - User can always switch back
        setLandingConfig(JSON.parse(JSON.stringify(TEMPLATES[templateKey])));
        setSelectedSectionId(null);
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
            <header className="builder-header glass-panel">
                <div className="header-left">
                    <div className="icon-wrapper">
                        <Layout size={24} className="text-primary" />
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
                            <span className="badge-draft">○ Draft</span>
                        )}
                    </div>

                    <div className="template-switcher">
                        <span className="label-text">Template:</span>
                        <div className="btn-group">
                            <button
                                className="secondary-btn small-btn"
                                onClick={() => applyTemplate('basic')}
                                disabled={userProfile?.is_published}
                            >
                                Basic
                            </button>
                            <button
                                className="secondary-btn small-btn"
                                onClick={() => applyTemplate('pro')}
                                disabled={userProfile?.is_published}
                            >
                                Pro
                            </button>
                        </div>
                    </div>

                    <div className="divider-vertical"></div>

                    <div className="view-toggles">
                        <button className={`toggle-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')} title="Desktop View">
                            <Monitor size={18} />
                        </button>
                        <button className={`toggle-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')} title="Mobile View">
                            <Smartphone size={18} />
                        </button>
                    </div>

                    {/* Action Buttons - Different based on publish status */}
                    {!userProfile?.is_published ? (
                        <>
                            <button
                                className="secondary-btn save-btn"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges || isSaving}
                            >
                                <Save size={18} />
                                <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save *' : 'Saved'}</span>
                            </button>
                            <button
                                className="primary-btn save-btn"
                                onClick={handlePublish}
                                disabled={hasUnsavedChanges}
                            >
                                <Save size={18} />
                                <span>Publish</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="secondary-btn save-btn" onClick={handleCopyLink}>
                                <LinkIcon size={18} />
                                <span className="btn-text-desktop">Copy Link</span>
                                <span className="btn-text-mobile">Copy</span>
                            </button>
                            <button className="secondary-btn save-btn" onClick={handleOpenInNewTab}>
                                <Grid size={18} />
                                <span className="btn-text-desktop">Open Page</span>
                                <span className="btn-text-mobile">Open</span>
                            </button>
                            <button className="primary-btn save-btn" onClick={handleUnpublish}>
                                <Save size={18} />
                                <span>Unpublish</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

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
                                            <label>Name</label>
                                            <input value={selectedSection.content.name} onChange={e => handleUpdateSection(selectedSection.id, { name: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Role / Title</label>
                                            <input value={selectedSection.content.role} onChange={e => handleUpdateSection(selectedSection.id, { role: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Theme Color</label>
                                            <input type="color" value={selectedSection.content.primaryColor} onChange={e => handleUpdateSection(selectedSection.id, { primaryColor: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Image URL</label>
                                            <input placeholder="https://..." value={selectedSection.content.imageUrl || ''} onChange={e => handleUpdateSection(selectedSection.id, { imageUrl: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {selectedSection.type === 'bio' && (
                                    <div className="form-group">
                                        <label>Bio Text</label>
                                        <textarea rows="6" value={selectedSection.content.text} onChange={e => handleUpdateSection(selectedSection.id, { text: e.target.value })} />
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
                                            <label>Products</label>
                                            <ProductEditor items={selectedSection.content.items || []} onChange={items => handleUpdateSection(selectedSection.id, { items })} />
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
                                        <label>Footer Text</label>
                                        <input value={selectedSection.content.text} onChange={e => handleUpdateSection(selectedSection.id, { text: e.target.value })} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="section-list">
                            <h3 style={{ marginBottom: '1rem' }}>Your Sections</h3>
                            <div className="draggable-list">
                                {pageConfig.sections.map((section, idx) => (
                                    <div key={section.id} className="section-item" onClick={() => setSelectedSectionId(section.id)}>
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
                        <LandingRenderer config={pageConfig} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
