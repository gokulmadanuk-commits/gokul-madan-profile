
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section id="contact" className="py-20 gradient-bg">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary text-white text-center py-8">
              <CardTitle className="text-3xl font-serif">Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="transition-all duration-300"
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
                          <span>Have Gokul reach out</span>
                          <Send className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t">
                  <a 
                    href="mailto:gokulmadan2@gmail.com"
                    className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span>gokulmadan2@gmail.com</span>
                  </a>
                  <a 
                    href="https://linkedin.com/in/gokulmadan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span>linkedin.com/in/gokulmadan</span>
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
