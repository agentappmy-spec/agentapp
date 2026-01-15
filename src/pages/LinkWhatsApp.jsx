import React from 'react';
import { QrCode, Smartphone, AlertTriangle } from 'lucide-react';

const LinkWhatsApp = () => {
    return (
        <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem' }}>
                    <QrCode size={150} color="#000" />
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Link WhatsApp</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Open WhatsApp on your phone and scan the QR code to connect your agent account.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <AlertTriangle size={24} color="#f59e0b" />
                    <p style={{ fontSize: '0.9rem', color: '#fbbf24', textAlign: 'left' }}>
                        <strong>Note:</strong> This feature requires a backend service (e.g., whatsapp-web.js) running to function completely.
                    </p>
                </div>

                <button className="primary-btn" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                    Scanning...
                </button>
            </div>
        </div>
    );
};

export default LinkWhatsApp;
