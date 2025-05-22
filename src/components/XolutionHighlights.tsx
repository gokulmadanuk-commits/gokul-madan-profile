
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

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

  // Updated carousel slides with new image paths
  const carouselSlides = [
    {
      src: "/lovable-uploads/8ee16498-f5bf-4553-acf5-1f4b857b9a53.png",
      alt: "Challenges Tracking Portfolio Company Performance"
    },
    {
      src: "/lovable-uploads/fe476a3c-be34-4bf9-b289-b4e806c296d3.png",
      alt: "Driving Value for Companies in the Mid-Market Sweet Spot"
    },
    {
      src: "/lovable-uploads/84938ca9-0f1c-4d4f-b2c9-27d7ddb688c1.png",
      alt: "Laying the Foundation for Effective FP&A"
    },
    {
      src: "/lovable-uploads/85ac2339-e18f-4c5f-b428-bb367f058892.png",
      alt: "Need for Robust Reporting"
    },
    {
      src: "/lovable-uploads/f3e151b5-474a-4bd9-a845-9c774056dfe8.png",
      alt: "Modular Architecture"
    },
    {
      src: "/lovable-uploads/aa65d36c-616c-42f0-9d25-6e09c5717d56.png",
      alt: "Xolution Approach"
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
        
        {/* Carousel Section - Updated with new image paths */}
        <div className="mt-12">
          <Carousel className="w-full">
            <CarouselContent>
              {carouselSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 h-full">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={slide.src} 
                        alt={slide.alt}
                        className="rounded-lg object-contain w-full h-full" 
                      />
                    </AspectRatio>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-6" />
            <CarouselNext className="-right-4 md:-right-6" />
          </Carousel>
        </div>
      </div>
    </section>;
};
export default XolutionHighlights;
