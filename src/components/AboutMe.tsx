
import React from 'react';

const AboutMe: React.FC = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-secondary/50 pointer-events-none" />
      
      <div className="section-container relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">Who I Am</h2>
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed text-muted-foreground">
              With over 14 years of experience in Deals, Analytics, and Digital Transformation, I've helped Fortune 100 companies through some of their most complex transactions — from spin-offs to IPOs to Private Equity value creation.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              At PwC in Washington DC, I led analytics teams supporting multi-billion-dollar deals. Today, I'm building Xolution — a reporting automation platform for Private Equity firms and their portfolio companies.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              I've worked across India, the US, and the UK, but what ties it all together is this: I use data and technology to solve business problems that matter.
            </p>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default AboutMe;
