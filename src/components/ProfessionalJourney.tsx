import React from 'react';
import { BentoDemo } from '@/components/ui/bento-demo';
import { PwCBentoDemo } from '@/components/ui/pwc-bento-demo';
const ProfessionalJourney: React.FC = () => {
  return <section id="journey" className="py-16 bg-white">
      <div className="section-container">
        <h2 className="text-4xl font-bold text-center mb-12">Professional Journey</h2>
        
        {/* Xolution Experience */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold">2023 - Present</h3>
          <p className="text-xl text-gray-700">Founder</p>
          <img src="/lovable-uploads/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png" alt="Xolution Logo" className="h-10 w-auto mt-3 mb-6" />
          <BentoDemo />
        </div>
        
        {/* PwC Experience */}
        <div className="mt-16 mb-10">
          <h3 className="text-2xl font-bold">2015 - 2023</h3>
          <p className="text-xl text-gray-700">Senior Manager</p>
          <img src="/lovable-uploads/4a1d098b-4c2a-4b98-92f7-da4bc8e5da7f.png" alt="PwC Logo" className="h-20 w-auto mt-3 mb-6" />
          <PwCBentoDemo />
        </div>
      </div>
    </section>;
};
export default ProfessionalJourney;