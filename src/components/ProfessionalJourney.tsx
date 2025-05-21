
import React from 'react';
import { PwCBentoDemo } from '@/components/ui/pwc-bento-demo';

const ProfessionalJourney: React.FC = () => {
  return <section id="journey" className="py-16 bg-white">
      <div className="section-container">
        <h2 className="text-4xl font-bold text-center mb-12">Professional Journey</h2>
        
        {/* Xolution Experience */}
        <div className="mb-10">
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <h3 className="text-2xl font-bold">2023 - Present</h3>
              <p className="text-xl text-gray-700">Founder and CEO</p>
              <a href="https://xolution.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://xolution.io
              </a>
            </div>
            <img src="/lovable-uploads/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png" alt="Xolution Logo" className="h-9 w-auto" />
          </div>
          
          {/* Xolution description - no Bento Demo here anymore */}
          <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
            <p className="text-lg leading-relaxed mb-4">
              Xolution is a tech-enabled Fractional FP&A partner, empowering lean mid-market PE portfolio companies
              drive rapid value creation. It serves as a bridge between technology-driven efficiency and the ever-evolving world of financial transactions.
            </p>
            <p className="text-xl font-bold text-primary">
              What if you had the ability to produce a QoE every single month, instead of just at the time of the deal!
            </p>
          </div>
        </div>
        
        {/* PwC Experience */}
        <div className="mt-16 mb-10">
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <h3 className="text-2xl font-bold">2015 - 2023</h3>
              <p className="text-xl text-gray-700">Senior Manager</p>
            </div>
            <img src="/lovable-uploads/5ea78123-d77b-4bca-9d19-36b970acc74a.png" alt="PwC Logo" className="h-20 w-auto rounded-md" />
          </div>
          <PwCBentoDemo />
        </div>
      </div>
    </section>;
};
export default ProfessionalJourney;
