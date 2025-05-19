
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ContactSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Email submitted",
        description: "We'll get back to you shortly!",
      });
      setEmail('');
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-primary/80 to-primary/50 py-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-semibold mb-6">Ready to see what's possible?</h2>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white text-primary hover:bg-white/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Get a Demo'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="absolute bottom-0 right-0 transform translate-x-1/4">
              <div className="relative">
                <img 
                  src="/lovable-uploads/c7f7993d-5576-4ef8-baf6-811900657c1f.png" 
                  alt="Contact illustration" 
                  className="h-[140%] object-contain"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-white text-sm">New notification</span>
                  </div>
                  <p className="text-white/80 text-xs mt-2">Client approval received</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-white text-sm">Tasks update</span>
                  </div>
                  <p className="text-white/80 text-xs mt-2">3 tasks completed today</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
