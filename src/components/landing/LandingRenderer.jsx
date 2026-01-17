import React from 'react';
import Hero from './sections/Hero';
import Features from './sections/Features';
import ContactForm from './sections/ContactForm';
import ProfileHero from './sections/ProfileHero';
import Bio from './sections/Bio';
import Links from './sections/Links';
import ProductsGrid from './sections/ProductsGrid';
import Footer from './sections/Footer';

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

                switch (section.type) {
                    case 'hero':
                        return <Hero key={section.id} content={mergedContent} />;
                    case 'features':
                        return <Features key={section.id} content={mergedContent} />;
                    case 'form':
                        return <ContactForm key={section.id} content={mergedContent} />;
                    case 'profile_hero':
                        return <ProfileHero key={section.id} content={mergedContent} />;
                    case 'bio':
                        return <Bio key={section.id} content={mergedContent} />;
                    case 'links':
                        return <Links key={section.id} content={mergedContent} />;
                    case 'products_grid':
                        return <ProductsGrid key={section.id} content={mergedContent} />;
                    case 'footer':
                        return <Footer key={section.id} content={mergedContent} />;
                    default:
                        return (
                            <div key={section.id} style={{ padding: '2rem', textAlign: 'center', background: '#fecaca', color: '#ef4444' }}>
                                Unknown Section Type: {section.type}
                            </div>
                        );
                }
            })}
        </div>
    );
};

export default LandingRenderer;
