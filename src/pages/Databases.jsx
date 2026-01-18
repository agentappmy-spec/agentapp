import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Phone,
    UserCheck,
    AlertCircle,
    Clock,
    Briefcase,
    MessageCircle, // For WhatsApp
    Settings,
    Edit, // For Edit button
    LayoutList,
    LayoutGrid
} from 'lucide-react';
// import AddContactModal from '../components/AddContactModal'; // Moved to App.jsx
import TagManagerModal from '../components/TagManagerModal';
import { useMessageLimit } from '../hooks/useMessageLimit'; // Import the hook
import './Databases.css';

const StatusBadge = ({ status, role }) => {
    let styleClass = 'status-default';

    // Client Statuses
    if (status === 'Active') styleClass = 'status-success';
    if (status === 'Grace Period') styleClass = 'status-warning';
    if (status === 'Lapsed') styleClass = 'status-error';

    // Prospect Statuses
    if (status === 'New') styleClass = 'status-info';
    if (status === 'Warm') styleClass = 'status-warm';
    if (status === 'KIV') styleClass = 'status-default';

    return <span className={`status-badge ${styleClass}`}>{status}</span>;
}

const ProductTag = ({ name }) => (
    <span className="product-tag">{name}</span>
);

const InfoTag = ({ name }) => {
    let className = 'info-tag';
    const lower = name.toLowerCase();

    if (lower.includes('paymaster') || lower.includes('auto-debit') || lower.includes('yearly')) className += ' tag-green';
    else if (lower.includes('late') || lower.includes('manual') || lower.includes('failed')) className += ' tag-red';
    else if (lower.includes('vip') || lower.includes('worth')) className += ' tag-gold';
    else className += ' tag-blue';

    return <span className={className}>{name}</span>
}

const KanbanCard = ({ contact, openEditModal }) => (
    <div className="kanban-card" onClick={() => openEditModal(contact)}>
        <div className="card-header">
            <span className="card-title">{contact.name}</span>
            <MoreVertical size={16} className="text-muted" />
        </div>

        <div className="card-value">
            {contact.dealValue ? `RM ${contact.dealValue.toLocaleString()}` : 'No Value'}
        </div>

        <div className="card-footer">
            <div className={`user-avatar-xs ${contact.role === 'Client' ? 'avatar-client' : 'avatar-prospect'}`}>
                {contact.name.charAt(0)}
            </div>
            <div className="card-actions">
                <MessageCircle size={14} className="text-muted hover-primary" />
                <Phone size={14} className="text-muted hover-primary" />
            </div>
        </div>
        {contact.nextAction && (
            <div className="card-meta">
                <Clock size={12} /> {contact.nextAction}
            </div>
        )}
    </div>
);

const KanbanColumn = ({ title, status, contacts, openEditModal, totalValue }) => (
    <div className="kanban-column">
        <div className="column-header">
            <div className={`status-dot dot-${status.toLowerCase().replace(' ', '-')}`}></div>
            <span className="column-title">{title}</span>
            <span className="column-count">{contacts.length}</span>
        </div>
        <div className="column-value">RM {totalValue.toLocaleString()}</div>
        <div className="column-body">
            {contacts.map(contact => (
                <KanbanCard key={contact.id} contact={contact} openEditModal={openEditModal} />
            ))}
        </div>
        <button className="add-deal-btn" onClick={() => openEditModal(null)}>+ Add Deal</button>
    </div>
);

