
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen pt-24 pb-8 flex items-center relative overflow-hidden">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight lg:text-7xl">Hi, I'm Gokul</h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold lg:text-5xl">A Deals &amp; Data Analytics professional.</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-primary">Ex-PwC. Driving Deals Automation and helping PE PortCos unlock value.</p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Button size="lg" className="group">
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Download My Resume
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="lg" className="group">
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
            <AspectRatio ratio={16/10}>
              <img 
                src="/lovable-uploads/d2f3559e-06bd-4de6-9433-e5a046106017.png" 
                alt="Gokul Madan Alikkal" 
                className="w-full h-full object-cover" 
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
