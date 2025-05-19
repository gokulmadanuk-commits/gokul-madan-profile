
import React from 'react';
import { BentoDemo } from '@/components/ui/bento-demo';

const ProfessionalJourney: React.FC = () => {
  return (
    <section id="journey" className="py-16 bg-white">
      <div className="section-container">
        <h2 className="text-4xl font-bold text-center mb-12">Professional Journey</h2>
        
        <div className="mb-10">
          <h3 className="text-2xl font-bold">2023 - Present</h3>
          <p className="text-xl text-gray-700">Founder</p>
          <img 
            src="/lovable-uploads/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png" 
            alt="Xolution Logo" 
            className="h-12 mt-3 mb-6"
          />
        </div>
        
        <BentoDemo />
      </div>
    </section>
  );
};

export default ProfessionalJourney;
