import React from 'react';
const AboutMe: React.FC = () => {
  return <section id="about" className="py-20 bg-[#1c3b26]">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center text-slate-50">Who I Am</h2>
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed text-slate-50">With over 14 years of experience in Deals, Analytics, and Digital Transformation, I have a proven track record of driving data-led initiatives for major enterprises.</p>
            <p className="leading-relaxed text-slate-50">I’ve built a SaaS startup that automates financial workflows and enhances reporting processes for Private Equity portfolio companies.</p>
            <p className="leading-relaxed text-slate-50">My expertise spans complex divestitures, IPOs, and Private Equity transactions—particularly in leveraging technology to improve efficiency and transparency.</p>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutMe;