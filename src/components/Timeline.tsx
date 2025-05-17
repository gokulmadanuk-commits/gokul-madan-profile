
import React from 'react';
import { Card } from "@/components/ui/card";

interface TimelineEntry {
  period: string;
  title: string;
  company: string;
  description: string[];
}

const timelineData: TimelineEntry[] = [
  {
    period: "2023 – Present",
    title: "Founder",
    company: "Xolution",
    description: [
      "Built a modular SaaS platform to automate monthly PE reporting",
      "Piloted with leading consulting firms in the US and UK"
    ]
  },
  {
    period: "2015 – 2023",
    title: "Senior Manager",
    company: "PwC (Washington DC)",
    description: [
      "Led analytics for multi-billion-dollar transactions and spin-offs",
      "Key deals: PPD IPO, GE carve-outs, Maersk–Pilot Freight acquisition"
    ]
  },
  {
    period: "2011 – 2015",
    title: "Associate",
    company: "Mu Sigma (Atlanta)",
    description: [
      "Improved digital channel targeting for AT&T and major banks"
    ]
  },
  {
    period: "2010 – 2011",
    title: "Programmer Analyst",
    company: "Cognizant (Bangalore)",
    description: [
      "QA + defect resolution for insurance data systems"
    ]
  }
];

const TimelineComponent: React.FC = () => {
  return (
    <section id="timeline" className="py-24 bg-secondary/50">
      <div className="section-container">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">Professional Journey</h2>
          <p className="text-muted-foreground text-lg">A timeline of key roles that have shaped my expertise in analytics, transactions, and technology.</p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-stripe-purple/30 to-transparent ml-4 md:ml-8 lg:ml-40" />
          
          <div className="space-y-16 relative">
            {timelineData.map((entry, index) => (
              <div 
                key={index} 
                className="relative pl-12 md:pl-16 lg:pl-48"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center">
                  <div className="w-2 h-2 bg-stripe-purple rounded-full" />
                  <div className="absolute w-4 h-4 bg-stripe-purple/20 rounded-full animate-pulse" />
                </div>
                
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="text-sm font-medium text-stripe-gray mb-2">{entry.period}</div>
                    <h3 className="text-xl font-medium mb-1">{entry.title}</h3>
                    <p className="text-muted-foreground mb-4">{entry.company}</p>
                    <ul className="space-y-2">
                      {entry.description.map((item, i) => (
                        <li key={i} className="text-stripe-gray-dark flex items-start">
                          <span className="mr-2 text-stripe-purple">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineComponent;
