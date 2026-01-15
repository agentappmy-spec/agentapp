import React from 'react';

const Features = ({ content }) => {
    const {
        items = [],
        backgroundColor = "#111827",
        cardColor = "#881337",
        textColor = "#ffffff"
    } = content;

    return (
        <section style={{
            backgroundColor: backgroundColor,
            padding: '4rem 1rem',
            color: textColor
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {items.map((item, index) => (
                    <div key={index} style={{
                        backgroundColor: cardColor,
                        padding: '2rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>{item.title}</h3>
                        <p style={{ opacity: 0.9, lineHeight: '1.6', fontSize: '0.95rem' }}>{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
