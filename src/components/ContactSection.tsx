
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
        <div className="flex flex-col lg:flex-row">
          {/* Left side with image */}
          <div className="lg:w-1/3 relative h-full">
            <div className="h-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/7c829219-3347-4cd9-9f73-d092d5fd1e4c.png" 
                alt="Gokul Madan" 
                className="object-contain h-full w-auto"
                style={{ maxHeight: 'calc(100% - 20px)', marginTop: '10px' }}
              />
            </div>
          </div>
          
          {/* Right side with content */}
          <div className="lg:w-2/3 p-8 lg:p-16 flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Ready to see what's possible?</h2>
            <p className="text-xl mb-8">
              We'd love 30 minutes to show how to get your customers to their value destination faster.
            </p>
            
            <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm max-w-md">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70" 
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full bg-white text-primary hover:bg-white/90 transition-all duration-300 font-medium"
                    >
                      {isSubmitting ? "Sending..." : "Get a Demo"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
