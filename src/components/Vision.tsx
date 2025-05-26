import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
const Vision: React.FC = () => {
  return <section id="vision" className="py-20 bg-gray-50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-light via-white to-beige-light">
            <CardContent className="p-8 md:p-12 relative">
              <img src="/lovable-uploads/280b909b-ceb8-422b-9f23-2e56e36a673e.png" alt="Unity Advisory Logo" className="absolute top-4 right-4 md:top-6 md:right-6 h-6 md:h-8 w-auto" />
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center">I'd love to work with Unity Advisory</h2>
              <div className="space-y-6 text-lg">
                <p className="leading-relaxed">
                  Unity's approach — blending AI and advisory — is exactly what this moment calls for. I've seen firsthand how data and automation can unlock real value in complex transactions.
                </p>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default Vision;