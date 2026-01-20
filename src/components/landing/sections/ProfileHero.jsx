import React from 'react';
import { User, Building2 } from 'lucide-react';

const ProfileHero = ({ content }) => {
    const {
        name = "Your Name",
        role = "Financial Advisor",
        agency,
        location,
        imageUrl = "",
        primaryColor = "#db2777"
    } = content;

    return (
        <div className="profile-hero-section" style={{
            textAlign: 'center',
            padding: '3rem 1.5rem 1.5rem',
            background: 'linear-gradient(to bottom, #fdf2f8, white)'
        }}>
            <div className="avatar-wrapper" style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `4px solid ${primaryColor}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <User size={64} color={primaryColor} />
                )}
            </div>

            <h1 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '0.5rem',
                letterSpacing: '-0.025em'
            }}>
                {name}
            </h1>

            <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                backgroundColor: `${primaryColor}15`, // 15 = low opacity hex
                color: primaryColor,
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.75rem'
            }}>
                {role}
            </div>

            {agency && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    <Building2 size={14} />
                    <span>{agency}</span>
                </div>
            )}
        </div>
    );
};

export default ProfileHero;
