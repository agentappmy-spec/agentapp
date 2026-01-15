import React from 'react';

const Hero = ({ content }) => {
    // Default styling injected via inline styles for simplicity in the renderer
    const {
        title = "KONSULTANSI PERCUMA",
        subtitle = "Ambil tindakan bijak hari ini. Isi borang di bawah dan dapatkan konsultansi PERCUMA.",
        primaryColor = "#881337",
        textColor = "#ffffff",
        buttonText = "WhatsApp Saya",
        buttonLink = "#"
    } = content;

    return (
        <section style={{
            backgroundColor: primaryColor,
            color: textColor,
            padding: '3rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
        }}>
            <div style={{ maxWidth: '800px' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    lineHeight: '1.2',
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                }}>{title}</h1>

                <p style={{
                    fontSize: '1.1rem',
                    opacity: 0.9,
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>{subtitle}</p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href={buttonLink} target="_blank" rel="noreferrer" style={{
                        backgroundColor: '#25D366',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1rem'
                    }}>
                        {buttonText}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
