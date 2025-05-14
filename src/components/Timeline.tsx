
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const Timeline: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const timelineItems = timelineRef.current?.querySelectorAll('.timeline-item');
    timelineItems?.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      timelineItems?.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section id="timeline" className="py-20 bg-slate-light">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-12 text-center">Professional Journey</h2>
        
        <div ref={timelineRef} className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
          
          {/* Timeline entries */}
          {timelineData.map((entry, index) => (
            <div key={index} className="timeline-item opacity-0 mb-12">
              <div className="timeline-card">
                <div className="timeline-dot"></div>
                <div className="mb-2">
                  <span className="text-sm font-medium bg-beige px-3 py-1 rounded-full">{entry.period}</span>
                </div>
                <Card className="border-0 shadow-md card-hover">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{entry.title}</CardTitle>
                    <CardDescription className="text-base font-medium">{entry.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1">
                      {entry.description.map((item, i) => (
                        <li key={i} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
