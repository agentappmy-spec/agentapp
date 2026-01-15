import React from 'react';

const Bio = ({ content }) => {
    const {
        text = "Hello! I help individuals and families secure their financial future through proper planning and protection.",
        textColor = "#374151"
    } = content;

    return (
        <div className="bio-section" style={{
            padding: '0 1.5rem 2rem',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
        }}>
            <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: textColor
            }}>
                {text}
            </p>
        </div>
    );
};

export default Bio;
