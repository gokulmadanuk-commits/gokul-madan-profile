
import React, { useState, useEffect } from 'react';
import { PwCBentoDemo } from '@/components/ui/pwc-bento-demo';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

const ProfessionalJourney: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Client logos to display
  const clientLogos = [{
    src: "/lovable-uploads/ba563727-2d13-4f21-8f46-2594c63aa02c.png",
    alt: "WestBridge Logo"
  }, {
    src: "/lovable-uploads/830fa207-5dba-44b1-a4c1-508b484c44b0.png",
    alt: "Accordion Logo"
  }, {
    src: "/lovable-uploads/735e5e15-6c5a-4b2c-b895-585f5e58b920.png",
    alt: "CrossCountry Consulting Logo"
  }, {
    src: "/lovable-uploads/aa767c51-79ad-4265-9ed0-9c9936391277.png",
    alt: "Houlihan Lokey Logo"
  }, {
    src: "/lovable-uploads/ed3a1c78-0582-4c4f-9a80-6a9d9e330a7a.png",
    alt: "Siegfried Logo"
  }, {
    src: "/lovable-uploads/3f5e2dc5-5f5c-4dce-b899-bcad38cd8534.png",
    alt: "Vistria Logo"
  }];

  // Updated carousel slides with new image paths
  const carouselSlides = [{
    src: "/lovable-uploads/8ee16498-f5bf-4553-acf5-1f4b857b9a53.png",
    alt: "Challenges Tracking Portfolio Company Performance"
  }, {
    src: "/lovable-uploads/fe476a3c-be34-4bf9-b289-b4e806c296d3.png",
    alt: "Driving Value for Companies in the Mid-Market Sweet Spot"
  }, {
    src: "/lovable-uploads/84938ca9-0f1c-4d4f-b2c9-27d7ddb688c1.png",
    alt: "Laying the Foundation for Effective FP&A"
  }, {
    src: "/lovable-uploads/85ac2339-e18f-4c5f-b428-bb367f058892.png",
    alt: "Need for Robust Reporting"
  }, {
    src: "/lovable-uploads/f3e151b5-474a-4bd9-a845-9c774056dfe8.png",
    alt: "Modular Architecture"
  }, {
    src: "/lovable-uploads/aa65d36c-616c-42f0-9d25-6e09c5717d56.png",
    alt: "Xolution Approach"
  }];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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
          
          {/* Xolution description */}
          <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
            <p className="text-lg leading-relaxed mb-4">
              Xolution is a tech-enabled Fractional FP&A partner, empowering lean mid-market PE portfolio companies
              drive rapid value creation. It serves as a bridge between technology-driven efficiency and the ever-evolving world of financial transactions.
            </p>
            <p className="text-xl font-bold text-primary">
              What if you had the ability to produce a QoE every single month, instead of just at the time of the deal!
            </p>
          </div>
          
          {/* Carousel Section with enhanced styling */}
          <div className="mb-8">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent>
                {carouselSlides.map((slide, index) => <CarouselItem key={index}>
                    <div className="p-1 h-full">
                      <Card className="overflow-hidden shadow-lg border">
                        <CardContent className="p-0">
                          <AspectRatio ratio={16 / 9}>
                            <img src={slide.src} alt={slide.alt} className="object-contain w-full h-full" />
                          </AspectRatio>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-6" />
              <CarouselNext className="-right-4 md:-right-6" />
            </Carousel>
            
            {/* Pagination dots */}
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: count }, (_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index + 1 === current 
                      ? 'bg-primary' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
            
            {/* Download Overview button - Updated to match single Hero button size */}
            <div className="mt-6">
              <Button size="lg" className="group w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Download Overview
              </Button>
            </div>
          </div>
        </div>
        
        {/* Separator line */}
        <Separator className="my-12" />
        
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