const Databases = () => {
    const {
        contacts,
        setContacts,
        availableProducts,
        setAvailableProducts,
        availableTags,
        setAvailableTags,
        openAddModal, // Global context
        setEditingContact: setGlobalEditingContact, // Global context
        setIsContactModalOpen, // Global context
        userProfile, // Needed for limit check
        integrations
    } = useOutletContext();

    const { logMessage, canSendMessage, usage, limit } = useMessageLimit(userProfile);

    const handleWhatsAppClick = (phone) => {
        if (!integrations.whatsapp?.enabled) {
            alert('WhatsApp integration is disabled. Please enable it in Settings > Integrations.');
            return;
        }

        if (!canSendMessage) {
            alert(`🚫 Message limit reached (${usage}/${limit}).\n\nPlease upgrade your plan to send more messages.`);
            return;
        }

        // Log the message
        logMessage('whatsapp', phone);

        // Open WhatsApp
        const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
        window.open(url, '_blank');
    };

    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState('');

    // Modal States
    // const [isContactModalOpen, setIsContactModalOpen] = useState(false); // Global
    // const [editingContact, setEditingContact] = useState(null); // Global
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false); // Kept for backward compat but unused now

    // handleSaveContact moved to App.jsx

    // Use global openAddModal directly from context in button

    const openEditModal = (contact) => {
        setGlobalEditingContact(contact);
        setIsContactModalOpen(true);
    };

    const filteredData = contacts.filter(item => {
        let matchTab = true;
        if (activeTab === 'clients') matchTab = item.role === 'Client';
        if (activeTab === 'prospects') matchTab = item.role === 'Prospect';
        if (activeTab === 'lapsed') matchTab = item.status === 'Lapsed' || item.status === 'Grace Period';

        const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone.includes(searchTerm);

        const matchTag = selectedTag ? (item.tags && item.tags.includes(selectedTag)) : true;

        return matchTab && matchSearch && matchTag;
    });

    // Pipeline Columns Configuration (Segment by Tags)
    // Dynamic columns based on available tags + Uncategorized
    const pipelineColumns = [
        ...availableTags.map(tag => ({ title: tag, tag: tag })),
        { title: 'Uncategorized', tag: null }
    ];

    const getColumnData = (tag) => {
        if (!tag) {
            return filteredData.filter(c => !c.tags || c.tags.length === 0);
        }
        return filteredData.filter(c => c.tags && c.tags.includes(tag));
    };

    const getColumnTotal = (items) => {
        return items.reduce((sum, item) => sum + (Number(item.dealValue) || 0), 0);
    };

    const getTagColorClass = (tagName) => {
        if (!tagName) return 'dot-kiv'; // Default purple for uncategorized
        const lower = tagName.toLowerCase();
        if (lower.includes('paymaster') || lower.includes('auto-debit') || lower.includes('yearly')) return 'dot-active'; // Green
        if (lower.includes('late') || lower.includes('manual') || lower.includes('failed')) return 'dot-lapsed'; // Red
        if (lower.includes('vip') || lower.includes('worth')) return 'dot-warm'; // Gold
        return 'dot-new'; // Blue default
    };

    return (
        <div className="databases-container">
            {/* AddContactModal moved to App.jsx */}

            {/* TagManagerModal removed/hidden in favor of Settings page */}

            <header className="page-header">
                <div>
                    <h1 className="page-title">Client & Prospect Management</h1>
                    <p className="page-subtitle">Central database for all your Takaful contacts.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }} className="desktop-only">
                    <button className="secondary-btn" onClick={() => navigate('/settings?tab=config')}>
                        <Settings size={18} style={{ marginRight: '8px' }} />
                        Manage Tags
                    </button>
                    <button className="primary-btn" onClick={openAddModal}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Add New Contact
                    </button>
                </div>
            </header>

            <div className="glass-panel content-wrapper">
                <div className="toolbar">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Contacts
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                            onClick={() => setActiveTab('clients')}
                        >
                            My Clients
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'prospects' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prospects')}
                        >
                            Prospects
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'lapsed' ? 'active alert-tab' : ''}`}
                            onClick={() => setActiveTab('lapsed')}
                        >
                            <AlertCircle size={14} style={{ marginRight: '6px' }} />
                            Attention Needed
                        </button>
                    </div>

                    <div className="actions">
                        <div className="view-toggle">
                            <button
                                className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <LayoutList size={18} />
                            </button>
                            <button
                                className={`icon-btn ${viewMode === 'board' ? 'active' : ''}`}
                                onClick={() => setViewMode('board')}
                                title="Pipeline View (Tags)"
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>

                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search name, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            className={`icon-btn ${isFilterOpen ? 'active' : ''}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            title="Filter by Tag"
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {isFilterOpen && (
                    <div className="filter-panel" style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Filter by Tag:</span>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setSelectedTag('')}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        border: '1px solid #ddd',
                                        background: selectedTag === '' ? '#3b82f6' : 'white',
                                        color: selectedTag === '' ? 'white' : '#64748b',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    All
                                </button>
                                {availableTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            border: '1px solid #ddd',
                                            background: selectedTag === tag ? '#3b82f6' : 'white',
                                            color: selectedTag === tag ? 'white' : '#64748b',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'list' ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Profile</th>
                                    <th>Status</th>
                                    <th style={{ minWidth: '150px' }}>Products</th>
                                    <th style={{ minWidth: '200px' }}>Tags</th>
                                    <th>Next Action</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row) => (
                                    <tr key={row.id} className={row.status === 'Lapsed' ? 'row-danger' : ''}>
                                        <td>
                                            <div className="user-cell" onClick={() => openEditModal(row)} style={{ cursor: 'pointer' }}>
                                                <div className={`user-avatar-sm ${row.role === 'Client' ? 'avatar-client' : 'avatar-prospect'}`}>
                                                    {row.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="user-name-text">
                                                        {row.name}
                                                        {row.role === 'Client' && <UserCheck size={12} className="verified-icon" />}
                                                    </div>
                                                    <div className="user-sub-text">
                                                        <Briefcase size={10} style={{ marginRight: '4px' }} />
                                                        {row.occupation}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td onClick={() => openEditModal(row)} style={{ cursor: 'pointer' }}><StatusBadge status={row.status} role={row.role} /></td>
                                        <td>
                                            <div className="products-list">
                                                {row.products && row.products.map(prod => (
                                                    <ProductTag key={prod} name={prod} />
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="tags-list">
                                                {row.tags && row.tags.map(tag => (
                                                    <InfoTag key={tag} name={tag} />
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="next-action" onClick={() => openEditModal(row)} style={{ cursor: 'pointer', borderBottom: '1px dashed #ccc', paddingBottom: '2px', width: 'fit-content' }}>
                                                {row.status === 'Active' && <Clock size={14} className="text-muted" />}
                                                {row.status === 'Grace Period' && <AlertCircle size={14} className="text-warning" />}
                                                <span>{row.nextAction || 'Set action...'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    onClick={() => handleWhatsAppClick(row.phone)}
                                                    className="icon-btn-sm action-whatsapp"
                                                    title={`Chat on WhatsApp (${usage}/${limit})`}
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                <button className="icon-btn-sm" onClick={() => openEditModal(row)} title="Edit Contact">
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            No contacts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="kanban-board">
                        {pipelineColumns.map((col, index) => {
                            const colData = getColumnData(col.tag);
                            const total = getColumnTotal(colData);
                            // We need to pass a 'status' for the dot color logic in KanbanColumn
                            // Since we don't have a strict status map, we'll assume the KanbanColumn component
                            // just needs a css class or we can pass a 'status' string that maps to a class we want.
                            // However, KanbanColumn helper function 'getTagColorClass' generates the class name.
                            // But KanbanColumn implementation (line 83-98) uses:
                            // <div className={`status-dot dot-${status.toLowerCase().replace(' ', '-')}`}></div>
                            // So we should pass the CLASS SUFFIX as the 'status' prop if we want to hack it,
                            // OR update KanbanColumn. I'll stick to passing 'status' for now but I want to use getTagColorClass.
                            // getTagColorClass returns 'dot-active' etc.
                            // The KanbanColumn expects 'Active' -> 'dot-active'.
                            // So I can pass a dummy string for 'status' that matches the dot class suffix?
                            // No, I'll update KanbanColumn too to be safe. But wait, I'm replacing the whole file block?
                            // No, I'm replacing from line 150. KanbanColumn is above line 150 (lines 83-98).
                            // I MUST UPDATE KANBANCOLUMN IF I WANT TO CHANGE ITS LOGIC.
                            // But my replacement starts at line 150.
                            // So `KanbanColumn` is outside my edit zone.
                            // I need to adapt the props passed to `KanbanColumn`.
                            // `KanbanColumn` takes `status`. And renders `dot-${status...}`.

                            // Let's use `getTagColorClass` to determine the "virtual status name" to pass.
                            // getTagColorClass returns 'dot-active'.
                            // If I pass status='Active', it renders 'dot-active'.
                            // If I pass status='Lapsed', it renders 'dot-lapsed'.
                            // So let's map the class back to a status name.

                            let virtualStatus = 'New';
                            const colorClass = getTagColorClass(col.title);
                            if (colorClass === 'dot-active') virtualStatus = 'Active';
                            if (colorClass === 'dot-lapsed') virtualStatus = 'Lapsed';
                            if (colorClass === 'dot-warm') virtualStatus = 'Warm';
                            if (colorClass === 'dot-kiv') virtualStatus = 'KIV';

                            return (
                                <KanbanColumn
                                    key={index}
                                    title={col.title}
                                    status={virtualStatus}
                                    contacts={colData}
                                    totalValue={total}
                                    openEditModal={openEditModal}
                                />
                            );
                        })}
                    </div>
                )}

                {viewMode === 'list' && (
                    <div className="pagination">
                        <span className="text-muted">Showing {filteredData.length} records</span>
                        <div className="pagination-controls">
                            <button className="page-btn" disabled>Prev</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Databases;
