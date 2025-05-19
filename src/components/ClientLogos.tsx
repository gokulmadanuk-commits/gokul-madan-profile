
import React from 'react';
import { Card } from "@/components/ui/card";

const ClientLogos: React.FC = () => {
  // Array of logo data with src, alt, and optional width/height control
  const logos = [
    { src: "/lovable-uploads/bd60c7ea-a7fb-4ab5-bc37-e74844fe9151.png", alt: "PwC" },
    { src: "/lovable-uploads/64a96aef-ba27-448b-9b28-edb7fcc441b3.png", alt: "AT&T" },
    { src: "/lovable-uploads/ee904dae-73ef-4ba8-a44b-910102e0178e.png", alt: "GE" },
    { src: "/lovable-uploads/c18351e1-f187-4f17-9d0e-537024853b11.png", alt: "Cognizant" },
    { src: "/lovable-uploads/1f68f6ac-9673-4389-88a0-713912cec46e.png", alt: "Accordion" },
    { src: "/lovable-uploads/bd656b34-ed64-4bb8-ae7f-26cdda022fcf.png", alt: "Barclays Eagle Labs" },
    { src: "/lovable-uploads/06605beb-1704-4008-9ef8-9f0226f8b6e7.png", alt: "DXC" },
    { src: "/lovable-uploads/05f51801-ae11-44e7-bf2a-ad20ed89c9b8.png", alt: "Invest Northern Ireland" },
    { src: "/lovable-uploads/88064e12-18aa-42ef-b6fb-7e21e834eaff.png", alt: "Maersk" },
    { src: "/lovable-uploads/94028933-ea04-4740-82de-0f08b0c569d2.png", alt: "Housing" },
    { src: "/lovable-uploads/2a736e24-15d0-4879-b154-b1c8a89c2bc0.png", alt: "Symantec" },
    { src: "/lovable-uploads/ef1072e8-c89b-46a1-bce6-e47da501b05a.png", alt: "Mu Sigma" },
  ];

  return (
    <section className="bg-slate-50 border-t-2 border-b-2 border-primary">
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center p-8">
          {logos.map((logo, index) => (
            <div key={index} className="h-16 flex items-center justify-center">
              <img 
                src={logo.src} 
                alt={logo.alt} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
