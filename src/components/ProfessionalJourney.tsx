
import React from 'react';
import { Separator } from "@/components/ui/separator";
import XolutionSection from './XolutionSection';
import PwCSection from './PwCSection';
import MuSigmaSection from './MuSigmaSection';

const ProfessionalJourney: React.FC = () => {
  return (
    <section id="journey" className="py-16 bg-white">
      <div className="section-container">
        <h2 className="text-4xl font-bold text-center mb-12">Professional Journey</h2>
        
        {/* Xolution Experience */}
        <XolutionSection />
        
        {/* Separator line */}
        <Separator className="my-12" />
        
        {/* PwC Experience */}
        <PwCSection />
        
        {/* Separator line */}
        <Separator className="my-12" />
        
        {/* Mu Sigma Experience */}
        <MuSigmaSection />
      </div>
    </section>
  );
};

export default ProfessionalJourney;
