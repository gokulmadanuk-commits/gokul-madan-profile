
import React from 'react';
import { PwCBentoDemo } from '@/components/ui/pwc-bento-demo';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from '@/components/ui/aspect-ratio';

const ProfessionalJourney: React.FC = () => {
  // Client logos to display
  const clientLogos = [
    {
      src: "/lovable-uploads/ba563727-2d13-4f21-8f46-2594c63aa02c.png",
      alt: "WestBridge Logo"
    },
    {
      src: "/lovable-uploads/830fa207-5dba-44b1-a4c1-508b484c44b0.png",
      alt: "Accordion Logo"
    },
    {
      src: "/lovable-uploads/735e5e15-6c5a-4b2c-b895-585f5e58b920.png",
      alt: "CrossCountry Consulting Logo"
    },
    {
      src: "/lovable-uploads/aa767c51-79ad-4265-9ed0-9c9936391277.png",
      alt: "Houlihan Lokey Logo"
    },
    {
      src: "/lovable-uploads/ed3a1c78-0582-4c4f-9a80-6a9d9e330a7a.png",
      alt: "Siegfried Logo"
    },
    {
      src: "/lovable-uploads/3f5e2dc5-5f5c-4dce-b899-bcad38cd8534.png",
      alt: "Vistria Logo"
    }
  ];

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
                <CardContent className="p-4 pb-0">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src="/lovable-uploads/5bc1419c-6502-453f-afc0-d13bb24271aa.png"
                      alt="Xolution Architecture" 
                      className="w-full h-full object-contain"
                    />
                  </AspectRatio>
                  <p className="font-bold text-left text-xl mb-2 mt-2">Modular, Scalable Architecture</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Clients Card */}
            <div className="md:col-span-1">
              <Card className="h-full shadow-md border border-slate-200">
                <CardContent className="p-4 flex flex-col justify-center items-center h-full">
                  <h4 className="text-xl font-semibold mb-4">Clients</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {clientLogos.map((logo, index) => (
                      <div key={index} className="flex items-center justify-center p-2">
                        <img 
                          src={logo.src} 
                          alt={logo.alt} 
                          className="max-h-12 w-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
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
