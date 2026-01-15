import React from 'react';

const Footer = ({ content }) => {
    const {
        text = "© 2026. All rights reserved.",
        bgColor = "#1f2937",
        textColor = "#9ca3af"
    } = content;

    return (
        <div className="footer-section" style={{
            padding: '2rem 1.5rem',
            background: bgColor,
            textAlign: 'center',
            color: textColor,
            fontSize: '0.85rem'
        }}>
            <p>{text}</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                Powered by AgentApp
            </div>
        </div>
    );
};

export default Footer;
