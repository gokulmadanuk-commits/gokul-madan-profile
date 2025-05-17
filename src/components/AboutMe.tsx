import React from 'react';
const AboutMe: React.FC = () => {
  return <section id="about" className="py-20 bg-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-8 text-center">Who I Am</h2>
          <div className="space-y-6 text-lg">
            <p className="leading-relaxed">With over 14 years of experience in Deals, Analytics, and Digital Transformation, I have a proven track record of driving data-led initiatives for major enterprises.</p>
            <p className="leading-relaxed">
              At PwC in Washington DC, I led analytics teams supporting multi-billion-dollar deals. Today, I'm building Xolution — a reporting automation platform for Private Equity firms and their portfolio companies.
            </p>
            <p className="leading-relaxed">
              I've worked across India, the US, and the UK, but what ties it all together is this: I use data and technology to solve business problems that matter.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutMe;