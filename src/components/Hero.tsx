
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 stripe-gradient opacity-5 pointer-events-none" />
      
      <div className="relative z-10 section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium tracking-widest text-stripe-purple">DATA ANALYTICS & CONSULTING</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
                Hi, I'm Gokul — a Deals & Data Analytics professional.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4">
                14 years of experience across billion-dollar transactions, Big 4 consulting, and founder of a Private Equity-focused automation platform.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="stripe-button bg-stripe-purple text-white hover:bg-stripe-purple/90 group" size="lg">
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Download My Resume
              </Button>
              <Button variant="outline" size="lg" className="stripe-button">
                Contact Me
              </Button>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-video bg-stripe-gray-light w-full">
              {/* Video or image placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stripe-purple/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-stripe-purple">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Video Introduction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default Hero;
