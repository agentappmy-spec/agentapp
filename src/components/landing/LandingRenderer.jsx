import React from 'react';
import Hero from './sections/Hero';
import Features from './sections/Features';
import ContactForm from './sections/ContactForm';
import ProfileHero from './sections/ProfileHero';
import Bio from './sections/Bio';
import Links from './sections/Links';
import ProductsGrid from './sections/ProductsGrid';
import Footer from './sections/Footer';

// Helper to replace shortcodes in text
const replaceShortcodes = (text, profile) => {
    if (typeof text !== 'string') return text;
    if (!profile) return text;

    return text
        .replace(/{agent_name}|{name}/g, profile.name || profile.full_name || 'Agent')
        .replace(/{phone}/g, profile.phone || '')
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
                    }
                    if (section.type === 'bio' && (profile.bio || profile.professional_bio)) {
                        mergedContent.text = profile.bio || profile.professional_bio;
                    }
                    if (section.type === 'footer') {
                        mergedContent.text = `© ${new Date().getFullYear()} ${profile.name || profile.full_name || 'Agent'}. All rights reserved.`;
                    }
                    if (section.type === 'products_grid' && profile.products) {
                        mergedContent.items = profile.products.map(p => {
                            const pName = typeof p === 'string' ? p : p.name;
                            const existing = section.content.items?.find(i => (typeof i === 'string' ? i : i.name) === pName);
                            return {
                                name: pName,
                                description: existing?.description || (typeof p === 'object' ? p.description : '')
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
                        return <ContactForm key={section.id} content={processedContent} />;
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
