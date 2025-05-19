
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
    <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary py-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 relative">
            <div className="relative h-[500px] max-w-md mx-auto lg:mx-0">
              <img 
                src="/lovable-uploads/96f4b5a4-64ba-4d4d-a803-481323f18bc1.png" 
                alt="Gokul Madan Alikkal" 
                className="h-full object-contain object-center"
              />
            </div>
            
            <div className="absolute top-10 -right-4 sm:right-20 lg:-right-10">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-[180px]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-white text-sm">Initial Onboarding</span>
                  </div>
                  <p className="text-white/80 text-xs mt-2">2 Weeks to Go</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="absolute top-40 -left-4 sm:left-10">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-[160px]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-white text-sm">Tasks Update</span>
                  </div>
                  <p className="text-white/80 text-xs mt-2">5 items remaining</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif text-white font-semibold mb-6">Ready to see what's possible?</h2>
            <p className="text-white/90 text-lg mb-8">
              We'd love 30 minutes to show how to get your customers to their value destination faster.
            </p>
            
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
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
