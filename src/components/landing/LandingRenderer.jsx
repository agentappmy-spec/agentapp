import React from 'react';
import Hero from './sections/Hero';
import Features from './sections/Features';
import ContactForm from './sections/ContactForm';
import ProfileHero from './sections/ProfileHero';
import Bio from './sections/Bio';
import Links from './sections/Links';
import ProductsGrid from './sections/ProductsGrid';
import Footer from './sections/Footer';

// Default key-value pairs for product descriptions match LandingPage.jsx
const DEFAULT_PRODUCT_DESCRIPTIONS = {
    'Hibah Takaful': 'Debt cancellation and income replacement protection.',
    'Medical Card': 'Comprehensive medical coverage for you and your family.',
    'Investment': 'Grow your wealth with shariah-compliant funds.',
    'Savings': 'Secure your future with flexible savings plans.',
    'Education': 'Plan for your children\'s educational future.',
    'Retirement': 'Ensure a comfortable retirement with our plans.',
    'Hibah': 'Debt cancellation and income replacement protection.',
    'Medical': 'Comprehensive medical coverage for you and your family.'
};

// Helper to replace shortcodes in text
const replaceShortcodes = (text, profile) => {
    if (typeof text !== 'string') return text;
    if (!profile) return text;

    // Helper to format phone for WhatsApp (ensure 60 prefix)
    const formatPhone = (phone) => {
        if (!phone) return '';
        let clean = phone.replace(/\D/g, ''); // Remove non-digits
        if (clean.startsWith('0')) {
            clean = '60' + clean.substring(1);
        }
        return clean;
    };

    let newText = text;

    // Auto-fix empty wa.me links
    if (newText === 'https://wa.me/' || newText === 'https://wa.me') {
        const phone = formatPhone(profile.phone);
        if (phone) return `https://wa.me/${phone}`;
    }

    return newText
        .replace(/{agent_name}|{name}/g, profile.name || profile.full_name || 'Agent')
        .replace(/{phone}/g, formatPhone(profile.phone))
        .replace(/{email}/g, profile.email || '')
        .replace(/{title}/g, profile.title || '')
        .replace(/{agency}/g, profile.agency_name || '')
        .replace(/{license}/g, profile.license_no || '')
        .replace(/{bio}/g, profile.bio || '');
};

const LandingRenderer = ({ config, profile }) => {
    if (!config || !config.sections) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>No content to render.</div>;
    }

    return (
        <div className="landing-renderer-container" style={{ fontFamily: config.theme?.font || 'system-ui, sans-serif' }}>
            {config.sections.map((section) => {
                // Merge section content with profile data if available
                let mergedContent = { ...section.content };

                if (profile) {
                    if (section.type === 'profile_hero' || section.type === 'hero') {
                        mergedContent.name = profile.name || profile.full_name || mergedContent.name;
                        mergedContent.role = profile.title || mergedContent.role;
                        mergedContent.imageUrl = profile.photoUrl || profile.photo_url || mergedContent.imageUrl;
                        mergedContent.agency = profile.agencyName || profile.agency_name || mergedContent.agency;
                    }
                    if (section.type === 'bio' && (profile.bio || profile.professional_bio)) {
                        mergedContent.text = profile.bio || profile.professional_bio;
                    }
                    if (section.type === 'footer' && !mergedContent.text) {
                        mergedContent.text = `© ${new Date().getFullYear()} ${profile.name || profile.full_name || 'Agent'}. All rights reserved.`;
                    }
                    if (section.type === 'products_grid' && profile.products) {
                        mergedContent.items = profile.products.map(p => {
                            const pName = typeof p === 'string' ? p : p.name;
                            const existing = section.content.items?.find(i => (typeof i === 'string' ? i : i.name) === pName);
                            // Fallback Order: 1. Existing Config (Saved) -> 2. Product Object Desc -> 3. Default Constant -> 4. Empty
                            const desc = existing?.description || (typeof p === 'object' ? p.description : '') || DEFAULT_PRODUCT_DESCRIPTIONS[pName] || '';

                            return {
                                name: pName,
                                description: desc
                            };
                        });
                    }
                }

                // Apply Shortcode Replacement to all string fields in mergedContent
                const processedContent = {};
                Object.keys(mergedContent).forEach(key => {
                    const value = mergedContent[key];
                    if (typeof value === 'string') {
                        processedContent[key] = replaceShortcodes(value, profile);
                    } else if (Array.isArray(value)) {
                        // Handle Arrays (like items/links)
                        processedContent[key] = value.map(item => {
                            if (typeof item === 'string') return replaceShortcodes(item, profile);
                            if (typeof item === 'object' && item !== null) {
                                const newItem = {};
                                Object.keys(item).forEach(k => {
                                    newItem[k] = typeof item[k] === 'string' ? replaceShortcodes(item[k], profile) : item[k];
                                });
                                return newItem;
                            }
                            return item;
                        });
                    } else {
                        processedContent[key] = value;
                    }
                });

                switch (section.type) {
                    case 'hero':
                        return <Hero key={section.id} content={processedContent} />;
                    case 'features':
                        return <Features key={section.id} content={processedContent} />;
                    case 'form':
                        return <ContactForm key={section.id} content={processedContent} profile={profile} />;
                    case 'profile_hero':
                        return <ProfileHero key={section.id} content={processedContent} />;
                    case 'bio':
                        return <Bio key={section.id} content={processedContent} />;
                    case 'links':
                        return <Links key={section.id} content={processedContent} />;
                    case 'products_grid':
                        return <ProductsGrid key={section.id} content={processedContent} />;
                    case 'footer':
                        return <Footer key={section.id} content={processedContent} />;
                    default:
                        // Fallback
                        return null;
                }
            })}
        </div>
    );
};

export default LandingRenderer;
