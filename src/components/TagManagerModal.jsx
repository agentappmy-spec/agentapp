import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Save, Tag, Package } from 'lucide-react';
import './TagManagerModal.css';

const TagManagerModal = ({ isOpen, onClose, tags, products, setTags, setProducts }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'tags'
    const [items, setItems] = useState(activeTab === 'products' ? products : tags);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Sync internal state when props or tab changes
    React.useEffect(() => {
        setItems(activeTab === 'products' ? products : tags);
    }, [activeTab, products, tags]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        if (activeTab === 'products') {
            setProducts([...products, newItemName.trim()]);
        } else {
            setTags([...tags, newItemName.trim()]);
        }
        setNewItemName('');
    };

    const handleDeleteItem = (itemToDelete) => {
        if (activeTab === 'products') {
            setProducts(products.filter(item => item !== itemToDelete));
        } else {
            setTags(tags.filter(item => item !== itemToDelete));
        }
    };

    const startEditing = (item) => {
        setEditingId(item);
        setEditName(item);
    };

    const saveEdit = () => {
        if (!editName.trim()) return;

        if (activeTab === 'products') {
            setProducts(products.map(item => item === editingId ? editName.trim() : item));
        } else {
            setTags(tags.map(item => item === editingId ? editName.trim() : item));
        }
        setEditingId(null);
        setEditName('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container glass-panel tag-manager-modal">
                <header className="modal-header">
                    <h2 className="modal-title">Manage {activeTab === 'products' ? 'Products' : 'Tags'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </header>

                <div className="tabs-header">
                    <button
                        className={`manager-tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={16} /> Products
                    </button>
                    <button
                        className={`manager-tab ${activeTab === 'tags' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tags')}
                    >
                        <Tag size={16} /> Behavior Tags
                    </button>
                </div>

                <div className="manager-content">
                    <form onSubmit={handleAddItem} className="add-item-form">
                        <input
                            type="text"
                            placeholder={`Add new ${activeTab === 'products' ? 'product' : 'tag'}...`}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <button type="submit" className="icon-btn-primary">
                            <Plus size={18} />
                        </button>
                    </form>

                    <ul className="items-list">
                        {items.map((item, index) => (
                            <li key={index} className="item-row">
                                {editingId === item ? (
                                    <div className="edit-mode">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={saveEdit} className="save-btn"><Save size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="item-name">{item}</span>
                                        <div className="item-actions">
                                            <button onClick={() => startEditing(item)} className="action-btn-sm">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item)} className="action-btn-sm danger">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                        {items.length === 0 && (
                            <li className="empty-list-msg">No items found. Add one above.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TagManagerModal;
