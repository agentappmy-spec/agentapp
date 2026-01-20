import React from 'react';
import { Shield, Heart, Activity, Briefcase } from 'lucide-react';

const ProductsGrid = ({ content }) => {
    const {
        title = "Saya boleh bantu anda!",
        items = [],
        cardColor = "#ffffff",
        accentColor = "#db2777"
    } = content;

    const getIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('hibah')) return <Heart size={24} color={accentColor} />;
        if (lower.includes('medical')) return <Activity size={24} color={accentColor} />;
        if (lower.includes('business')) return <Briefcase size={24} color={accentColor} />;
        return <Shield size={24} color={accentColor} />;
    };

    return (
        <div className="products-section" style={{ padding: '3rem 1.5rem', background: '#f9fafb' }}>
            <h2 style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '2rem'
            }}>
                {title}
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {items.map((prod, idx) => (
                    <div key={idx} style={{
                        background: cardColor,
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '1rem',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            padding: '1rem',
                            background: `${accentColor}10`, // low opacity 
                            borderRadius: '50%',
                            marginBottom: '0.5rem'
                        }}>
                            {getIcon(prod.name || prod)}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827' }}>
                            {prod.name || prod}
                        </h3>
                        {prod.description && (
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5 }}>
                                {prod.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsGrid;
