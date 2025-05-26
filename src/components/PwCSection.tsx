import React from 'react';
import PwCCard from './PwCCard';
const PwCSection: React.FC = () => {
  const pilotFreightLogos = [{
    src: "/lovable-uploads/1af70454-605a-4248-8505-92fa5666d3ea.png",
    alt: "Maersk",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/5e8c18be-970d-4977-b433-7ef973e4ce29.png",
    alt: "Pilot Freight Services",
    className: "h-12 w-auto"
  }, {
    src: "/lovable-uploads/1ec2cced-d590-43d0-a971-d323e1d47af8.png",
    alt: "ATL Partners",
    className: "h-14 w-auto"
  }, {
    src: "/lovable-uploads/0b165cc7-8ff4-486e-966b-89d71eb26e01.png",
    alt: "BCI",
    className: "h-6 w-auto"
  }];
  const gofanLogos = [{
    src: "/lovable-uploads/eef35f22-2207-453e-b7a6-461ea39fbd05.png",
    alt: "KKR",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/3860c3ed-d503-4eda-8c9f-f74bbab5eaeb.png",
    alt: "PlayOn",
    className: "h-9 w-auto"
  }, {
    src: "/lovable-uploads/b8f19173-4547-4d54-bb16-b241249d6af8.png",
    alt: "GoFan",
    className: "h-12 w-auto"
  }];
  const complexCarveoutLogos = [{
    src: "/lovable-uploads/8ab96d05-60f7-416c-8d2f-eae3620b04d5.png",
    alt: "Hewlett Packard Enterprise",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/25d8be60-48bf-4948-9391-bc12f2ddd5ce.png",
    alt: "DXC Technology",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/eee48268-cca1-4dfd-abed-2aad34e82fdd.png",
    alt: "Grinwell",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/5ce79358-389e-4fc9-bbaa-4ff0501456b6.png",
    alt: "Perspecta",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/4523e26c-e0e1-4376-a6fe-f8a75656d689.png",
    alt: "Symantec",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/27b9a23f-c96b-47e2-8be0-fbdc0eb520de.png",
    alt: "VeriSign",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/cd70899d-30be-4e36-9dc6-9b9a04e6d71e.png",
    alt: "General Electric",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/04dcf006-1259-4072-8cd9-78ec59199151.png",
    alt: "GE Vernova",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/86b71b26-b828-4f65-b42e-19a59169bc9a.png",
    alt: "GE HealthCare",
    className: "h-8 w-auto"
  }];
  const costTakeoutLogos = [{
    src: "/lovable-uploads/d8bd04f8-30e1-46b6-b2c6-3b51b81906c4.png",
    alt: "AT&T",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/19818142-90f8-497a-85f3-68e7f3b2ebfb.png",
    alt: "Palantir",
    className: "h-8 w-auto"
  }];
  const advancedAnalyticsLogos = [{
    src: "/lovable-uploads/19f5f5c6-8131-47f2-998b-d1fd113ca882.png",
    alt: "The Carlyle Group",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/4f5b142c-7aee-4a67-931d-3f480f421800.png",
    alt: "PPD",
    className: "h-8 w-auto"
  }, {
    src: "/lovable-uploads/f1edcfa5-11cc-4fce-897d-4e3c508afea4.png",
    alt: "Ansira",
    className: "h-8 w-auto"
  }];
  return <div className="mt-16 mb-10">
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h3 className="text-2xl font-bold">2015 - 2023</h3>
          <p className="text-xl text-gray-700">Senior Manager</p>
          <p className="text-primary hover:underline">
            Deals Strategy and PE Value Creation
          </p>
        </div>
        <img src="/lovable-uploads/5ea78123-d77b-4bca-9d19-36b970acc74a.png" alt="PwC Logo" className="h-17 w-auto rounded-md" />
      </div>
      
      {/* PwC description */}
      <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
        <p className="text-lg leading-relaxed">I have led high-impact analytics and strategy initiatives across Fortune 100 companies, M&amp;A engagements, IPOs, and divestitures at PwC's Deals practice in the US. I also specialized in value creation for Private Equity clients, delivering insights, forecasting models, and data-driven solutions that shaped billion-dollar transactions. Below are a few highlights.</p>
      </div>
      
      {/* Responsive 3-Column Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Column 1 - 2 cards (2/3 top, 1/3 bottom) */}
        <div className="flex flex-col gap-4 order-1 lg:order-1">
          <PwCCard title="Customer & Product Insights" description="Led a team that built a Customer and Product insights engine that was instrumental to the Sell Side Diligence for the sale of Pilot Freight Services (Backed by PE Firms ATL Partners and BCI) in their sale to Maersk for $1.7B" logos={pilotFreightLogos} tags={["Private Equity", "Sell Side Diligence"]} className="flex-[2]" />
          <PwCCard title="Consolidated Data Cube" description="Built a consolidated data cube, combining data across 6 sources to support monthly sponsor reporting for the acquisition of Gofan by PlayOn (a KKR Portfolio company)." logos={gofanLogos} tags={["Private Equity", "Sell Side Diligence", "Consolidation"]} className="flex-1" />
        </div>
        
        {/* Column 2 - 1 full height card */}
        <div className="flex order-2 lg:order-2">
          <PwCCard title="Complex Carveouts" description={<div className="space-y-3">
                <div>
                  <span className="font-bold">Hewlett Packard Enterprise</span>: Supported the complex 4 way carveout of HPE. Focussed on the Legal Entity P&L separation encompassing complex Transfer Pricing situations.
                </div>
                <div>
                  <span className="font-bold">DXC</span>: Led the Deals Analytics team in a complex 3 way carveout of DxC. Managed teams working through the data heavy portions of the Financials (e.g. AP, AR, Revenue, Expense allocations). Also helped implement a consolidation automation tool.
                </div>
                <div>
                  <span className="font-bold">GE Power + GE Healthcare</span>: Worked on the divestitures of GE Power (Vernova) and Healthcare from GE involving highly complex multi layer accounting and reporting systems.
                </div>
                <div>
                  <span className="font-bold">Symantec</span>: Supported the divestiture of Verisign from Symantec
                </div>
              </div>} logos={complexCarveoutLogos} tags={["Carveout", "Deals Analytics"]} className="flex-1" />
        </div>
        
        {/* Column 3 - 2 cards (1/3 top, 2/3 bottom) */}
        <div className="flex flex-col gap-4 order-3 lg:order-3">
          <PwCCard title="Cost Takeout" description="Leveraged Palantir Foundry at AT&T to help drive a cost takeout initiative for the Engineering Operations team, identifying $25M+ in takeout opportunity." logos={costTakeoutLogos} tags={["Advanced Analytics", "Cost Takeout"]} className="flex-1" />
          <PwCCard title="Advanced Analytics and Modeling" description={<ul className="space-y-2 list-disc pl-5">
                <li>Built a bottom-up Indirect Revenue forecasting model ahead of the IPO of a Carlyle portfolio company, PPD</li>
                <li>Drove the strategy and direction in the build of an Accounts Receivable collections model. We were able to accurately predict the customers propensity to pay and help drive AR invocing strategy</li>
              </ul>} logos={advancedAnalyticsLogos} tags={["Advanced Analytics", "Financial Modeling", "IPO"]} className="flex-[2]" />
        </div>
      </div>
    </div>;
};
export default PwCSection;