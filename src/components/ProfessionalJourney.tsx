import React, { useState, useEffect } from 'react';
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
              {Array.from({
              length: count
            }, (_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-colors duration-200 ${index + 1 === current ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'}`} onClick={() => api?.scrollTo(index)} />)}
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
              <p className="text-primary hover:underline">
                Deals Strategy and PE Value Creation
              </p>
            </div>
            <img src="/lovable-uploads/5ea78123-d77b-4bca-9d19-36b970acc74a.png" alt="PwC Logo" className="h-20 w-auto rounded-md" />
          </div>
          
          {/* PwC description */}
          <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
            <p className="text-lg leading-relaxed">I have led high-impact analytics and strategy initiatives across Fortune 100 companies, M&A engagements, IPOs, and divestitures at PwC's Deals practice in the US. I also specialized in value creation for Private Equity clients, delivering insights, forecasting models, and data-driven solutions that shaped billion-dollar transactions.</p>
          </div>
          
          {/* 3-Column Card Layout */}
          <div className="grid grid-cols-3 gap-6 min-h-[500px]">
            {/* Column 1 - 2 cards (2/3 top, 1/3 bottom) */}
            <div className="flex flex-col gap-4">
              <Card className="flex-[2] shadow-lg">
                <CardContent className="p-6 h-full flex flex-col">
                  <h4 className="text-lg mb-3 font-bold text-[#31602f]">Customer & Product Insights</h4>
                  <p className="text-gray-600 mb-4 flex-grow">Led a team that built a Customer and Product consolidation and insights engine that was instrumental to the Sell Side Diligence for the sale of Pilot Freight Services (Backed by PE Firms ATL Partners and BCI) in their sale to Maersk for $1.7B</p>
                  
                  {/* Logos in 2 rows with offset */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img src="/lovable-uploads/5e8c18be-970d-4977-b433-7ef973e4ce29.png" alt="Pilot Freight Services" className="h-8 w-auto" />
                      <img src="/lovable-uploads/1ec2cced-d590-43d0-a971-d323e1d47af8.png" alt="ATL Partners" className="h-6 w-auto mt-1" />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <img src="/lovable-uploads/0b165cc7-8ff4-486e-966b-89d71eb26e01.png" alt="BCI" className="h-6 w-auto mb-1" />
                      <img src="/lovable-uploads/1af70454-605a-4248-8505-92fa5666d3ea.png" alt="Maersk" className="h-8 w-auto" />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap mt-auto">
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      Private Equity
                    </span>
                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      Sell Side Diligence
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1 shadow-lg">
                <CardContent className="p-6 h-full">
                  <h4 className="text-lg font-semibold mb-3">M&A Support</h4>
                  <p className="text-gray-600">Supported major transactions and IPO processes.</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Column 2 - 1 full height card */}
            <div className="flex">
              <Card className="flex-1 shadow-lg">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <h4 className="text-xl font-semibold mb-4 text-center">PE Value Creation</h4>
                  <p className="text-gray-600 text-center mb-4">Specialized in developing data-driven solutions and forecasting models that directly contributed to value creation strategies for Private Equity portfolio companies.</p>
                  <div className="text-center">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">Billion-Dollar Impact</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Column 3 - 2 cards (1/3 top, 2/3 bottom) */}
            <div className="flex flex-col gap-4">
              <Card className="flex-1 shadow-lg">
                <CardContent className="p-6 h-full">
                  <h4 className="text-lg font-semibold mb-3">Financial Modeling</h4>
                  <p className="text-gray-600">Advanced forecasting and valuation models.</p>
                </CardContent>
              </Card>
              <Card className="flex-[2] shadow-lg">
                <CardContent className="p-6 h-full">
                  <h4 className="text-lg font-semibold mb-3">Data-Driven Insights</h4>
                  <p className="text-gray-600">Delivered comprehensive insights and analytics that shaped strategic decision-making across complex financial transactions and business transformations.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ProfessionalJourney;