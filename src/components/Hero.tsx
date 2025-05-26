
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Mail, Linkedin, Play } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { downloadPDF } from "@/lib/downloadUtils";

const Hero: React.FC = () => {
  const handleResumeDownload = () => {
    downloadPDF('resume.pdf', 'Gokul-Madan-Resume.pdf');
  };

  return <section className="py-4 sm:py-8 md:py-12 flex items-center relative overflow-hidden">
      <AnimatedGridPattern numSquares={100} maxOpacity={0.2} duration={0.9} repeatDelay={1} width={40} height={40} className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-slate-400/30 stroke-slate-400/30" />
      <div className="section-container relative z-10 pt-0 sm:pt-4 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight lg:text-6xl">Hi, I'm Gokul</h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold lg:text-4xl">A Deals &amp; Data Analytics professional.</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-primary">Ex-PwC. Driving Deals Automation and helping PE PortCos unlock value.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Button size="lg" className="group w-full" onClick={handleResumeDownload}>
                  <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                  Download My Resume
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="group bg-white text-[#31602F] border-[#31602F] hover:bg-[#31602F]/20 transition-colors w-full">
                      <Play className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                      Video Introduction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <div className="aspect-video w-full bg-black flex items-center justify-center text-white">
                      <div className="text-center">
                        <Play className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-lg font-medium">Video Introduction</p>
                        <p className="text-sm text-gray-300 mt-2">This is a placeholder for the actual video content.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Social icons - visible on both mobile and desktop */}
            <div className="flex items-center space-x-4 mt-2">
              <a href="mailto:gokulmadan2@gmail.com" className="p-2 text-gray-600 hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/in/gokulmadan" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="relative animate-fade-in flex justify-center lg:justify-end">
            <div className="rounded-lg overflow-hidden shadow-[0px_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.12)] max-w-sm lg:max-w-sm md:max-w-xs sm:max-w-[250px]">
              <img 
                src="/lovable-uploads/8cc9d0fe-9220-494f-84f5-9b5f765a8d3f.png" 
                alt="Gokul's portrait" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default Hero;
