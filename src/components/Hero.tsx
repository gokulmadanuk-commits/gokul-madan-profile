import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
const Hero: React.FC = () => {
  return <section className="min-h-screen pt-24 pb-8 flex items-center relative overflow-hidden">
      <AnimatedGridPattern numSquares={100} // Increased from 40 to 100
    maxOpacity={0.2} duration={0.9} repeatDelay={1} width={40} // Back to default 40
    height={40} // Back to default 40
    className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-slate-400/30 stroke-slate-400/30" />
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight lg:text-7xl">Hi, I'm Gokul</h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold lg:text-5xl">A Deals &amp; Data Analytics professional.</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-[#1c3b26]">Ex-PwC. Driving Deals Automation and helping PE PortCos unlock value.</p>
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
    </section>;
};
export default Hero;