import React, { useState } from 'react';
import { X, Save, User, Phone, Mail, Briefcase, Tag, Package, Calendar, Check } from 'lucide-react';
import './AddContactModal.css';

const AddContactModal = ({ isOpen, onClose, onSave, availableTags, availableProducts, initialData }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: '',
        role: 'Prospect',
        phone: '',
        email: '',
        occupation: '',
        products: [],
        tags: [],
        nextAction: '',
        status: 'New',
        birthday: '',
        subscriptionDate: '',
        additionalInfo: '',
        dealValue: '',
        smoking: ''
    });

    // Reset or Update form when isOpen or initialData changes
    React.useEffect(() => {
        if (initialData) {
            // Logic to strip '60' prefix if present for display
            let displayPhone = initialData.phone || '';
            if (displayPhone.startsWith('60')) {
                displayPhone = displayPhone.substring(2); // Remove '60' -> '123...'
            } else if (displayPhone.startsWith('6')) {
                displayPhone = displayPhone.substring(1); // Remove '6' -> '012...' (unlikely but safe)
            }
            // Ensure it starts with 0 if it was '1...' (after removing 60) -> '01...'
            // Actually, if we saved as '601...' and strip '60', we get '1...'. User wants to see '01...'.
            if (displayPhone.startsWith('1')) {
                displayPhone = '0' + displayPhone;
            }

            setFormData({
                name: '',
                role: 'Prospect',
                phone: '',
                email: '',
                occupation: '',
                products: [],
                tags: [],
                nextAction: '',
                status: 'New',
                birthday: '',
                subscriptionDate: '',
                additionalInfo: '',
                dealValue: '',
                smoking: '',
                autoFollowUp: true,
                ...initialData,
                phone: displayPhone // Override with formatted phone
            });
        } else {
            setFormData({
                name: '',
                role: 'Prospect',
                phone: '',
                email: '',
                occupation: '',
                products: [],
                tags: [],
                nextAction: '',
                status: 'New',
                birthday: '',
                subscriptionDate: '',
                additionalInfo: '',
                dealValue: '',
                smoking: '',
                autoFollowUp: true
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let updates = { [name]: type === 'checkbox' ? checked : value };

        // Auto-update Status if Role changes
        if (name === 'role') {
            if (value === 'Client') {
                updates.status = 'Active';
            } else if (value === 'Prospect') {
                updates.status = 'New';
            }
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    const toggleSelection = (type, item) => {
        setFormData(prev => {
            const list = prev[type];
            if (list.includes(item)) {
                return { ...prev, [type]: list.filter(i => i !== item) };
            } else {
                return { ...prev, [type]: [...list, item] };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare data for save
        let finalData = { ...formData };

        // Phone Formatting Logic: Ensure it starts with 60
        let p = finalData.phone.trim();
        // Remove non-digits
        p = p.replace(/\D/g, '');

        if (p.startsWith('0')) {
            p = '6' + p; // 012... -> 6012...
        } else if (p.startsWith('1')) {
            p = '60' + p; // 12... -> 6012... (if user forgot 0)
        } else if (!p.startsWith('60')) {
            // if user typed 601... it's fine.
            // if user typed something else, we might leave it or force it.
            // Assuming standard Malaysian numbers.
        }

        finalData.phone = p;

        onSave(finalData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container glass-panel">
                <header className="modal-header">
                    <h2 className="modal-title">{initialData ? 'Edit Contact' : 'Add New Contact'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Ahmad Albab"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{formData.role === 'Client' ? 'Commitment (RM)' : 'Budget (RM)'}</label>
                        <div className="input-wrapper">
                            <span className="input-icon" style={{ fontSize: '0.9rem', fontWeight: 600 }}>RM</span>
                            <input
                                type="number"
                                name="dealValue"
                                placeholder="0.00"
                                value={formData.dealValue || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="Prospect">Prospect</option>
                                <option value="Client">Client</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                {formData.role === 'Prospect' ? (
                                    <>
                                        <option value="New">New</option>
                                        <option value="Warm">Warm</option>
                                        <option value="Cold">Cold</option>
                                        <option value="KIV">KIV</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Active">Active</option>
                                        <option value="Grace Period">Grace Period</option>
                                        <option value="Lapsed">Lapsed</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="input-wrapper">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="012-3456789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email (Optional)</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Occupation</label>
                        <div className="input-wrapper">
                            <Briefcase size={18} className="input-icon" />
                            <input
                                type="text"
                                name="occupation"
                                placeholder="e.g. Government Servant"
                                value={formData.occupation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Products Selection */}
                    <div className="form-group">
                        <label>Interested / Subscribed Products</label>
                        <div className="selection-grid">
                            {availableProducts.map(prod => (
                                <button
                                    key={prod}
                                    type="button"
                                    className={`selection-chip ${formData.products.includes(prod) ? 'selected' : ''}`}
                                    onClick={() => toggleSelection('products', prod)}
                                >
                                    {formData.products.includes(prod) && <Check size={14} />}
                                    {prod}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags Selection */}
                    <div className="form-group">
                        <label>Behavior Tags</label>
                        <div className="selection-grid">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`selection-chip tag ${formData.tags.includes(tag) ? 'selected' : ''}`}
                                    onClick={() => toggleSelection('tags', tag)}
                                >
                                    {formData.tags.includes(tag) && <Check size={14} />}
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Next Action / Remark</label>
                        <div className="input-wrapper">
                            <Calendar size={18} className="input-icon" />
                            <input
                                type="text"
                                name="nextAction"
                                placeholder="e.g. Call for quotation"
                                value={formData.nextAction}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Merokok / Vape?</label>
                            <div className="input-wrapper" style={{ gap: '1rem', padding: '0.6rem 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="smoking"
                                        value="Yes"
                                        checked={formData.smoking === 'Yes'}
                                        onChange={handleChange}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                    />
                                    Yes
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="smoking"
                                        value="No"
                                        checked={formData.smoking === 'No'}
                                        onChange={handleChange}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Birthday</label>
                            <div className="input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {formData.role === 'Client' && (
                            <div className="form-group">
                                <label>Policy / Subscription Date</label>
                                <div className="input-wrapper">
                                    <Calendar size={18} className="input-icon" />
                                    <input
                                        type="date"
                                        name="subscriptionDate"
                                        value={formData.subscriptionDate || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Additional Constraints / Profile</label>
                        <textarea
                            name="additionalInfo"
                            className="textarea-input"
                            placeholder="e.g. Prefers whatsapp, allergic to seafood..."
                            value={formData.additionalInfo || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                name="autoFollowUp"
                                checked={formData.autoFollowUp !== false}
                                onChange={handleChange}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            Enable Auto Follow up?
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">
                            <Save size={18} style={{ marginRight: '8px' }} />
                            {initialData ? 'Update Contact' : 'Save Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactModal;
