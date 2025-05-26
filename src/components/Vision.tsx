import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Vision: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter both your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Calling Supabase function with:', { name, email });

      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: { name, email }
      });

      if (error) {
        throw error;
      }

      console.log('Email sent successfully:', data);

      // Show success dialog
      setShowSuccessDialog(true);
      
      // Reset form
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="vision" className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-light via-white to-beige-light">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center">Let's Connect</h2>
                <form onSubmit={handleSubmit} className="space-y-6 text-lg">
                  <div className="space-y-4">
                    <Input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full"
                      required
                    />
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      required
                    />
                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full sm:w-auto sm:min-w-48"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thank You!</AlertDialogTitle>
            <AlertDialogDescription>
              Hi {name}, Thanks so much for reaching out. I will get back to you shortly. Looking forward to connecting with you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Vision;
