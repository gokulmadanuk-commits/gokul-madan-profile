import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
const Vision: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const handleEmailGokul = () => {
    window.open('mailto:gokul@example.com', '_blank');
  };
  const handleSendMessage = () => {
    if (email && message) {
      // Create mailto link with subject and body
      const subject = encodeURIComponent('Message from Portfolio Website');
      const body = encodeURIComponent(`From: ${email}\n\nMessage:\n${message}`);
      window.open(`mailto:gokul@example.com?subject=${subject}&body=${body}`, '_blank');

      // Reset form
      setEmail('');
      setMessage('');
    }
  };
  return <section id="vision" className="py-20 bg-gray-50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-light via-white to-beige-light">
            <CardContent className="p-8 md:p-12 relative">
              <img src="/lovable-uploads/280b909b-ceb8-422b-9f23-2e56e36a673e.png" alt="Unity Advisory Logo" className="absolute top-4 right-4 md:top-6 md:right-6 h-6 md:h-8 w-auto" />
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center">I'd love to work with Unity Advisory</h2>
              <div className="space-y-6 text-lg">
                <p className="leading-relaxed">I believe I could add a lot of value to what Unity Advisory stands for: A lean  and client-centric model that embeds AI across workstreams, delivering value to clients with agility and innovative commercial models.</p>
                
                <p className="leading-relaxed font-medium text-primary">Can we connect and explore this further?</p>
                
                <div className="flex justify-center">
                  <Button onClick={handleEmailGokul} className="px-8 py-3 text-lg">
                    Email Gokul
                  </Button>
                </div>

                <Separator className="my-8" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." rows={4} />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleSendMessage} className="px-8 py-3 text-lg">
                      Send Gokul this message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default Vision;