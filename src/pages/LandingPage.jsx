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
    const { setContacts } = useOutletContext();
    const [pageConfig, setPageConfig] = useState(() => {
        const saved = localStorage.getItem('agent_landing_config');
        return saved ? JSON.parse(saved) : TEMPLATES.pro;
    });

    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [previewMode, setPreviewMode] = useState('desktop');

    // Auto-save
    useEffect(() => {
        localStorage.setItem('agent_landing_config', JSON.stringify(pageConfig));
    }, [pageConfig]);

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
        setPageConfig(prev => ({
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

        setPageConfig(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        setSelectedSectionId(newId);
    };

    const handleDeleteSection = (id) => {
        if (window.confirm('Delete this section?')) {
            setPageConfig(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== id)
            }));
            if (selectedSectionId === id) setSelectedSectionId(null);
        }
    };

    const applyTemplate = (templateKey) => {
        // Direct switch for better UX - User can always switch back
        setPageConfig(JSON.parse(JSON.stringify(TEMPLATES[templateKey])));
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
            <header className="builder-header">
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <Layout size={24} className="text-primary" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Page Builder</h1>
                        <p className="text-xs text-gray-500">Create your link-in-bio or landing page.</p>
                    </div>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                    <div className="template-switcher desktop-only">
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', marginRight: '8px' }}>Template:</span>
                        <button className="secondary-btn small-btn" onClick={() => applyTemplate('basic')}>Basic</button>
                        <button className="secondary-btn small-btn" onClick={() => applyTemplate('pro')}>Pro</button>
                    </div>

                    <div className="view-toggles">
                        <button className={`toggle-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')} title="Desktop">
                            <Monitor size={18} />
                        </button>
                        <button className={`toggle-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')} title="Mobile">
                            <Smartphone size={18} />
                        </button>
                    </div>
                    <button className="primary-btn">
                        <Save size={18} style={{ marginRight: '8px' }} />
                        Save
                    </button>
                </div>
            </header>

            <div className="builder-body">
                {/* Left Sidebar */}
                <aside className="builder-sidebar">
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
