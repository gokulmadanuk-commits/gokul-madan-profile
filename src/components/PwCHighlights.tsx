
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ValueProposition {
  title: string;
  category: string;
  description: string;
}

const valuePropositions: ValueProposition[] = [
  {
    title: "Deals Analytics Expertise",
    category: "Analytics",
    description: "Deep experience in M&A analytics, due diligence, and transaction modeling from billion-dollar deals",
  },
  {
    title: "Product and Automation Expertise",
    category: "Technology",
    description: "Proven track record building SaaS platforms and automation solutions that scale",
  },
  {
    title: "Existing Consolidation Platform for PE Portcos",
    category: "Platform",
    description: "Ready-to-deploy consolidation engine designed specifically for private equity portfolio companies",
  },
  {
    title: "Accounting, Technology and AI Network in Northern Ireland",
    category: "Network",
    description: "Established connections across key professional services and technology sectors",
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

    const cards = cardsRef.current?.querySelectorAll('.value-prop-card');
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
        <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-12 text-center">Why Unity Advisory</h2>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valuePropositions.map((proposition, index) => (
            <div key={index} className="value-prop-card opacity-0">
              <Card className="h-full border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{proposition.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{proposition.description}</p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {proposition.category}
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
