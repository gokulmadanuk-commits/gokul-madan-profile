
import React from 'react';

const Vision: React.FC = () => {
  return (
    <section id="vision" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 stripe-gradient opacity-5 pointer-events-none" />
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border rounded-xl shadow-sm p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">Why I'm Excited About Unity Advisory</h2>
            <div className="space-y-6 text-lg">
              <p className="leading-relaxed text-muted-foreground">
                Unity's approach — blending AI and advisory — is exactly what this moment calls for. I've seen firsthand how data and automation can unlock real value in complex transactions.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                I believe I can bring meaningful insight, execution experience, and founder-level thinking to what you're building. If the vision is bold, I want in.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-stripe-purple/5 rounded-full blur-3xl" />
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-stripe-blue/5 rounded-full blur-3xl" />
    </section>
  );
};

export default Vision;
