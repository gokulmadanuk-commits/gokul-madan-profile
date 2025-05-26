import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
const Vision: React.FC = () => {
  return <section id="vision" className="py-20 bg-gray-50">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-light via-white to-beige-light">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center">Why I'm Excited About Unity Advisory</h2>
              <div className="space-y-6 text-lg">
                <p className="leading-relaxed">
                  Unity's approach — blending AI and advisory — is exactly what this moment calls for. I've seen firsthand how data and automation can unlock real value in complex transactions.
                </p>
                <p className="leading-relaxed">
                  I believe I can bring meaningful insight, execution experience, and founder-level thinking to what you're building. If the vision is bold, I want in.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default Vision;