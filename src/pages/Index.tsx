
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import AboutMe from '@/components/AboutMe';
import PwCHighlights from '@/components/PwCHighlights';
import Vision from '@/components/Vision';
import Footer from '@/components/Footer';
import ClientLogos from '@/components/ClientLogos';
import ProfessionalJourney from '@/components/ProfessionalJourney';

const Index: React.FC = () => {
  useEffect(() => {
    // Set the title of the page
    document.title = "Gokul Madan Alikkal - Consulting Leader & SaaS Founder";
    
    // Smooth scroll to section when clicking on navigation links
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        const href = target.getAttribute('href');
        if (!href) return;
        
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    };
    
    document.addEventListener('click', handleSmoothScroll);
    
    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        <ClientLogos />
        <AboutMe />
        <ProfessionalJourney />
        <PwCHighlights />
        <Vision />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
