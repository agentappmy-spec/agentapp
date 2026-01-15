import React from 'react';
import Hero from './sections/Hero';
import Features from './sections/Features';
import ContactForm from './sections/ContactForm';
import ProfileHero from './sections/ProfileHero';
import Bio from './sections/Bio';
import Links from './sections/Links';
import ProductsGrid from './sections/ProductsGrid';
import Footer from './sections/Footer';

const LandingRenderer = ({ config }) => {
    if (!config || !config.sections) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>No content to render.</div>;
    }

    return (
        <div className="landing-renderer-container" style={{ fontFamily: config.theme?.font || 'system-ui, sans-serif' }}>
            {config.sections.map((section) => {
                switch (section.type) {
                    case 'hero':
                        return <Hero key={section.id} content={section.content} />;
                    case 'features':
                        return <Features key={section.id} content={section.content} />;
                    case 'form':
                        return <ContactForm key={section.id} content={section.content} />;
                    case 'profile_hero':
                        return <ProfileHero key={section.id} content={section.content} />;
                    case 'bio':
                        return <Bio key={section.id} content={section.content} />;
                    case 'links':
                        return <Links key={section.id} content={section.content} />;
                    case 'products_grid':
                        return <ProductsGrid key={section.id} content={section.content} />;
                    case 'footer':
                        return <Footer key={section.id} content={section.content} />;
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
