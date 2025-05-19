
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Hero: React.FC = () => {
  return (
    <section className="min-h-[70vh] pt-12 pb-8 flex items-center relative overflow-hidden">
      <AnimatedGridPattern 
        numSquares={100}
        maxOpacity={0.2} 
        duration={0.9} 
        repeatDelay={1} 
        width={40}
        height={40}
        className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-slate-400/30 stroke-slate-400/30" 
      />
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight lg:text-6xl">Hi, I'm Gokul</h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold lg:text-4xl">A Deals &amp; Data Analytics professional.</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-primary">Ex-PwC. Driving Deals Automation and helping PE PortCos unlock value.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="lg" className="group">
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Download My Resume
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group bg-white text-[#31602F] border-[#31602F] hover:bg-[#31602F]/20 transition-colors"
                  >
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
          
          <div className="relative animate-fade-in">
            <div className="max-w-xs mx-auto md:max-w-sm lg:max-w-md">
              <AspectRatio ratio={1500/1600} className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/5865f7b1-302b-421b-bcfd-2e4080867239.png" 
                  alt="Gokul Madan Alikkal" 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
