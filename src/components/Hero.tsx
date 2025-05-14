
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-24 pb-8 flex items-center gradient-bg">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight">
              Hi, I'm Gokul — a Deals & Data Analytics professional turned SaaS Founder.
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              14 years of experience across billion-dollar transactions, Big 4 consulting, and founder of a Private Equity-focused automation platform.
            </p>
            <Button className="mt-6 group" size="lg">
              <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
              Download My Resume
            </Button>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="aspect-video bg-gray-200 w-full">
              {/* Video or image placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-500">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Video Introduction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
