
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <section id="pwc" className="py-20 bg-beige-light">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-12 text-center">What I Built at PwC</h2>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="case-study-card opacity-0">
              <Card className="h-full border-0 shadow-lg card-hover">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{study.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{study.description}</p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {study.dealType}
                  </span>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PwCHighlights;
