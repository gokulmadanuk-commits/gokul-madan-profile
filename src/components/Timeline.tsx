
import React from 'react';
import { Timeline as UiTimeline } from "@/components/ui/timeline";
import { Card } from "@/components/ui/card";

interface TimelineEntry {
  period: string;
  title: string;
  company: string;
  description: string[];
}

const timelineData: TimelineEntry[] = [{
  period: "2023 – Present",
  title: "Founder",
  company: "Xolution",
  description: ["Built a modular SaaS platform to automate monthly PE reporting", "Piloted with leading consulting firms in the US and UK"]
}, {
  period: "2015 – 2023",
  title: "Senior Manager",
  company: "PwC (Washington DC)",
  description: ["Led analytics for multi-billion-dollar transactions and spin-offs", "Key deals: PPD IPO, GE carve-outs, Maersk–Pilot Freight acquisition"]
}, {
  period: "2011 – 2015",
  title: "Associate",
  company: "Mu Sigma (Atlanta)",
  description: ["Improved digital channel targeting for AT&T and major banks"]
}, {
  period: "2010 – 2011",
  title: "Programmer Analyst",
  company: "Cognizant (Bangalore)",
  description: ["QA + defect resolution for insurance data systems"]
}];

// Transform the timelineData into the format expected by the UI Timeline component
const formattedData = timelineData.map(entry => ({
  title: entry.period,
  content: <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-[#1C3B26]">
      <h3 className="text-xl font-serif font-semibold mb-1">{entry.title}</h3>
      <p className="text-base font-medium text-neutral-600 dark:text-neutral-400 mb-4">{entry.company}</p>
      <ul className="list-disc list-inside space-y-2">
        {entry.description.map((item, i) => <li key={i} className="text-neutral-700 dark:text-neutral-300">{item}</li>)}
      </ul>
    </div>
}));

const TimelineComponent: React.FC = () => {
  return (
    <div id="experience" className="py-16 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Professional Journey</h2>
        <UiTimeline data={formattedData} />
      </div>
    </div>
  );
};

export default TimelineComponent;
