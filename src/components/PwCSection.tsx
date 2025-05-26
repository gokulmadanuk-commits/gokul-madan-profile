
import React from 'react';
import PwCCard from './PwCCard';

const PwCSection: React.FC = () => {
  const pilotFreightLogos = [
    { src: "/lovable-uploads/1af70454-605a-4248-8505-92fa5666d3ea.png", alt: "Maersk", className: "h-8 w-auto" },
    { src: "/lovable-uploads/5e8c18be-970d-4977-b433-7ef973e4ce29.png", alt: "Pilot Freight Services", className: "h-12 w-auto" },
    { src: "/lovable-uploads/1ec2cced-d590-43d0-a971-d323e1d47af8.png", alt: "ATL Partners", className: "h-14 w-auto" },
    { src: "/lovable-uploads/0b165cc7-8ff4-486e-966b-89d71eb26e01.png", alt: "BCI", className: "h-6 w-auto" }
  ];

  const gofanLogos = [
    { src: "/lovable-uploads/eef35f22-2207-453e-b7a6-461ea39fbd05.png", alt: "KKR", className: "h-8 w-auto" },
    { src: "/lovable-uploads/3860c3ed-d503-4eda-8c9f-f74bbab5eaeb.png", alt: "PlayOn", className: "h-9 w-auto" },
    { src: "/lovable-uploads/2ccfa540-46da-4f8e-92dc-dcb43877cbd0.png", alt: "GoFan", className: "h-12 w-auto" }
  ];

  return (
    <div className="mt-16 mb-10">
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h3 className="text-2xl font-bold">2015 - 2023</h3>
          <p className="text-xl text-gray-700">Senior Manager</p>
          <p className="text-primary hover:underline">
            Deals Strategy and PE Value Creation
          </p>
        </div>
        <img src="/lovable-uploads/5ea78123-d77b-4bca-9d19-36b970acc74a.png" alt="PwC Logo" className="h-20 w-auto rounded-md" />
      </div>
      
      {/* PwC description */}
      <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
        <p className="text-lg leading-relaxed">I have led high-impact analytics and strategy initiatives across Fortune 100 companies, M&A engagements, IPOs, and divestitures at PwC's Deals practice in the US. I also specialized in value creation for Private Equity clients, delivering insights, forecasting models, and data-driven solutions that shaped billion-dollar transactions.</p>
      </div>
      
      {/* Responsive 3-Column Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Column 1 - 2 cards (2/3 top, 1/3 bottom) */}
        <div className="flex flex-col gap-4 order-1 lg:order-1">
          <PwCCard
            title="Customer & Product Insights"
            description="Led a team that built a Customer and Product insights engine that was instrumental to the Sell Side Diligence for the sale of Pilot Freight Services (Backed by PE Firms ATL Partners and BCI) in their sale to Maersk for $1.7B"
            logos={pilotFreightLogos}
            tags={["Private Equity", "Sell Side Diligence"]}
            className="flex-[2]"
          />
          <PwCCard
            title="Consolidated Data Cube"
            description="Built a consolidated data cube, combining data across 6 sources to support monthly sponsor reporting for the acquisition of Gofan by PlayOn (a KKR Portfolio company)."
            logos={gofanLogos}
            tags={["Private Equity", "Sell Side Diligence", "Consolidation"]}
            className="flex-1"
          />
        </div>
        
        {/* Column 2 - 1 full height card */}
        <div className="flex order-2 lg:order-2">
          <PwCCard
            title="PE Value Creation"
            description="Specialized in developing data-driven solutions and forecasting models that directly contributed to value creation strategies for Private Equity portfolio companies."
            tags={["Billion-Dollar Impact"]}
            className="flex-1"
          />
        </div>
        
        {/* Column 3 - 2 cards (1/3 top, 2/3 bottom) */}
        <div className="flex flex-col gap-4 order-3 lg:order-3">
          <PwCCard
            title="Financial Modeling"
            description="Advanced forecasting and valuation models."
            className="flex-1"
          />
          <PwCCard
            title="Data-Driven Insights"
            description="Delivered comprehensive insights and analytics that shaped strategic decision-making across complex financial transactions and business transformations."
            className="flex-[2]"
          />
        </div>
      </div>
    </div>
  );
};

export default PwCSection;
