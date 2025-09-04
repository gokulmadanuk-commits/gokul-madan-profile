import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
interface ValueProposition {
  title: string;
  category: string;
  description: string;
}
const valuePropositions: ValueProposition[] = [{
  title: "Deals Analytics Expertise",
  category: "Analytics",
  description: "Deep experience in M&A, analytics, due diligence and transaction modeling for billion-dollar deals"
}, {
  title: "Product and Automation Expertise",
  category: "Technology",
  description: "Proven track record building SaaS platforms and automation solutions that scale"
}, {
  title: "Existing Consolidation Platform for PE Portcos",
  category: "Platform",
  description: "Ready-to-deploy modular automation engine designed specifically for Private Equity portfolio companies."
}, {
  title: "Accounting, Technology and AI Network in Northern Ireland",
  category: "Network",
  description: "Established connections across key professional services and technology sectors"
}];
const PwCHighlights: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-fade-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    const cards = cardsRef.current?.querySelectorAll('.value-prop-card');
    cards?.forEach(card => {
      observer.observe(card);
    });
    return () => {
      cards?.forEach(card => {
        observer.unobserve(card);
      });
    };
  }, []);
  return <section id="pwc" className="bg-beige-light py-[20px]">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6 text-center">Why I'm Excited About Accordion</h2>
        
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <p className="text-lg leading-relaxed font-bold text-[#31602f]">Helping sponsors and CFOs unlock value through data, automation, and execution is at the heart of Accordion — and it’s where I know I can contribute.</p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            I've seen firsthand how data and automation can unlock real value in complex transactions. I believe I can bring meaningful insight, execution experience, and founder-level thinking to what you're building.
          </p>
        </div>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valuePropositions.map((proposition, index) => <div key={index} className="value-prop-card opacity-0">
              <Card className="h-full border-0 shadow-lg flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{proposition.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-700">{proposition.description}</p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {proposition.category}
                  </span>
                </CardFooter>
              </Card>
            </div>)}
        </div>
      </div>
    </section>;
};
export default PwCHighlights;