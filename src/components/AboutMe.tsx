import React from 'react';
const AboutMe: React.FC = () => {
  return <section id="about" className="py-20 bg-primary">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center text-slate-50">Who I Am</h2>
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed text-slate-50 text-left">With 14+ years in Deals, Analytics, and Digital Transformation, I’ve led data-driven initiatives for global enterprises.</p>
            <p className="leading-relaxed text-slate-50">I've also built a SaaS platform that streamlines financial workflows and automates complex reporting for Private Equity–backed companies.</p>
            <p className="leading-relaxed text-slate-50">I've also built a SaaS platform that streamlines financial workflows and automates complex reporting for Private Equity–backed companies.</p>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutMe;