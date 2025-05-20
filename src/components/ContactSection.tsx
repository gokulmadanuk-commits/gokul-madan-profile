
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
    <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-[#F2FCE2] to-[#D3FFB5] py-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 relative flex justify-center lg:justify-start items-end h-full">
            <div className="h-[600px] w-full flex items-end justify-center">
              <img 
                src="/lovable-uploads/96f4b5a4-64ba-4d4d-a803-481323f18bc1.png" 
                alt="Gokul Madan Alikkal" 
                className="h-full object-contain object-bottom"
              />
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif text-primary font-semibold mb-6">Ready to see what's possible?</h2>
            <p className="text-primary/90 text-lg mb-8">
              We'd love 30 minutes to show how to get your customers to their value destination faster.
            </p>
            
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 max-w-md">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/70 border-primary/30 text-primary placeholder:text-primary/70"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-primary/90"
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
