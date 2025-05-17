
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Linkedin, Send } from "lucide-react";
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
        title: "Request Sent",
        description: "Gokul will reach out to you soon. Thank you!",
        duration: 5000,
      });
      setEmail('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 pointer-events-none" />
      <div className="section-container relative z-10">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">Get In Touch</h2>
          <p className="text-muted-foreground text-lg">Have questions about my experience or interested in working together?</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Your Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="stripe-input flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="stripe-button bg-stripe-purple text-white hover:bg-stripe-purple/90"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span>Contact me</span>
                        <Send className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="pt-6 border-t flex flex-col sm:flex-row justify-center items-center gap-6">
                <a 
                  href="mailto:gokulmadan2@gmail.com"
                  className="flex items-center justify-center gap-2 text-muted-foreground hover:text-stripe-purple transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">gokulmadan2@gmail.com</span>
                </a>
                <a 
                  href="https://linkedin.com/in/gokulmadan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-muted-foreground hover:text-stripe-purple transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-sm">linkedin.com/in/gokulmadan</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
