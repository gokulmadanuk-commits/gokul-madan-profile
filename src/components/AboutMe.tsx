import React from 'react';
const AboutMe: React.FC = () => {
  return <section id="about" className="py-12 bg-primary">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed text-slate-50 text-center font-normal text-xl">With 14+ years in Deals, Analytics, and Digital Transformation, I've led data-driven initiatives for global enterprises.</p>
            <p className="leading-relaxed text-slate-50 text-xl text-center">I've also built a SaaS platform that streamlines financial workflows and automates complex reporting for Private Equity–backed companies.</p>
            <p className="leading-relaxed text-slate-50 text-xl text-center">My experience spans IPOs, divestitures, and PE deals—always with a focus on making complex processes faster, clearer, and more scalable.</p>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutMe;