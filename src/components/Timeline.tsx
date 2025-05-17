
import React from 'react';
import { Timeline as UiTimeline } from "@/components/ui/timeline";
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

// Transform the timelineData into the format expected by the UI Timeline component
const formattedData = timelineData.map(entry => ({
  title: entry.period,
  content: (
    <div className="bg-card backdrop-blur-sm rounded-lg p-6 shadow-md border border-accent/30">
      <h3 className="text-xl font-serif font-semibold mb-1">{entry.title}</h3>
      <p className="text-base font-medium text-foreground/80 mb-4">{entry.company}</p>
      <ul className="list-disc list-inside space-y-2">
        {entry.description.map((item, i) => (
          <li key={i} className="text-foreground/90">{item}</li>
        ))}
      </ul>
    </div>
  ),
}));

const TimelineComponent: React.FC = () => {
  return (
    <section id="timeline" className="py-20 bg-gradient-to-b from-background/90 to-background">
      <div className="section-container mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center text-primary">Professional Journey</h2>
      </div>
      
      <UiTimeline data={formattedData} />
    </section>
  );
};

export default TimelineComponent;
