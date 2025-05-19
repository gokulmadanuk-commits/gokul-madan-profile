
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const ContactSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      // Add toast notification here if needed
      setEmail('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 px-4 md:px-6 lg:px-[150px]">
      <div className="bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-600 text-white rounded-xl overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row relative">
          {/* Left side with image */}
          <div className="lg:w-1/2 h-full relative">
            <div className="h-[400px] lg:h-full relative">
              <img 
                src="/lovable-uploads/ad1fea55-e1f2-4bab-801c-ff3581a55d8f.png" 
                alt="Gokul Madan" 
                className="object-contain w-auto absolute bottom-0 left-0" 
                style={{ 
                  height: "120%", 
                  maxWidth: "100%",
                }}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full z-10">
                <div className="hidden lg:flex items-center justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl w-56 absolute top-0 right-8">
                    <div className="text-sm mb-2">20%</div>
                    <div className="font-medium mb-2">Initial Onboarding</div>
                    <div className="text-xs">2 Weeks to Go - 08/24</div>
                    <div className="text-xs mt-2">3 Minutes</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl w-64 absolute top-1/3 right-12">
                    <div className="text-sm mb-2">Good morning!</div>
                    <div className="text-xs">As a reminder, you have one task due today that is not yet finished.</div>
                    <button className="bg-green-500 text-white text-xs px-3 py-1 rounded-full mt-2">Go to Task</button>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl w-56 absolute bottom-1/4 right-8">
                    <div className="text-sm mb-2">Send Message</div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg h-24 w-full mb-2"></div>
                    <div className="flex justify-end">
                      <button className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side with content */}
          <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to see what's possible?</h2>
            <p className="text-xl mb-8">
              We'd love 30 minutes to show how to get your customers to their value destination faster.
            </p>
            
            <div className="max-w-md">
              <Button 
                type="button" 
                className="bg-white text-primary hover:bg-white/90 transition-all duration-300 font-medium text-lg px-8 py-6 h-auto"
              >
                Get a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
