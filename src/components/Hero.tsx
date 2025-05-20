
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

const Hero: React.FC = () => {
  return <section className="py-12 flex items-center relative overflow-hidden">
      <AnimatedGridPattern numSquares={100} maxOpacity={0.2} duration={0.9} repeatDelay={1} width={40} height={40} className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] fill-slate-400/30 stroke-slate-400/30" />
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight lg:text-6xl">Hi, I'm Gokul</h1>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold lg:text-4xl">A Deals &amp; Data Analytics professional.</h2>
            </div>
            <p className="text-lg md:text-xl font-semibold text-primary">Ex-PwC. Driving Deals Automation and helping PE PortCos unlock value.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Button size="lg" className="group w-full">
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
            
            {/* Contact icons */}
            <div className="flex items-center space-x-4 mt-4">
              <a 
                href="mailto:gokulmadan2@gmail.com" 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Email"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <rect width="24" height="24" fill="#ffffff" rx="4" ry="4" />
                    <path fill="#E94435" d="M5.526 9.182l5.45 4.09c.581.436 1.464.436 2.045 0l5.452-4.09v7.227a.91.91 0 01-.909.91H6.435a.909.909 0 01-.909-.91V9.181z"/>
                    <path fill="#C5221F" d="M5.526 9.182v7.227c0 .502.407.909.91.909h11.129a.909.909 0 00.909-.91V9.182L13.02 13.273a1.455 1.455 0 01-2.045 0L5.526 9.182z"/>
                    <path fill="#FBBC04" d="M18.474 9.182L13.02 13.273c-.58.436-1.463.436-2.044 0L5.526 9.182 9.275 6.5c.732-.546 1.622-.819 2.724-.819s1.992.273 2.724.819l3.75 2.682z"/>
                    <path fill="#34A853" d="M18.474 16.409a.909.909 0 01-.91.909H6.435a.909.909 0 01-.909-.91v-7.227l5.45 4.09c.581.436 1.464.436 2.045 0l5.452-4.09v7.228z"/>
                    <path fill="#1A73E8" d="M18.474 9.182L13.02 13.273c-.58.436-1.463.436-2.044 0L5.526 9.182 9.275 6.5c.732-.546 1.622-.819 2.724-.819s1.992.273 2.724.819l3.75 2.682z"/>
                  </svg>
                </div>
              </a>
              <a 
                href="https://linkedin.com/in/gokulmadan" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="LinkedIn"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <rect width="24" height="24" rx="2" fill="#0A66C2" />
                    <path fill="#FFFFFF" d="M7 10v8H4.5v-8H7zm-1.25-3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm10.5 3v.75c.55-.72 1.39-1 2.25-1 2.21 0 3.5 1.57 3.5 3.75V18h-2.5v-4.25c0-1.24-.7-1.75-1.5-1.75-.93 0-1.75.54-1.75 1.75V18h-2.5v-8h2.5z" />
                  </svg>
                </div>
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
