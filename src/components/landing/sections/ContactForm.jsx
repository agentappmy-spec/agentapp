import React, { useState, useEffect } from 'react';

const ContactForm = ({ content, profile }) => {
    // We ignore the 'fields' and 'buttonText' from content to force the requested structure
    const {
        title = "Dapatkan Sebut Harga"
    } = content || {};

    // Force the button text as requested
    const buttonText = "WhatsApp Saya";

    const [formData, setFormData] = useState({
        products: [],
        name: '',
        phone: '',
        email: '',
        occupation: '',
        birthday: '',
        smoking: ''
    });

    const [availableProducts, setAvailableProducts] = useState([]);
    const [agentProfile, setAgentProfile] = useState(null);

    useEffect(() => {
        // Use products from profile (database) instead of localStorage
        if (profile?.products && Array.isArray(profile.products)) {
            setAvailableProducts(profile.products);
        }

        // Set agent profile from prop
        if (profile) {
            setAgentProfile(profile);
        }
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleProduct = (product) => {
        setFormData(prev => {
            const products = prev.products.includes(product)
                ? prev.products.filter(p => p !== product)
                : [...prev.products, product];
            return { ...prev, products };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save lead to localStorage
        const leadData = {
            id: Date.now(),
            name: formData.name,
            phone: formData.phone.startsWith('60') ? formData.phone : '60' + formData.phone.replace(/^0/, ''),
            email: formData.email,
            occupation: formData.occupation,
            birthday: formData.birthday,
            additionalInfo: `Smoking/Vape: ${formData.smoking}`,
            products: formData.products,
            tags: ['AgentApp Leads'],
            role: 'Prospect',
            status: 'New',
            source: 'Public Form',
            timestamp: new Date().toISOString(),
            autoFollowUp: true,
            smoking: formData.smoking // Explicitly save to database field as well
        };

        // Save to contacts in localStorage
        const existingContacts = JSON.parse(localStorage.getItem('agent_contacts') || '[]');
        existingContacts.push(leadData);
        localStorage.setItem('agent_contacts', JSON.stringify(existingContacts));

        // Construct WhatsApp message
        const agentName = agentProfile?.name || 'Agent';
        let agentPhone = agentProfile?.phone || '';

        // Remove non-digit characters
        agentPhone = agentPhone.replace(/\D/g, '');

        // If phone is empty, try to alert or just proceed (likely won't work well)
        if (!agentPhone) {
            console.warn('No agent phone number found');
        }

        // Malaysian Phone Format Normalization
        // If starts with 0, replace with 60
        if (agentPhone.startsWith('0')) {
            agentPhone = '60' + agentPhone.substring(1);
        }
        // If doesn't start with 60 and is likely a Malaysian mobile (9-10 digits), prepend 60
        // (Simple heuristic, or just trust the user input if not starting with 0)
        else if (!agentPhone.startsWith('60') && agentPhone.length >= 9) {
            // Optional: Force 60? It's risky for international users. 
            // Sticking to 0 replacement is standard.
        }

        const productsText = formData.products.join(', ');

        const message = `Salam ${agentName},

Saya ${formData.name}. Boleh saya tahu tentang ${productsText}?

Maklumat saya:
📱 Telefon: ${formData.phone}
📧 Email: ${formData.email}
💼 Pekerjaan: ${formData.occupation}
🎂 Tarikh Lahir: ${formData.birthday}
🚬 Merokok/Vape: ${formData.smoking}`;

        const whatsappUrl = `https://wa.me/${agentPhone}?text=${encodeURIComponent(message)}`;

        // Redirect to WhatsApp
        window.location.href = whatsappUrl;
    };

    const emailDomains = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com'];

    return (
        <section style={{ padding: '4rem 1rem', backgroundColor: 'white', color: '#111827' }} id="contact-form">
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Product Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Saya Berminat dengan:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {availableProducts.map(product => (
                                <button
                                    key={product}
                                    type="button"
                                    onClick={() => toggleProduct(product)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: formData.products.includes(product) ? '2px solid #7c3aed' : '1px solid #d1d5db',
                                        background: formData.products.includes(product) ? '#7c3aed' : 'white',
                                        color: formData.products.includes(product) ? 'white' : '#374151',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: formData.products.includes(product) ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {product}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Nama Penuh</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            placeholder="Isikan nama penuh"
                        />
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Nombor Telefon</label>
                        <input
                            required
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            placeholder="012-3456789"
                        />
                    </div>

                    {/* Email with suggestions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            list="email-domains"
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            placeholder="contoh@email.com"
                        />
                        <datalist id="email-domains">
                            {emailDomains.map(domain => (
                                <option key={domain} value={formData.email.split('@')[0] + domain} />
                            ))}
                        </datalist>
                    </div>

                    {/* Occupation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Pekerjaan</label>
                        <input
                            required
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            placeholder="e.g. Kerajaan, Swasta, Berniaga"
                        />
                    </div>

                    {/* Birthday */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Tarikh Lahir</label>
                        <input
                            required
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Smoking */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Merokok / Vape atau Tidak</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    required
                                    type="radio"
                                    name="smoking"
                                    value="Ya"
                                    checked={formData.smoking === 'Ya'}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
                                />
                                <span>Ya</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    required
                                    type="radio"
                                    name="smoking"
                                    value="Tidak"
                                    checked={formData.smoking === 'Tidak'}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
                                />
                                <span>Tidak</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" style={{
                        marginTop: '1rem',
                        backgroundColor: '#25D366',
                        color: 'white',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        {buttonText}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
