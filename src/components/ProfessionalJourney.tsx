
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
          
          {/* Added Xolution description */}
          <div className="mb-8 bg-slate-light rounded-lg p-6">
            <p className="text-lg leading-relaxed mb-4">
              Xolution is a tech-enabled Fractional FP&A partner, empowering lean mid-market PE portfolio companies
              drive rapid value creation. It serves as a bridge between technology-driven efficiency and the ever-evolving world of financial transactions.
            </p>
            <p className="text-xl font-bold text-primary">
              What if you had the ability to produce a QoE every single month, instead of just at the time of the deal!
            </p>
          </div>
          
          <BentoDemo />
        </div>
        
        {/* PwC Experience */}
        <div className="mt-16 mb-10">
          <h3 className="text-2xl font-bold">2015 - 2023</h3>
          <p className="text-xl text-gray-700">Senior Manager</p>
          <img src="/lovable-uploads/5ea78123-d77b-4bca-9d19-36b970acc74a.png" alt="PwC Logo" className="h-24 w-auto mt-3 mb-6 rounded-md" />
          <PwCBentoDemo />
        </div>
      </div>
    </section>;
};
export default ProfessionalJourney;
