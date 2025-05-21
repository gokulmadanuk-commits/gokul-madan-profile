
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const XolutionHighlights: React.FC = () => {
  // Client logos to display - matching the ones in ProfessionalJourney
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

  return <section id="xolution" className="py-20 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">Building Xolution</h2>
            <div className="space-y-4 text-lg">
              <p className="leading-relaxed">
                After years in Private Equity advisory, I built the tool I always wished existed — a platform that transforms chaotic Excel workflows into streamlined, automated monthly reporting.
              </p>
              <p className="leading-relaxed">
                With customizable inputs, standardized outputs, and real-time visibility, Xolution helps deal teams and portfolio companies track KPIs and progress against investment theses — without waiting on consultants.
              </p>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Clients Card */}
            <Card className="overflow-hidden border-0 shadow-lg card-hover bg-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Clients</h3>
                <div className="grid grid-cols-3 gap-4">
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
    </section>;
};
export default XolutionHighlights;
