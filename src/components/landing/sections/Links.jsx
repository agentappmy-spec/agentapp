import React from 'react';
import { ArrowRight, MessageCircle, FileText, Calendar, ExternalLink } from 'lucide-react';

const Links = ({ content }) => {
    const {
        items = [],
        buttonColor = "#db2777",
        textColor = "#ffffff"
    } = content;

    const getIcon = (type) => {
        switch (type) {
            case 'whatsapp': return <MessageCircle size={18} />;
            case 'document': return <FileText size={18} />;
            case 'calendar': return <Calendar size={18} />;
            default: return <ExternalLink size={18} />;
        }
    };

    return (
        <div className="links-section" style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            {items.map((link, idx) => (
                <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        backgroundColor: buttonColor,
                        color: textColor,
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {getIcon(link.iconType)}
                        <span>{link.label}</span>
                    </div>
                    {/* Only show arrow if it's not a special action/icon-only style? No, always show for linktree feel */}
                    <div style={{ opacity: 0.8 }}>
                        <ArrowRight size={18} />
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Links;
