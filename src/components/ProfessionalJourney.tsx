
import React from 'react';
import { PwCBentoDemo } from '@/components/ui/pwc-bento-demo';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
          
          {/* Xolution description - no Bento Demo here */}
          <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
            <p className="text-lg leading-relaxed mb-4">
              Xolution is a tech-enabled Fractional FP&A partner, empowering lean mid-market PE portfolio companies
              drive rapid value creation. It serves as a bridge between technology-driven efficiency and the ever-evolving world of financial transactions.
            </p>
            <p className="text-xl font-bold text-primary">
              What if you had the ability to produce a QoE every single month, instead of just at the time of the deal!
            </p>
          </div>
          
          {/* Architecture and Features Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Architecture Card - Takes up 2/3 of the width */}
            <div className="md:col-span-2">
              <Card className="overflow-hidden shadow-md border border-slate-200">
                <CardContent className="p-4 pb-8">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src="/lovable-uploads/eb31525f-5c3f-41d3-a708-15c99df1e85c.png"
                      alt="Xolution Architecture" 
                      className="w-full h-full object-contain"
                    />
                  </AspectRatio>
                  <p className="font-bold text-center mt-4">Modular, Scalable Architecture</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Placeholder for second vertical card */}
            <div className="md:col-span-1">
              <Card className="h-full shadow-md border border-slate-200">
                <CardContent className="p-4 flex flex-col justify-center items-center h-full">
                  <h4 className="text-xl font-semibold mb-4">Key Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Automated Reporting</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>KPI Tracking</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Customizable Inputs</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Real-time Visibility</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Standardized Outputs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
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
