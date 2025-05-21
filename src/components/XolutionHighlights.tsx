
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const XolutionHighlights: React.FC = () => {
  // Client logos to display
  const clientLogos = [
    {
      src: "/lovable-uploads/e2e6a04d-9b11-417a-b7ad-b9bba1af7a61.png",
      alt: "Client Logo 1"
    },
    {
      src: "/lovable-uploads/ef1072e8-c89b-46a1-bce6-e47da501b05a.png",
      alt: "Client Logo 2"
    },
    {
      src: "/lovable-uploads/bd60c7ea-a7fb-4ab5-bc37-e74844fe9151.png",
      alt: "Client Logo 3"
    },
    {
      src: "/lovable-uploads/bd656b34-ed64-4bb8-ae7f-26cdda022fcf.png",
      alt: "Client Logo 4"
    },
    {
      src: "/lovable-uploads/64a96aef-ba27-448b-9b28-edb7fcc441b3.png",
      alt: "Client Logo 5"
    },
    {
      src: "/lovable-uploads/8cc9d0fe-9220-494f-84f5-9b5f765a8d3f.png",
      alt: "Client Logo 6"
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
