
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const XolutionHighlights: React.FC = () => {
  // Client logos array
  const clientLogos = [
    { src: "/lovable-uploads/8de939df-312b-4f5b-80a5-0343ba434523.png", alt: "Accordion" },
    { src: "/lovable-uploads/a1f85302-3c14-4c7a-9be0-aa260e99cbad.png", alt: "CrossCountry Consulting" },
    { src: "/lovable-uploads/d8f21a8e-a4c2-429e-9a02-87f75a72e81e.png", alt: "Houlihan Lokey" },
    { src: "/lovable-uploads/e2e6a04d-9b11-417a-b7ad-b9bba1af7a61.png", alt: "Siegfried" },
    { src: "/lovable-uploads/ecb3a00a-7347-45c9-b5a6-23e7f3f5a7d5.png", alt: "Vistria" },
    { src: "/lovable-uploads/afeaecd3-efa3-4c8d-b31a-979c47eb31cc.png", alt: "WestBridge" },
  ];

  return (
    <section id="xolution" className="py-20 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">Building Xolution</h2>
            <div className="space-y-4 text-lg">
              <p className="leading-relaxed">
                After years in Private Equity advisory, I built the tool I always wished existed — a platform that transforms chaotic Excel workflows into streamlined, automated monthly reporting.
              </p>
              <p className="leading-relaxed">
                With customizable inputs, standardized outputs, and real-time visibility, Xolution helps deal teams and portfolio companies track KPIs and progress against investment theses — without waiting on consultants.
              </p>
              <p className="leading-relaxed">
                Currently being piloted by top consulting firms, and scaling fast.
              </p>
            </div>
          </div>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Architecture Card */}
            <Card className="col-span-1 overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src="/lovable-uploads/ea27b434-4b76-439c-a638-d46fea989263.png"
                    alt="Xolution Architecture" 
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4">
                    <h3 className="text-xl font-bold text-center">Modular, Scalable, Architecture</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Clients Card */}
            <Card className="col-span-1 overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">Clients</h3>
                <div className="grid grid-cols-2 gap-4">
                  {clientLogos.map((logo, index) => (
                    <div key={index} className="flex items-center justify-center h-16">
                      <img 
                        src={logo.src}
                        alt={logo.alt}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default XolutionHighlights;
