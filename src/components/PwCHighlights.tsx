
import React, { useEffect, useRef } from 'react';

interface CaseStudy {
  title: string;
  dealType: string;
  description: string;
}

const caseStudies: CaseStudy[] = [
  {
    title: "$1.2B Sale to Maersk",
    dealType: "M&A",
    description: "Built customer insight engine for Pilot Freight's sell-side diligence",
  },
  {
    title: "PPD IPO",
    dealType: "IPO",
    description: "Developed bottom-up forecasting models with accounting implications",
  },
  {
    title: "GE Spin-offs",
    dealType: "Divestiture",
    description: "Supported carve-outs of Healthcare, Lighting, and Power divisions",
  },
  {
    title: "PE Rollups",
    dealType: "Rollup",
    description: "Created financial consolidation engine used across multiple transactions",
  },
];

const PwCHighlights: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = cardsRef.current?.querySelectorAll('.case-study-card');
    cards?.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      cards?.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section id="pwc" className="py-24 relative overflow-hidden">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">What I Built at PwC</h2>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {caseStudies.map((study, index) => (
            <div key={index} className="case-study-card opacity-0">
              <div className="h-full bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-medium">{study.title}</h3>
                    <span className="text-xs font-medium bg-stripe-purple/10 text-stripe-purple px-2 py-1 rounded-full">
                      {study.dealType}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{study.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-secondary/20 pointer-events-none" />
    </section>
  );
};

export default PwCHighlights;
