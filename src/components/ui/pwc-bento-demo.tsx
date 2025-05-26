

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: (
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="text-sm text-gray-700 leading-relaxed">
          Led a team that built a Customer and Product consolidation and insights engine that was instrumental to the Sell Side Diligence for the sale of Pilot Freight Services (Backed by PE Firms ATL Partners and BCI) in their sale to Maersk for $1.7B
        </div>
        <div className="flex items-center justify-between mt-4">
          <img src="/lovable-uploads/25e5470a-e5e9-4ddc-8848-e98f603d2a8c.png" alt="Pilot Freight Services" className="h-8 w-auto" />
          <img src="/lovable-uploads/0ffc85ee-04cd-48f4-9921-305c368bb304.png" alt="Maersk" className="h-8 w-auto" />
          <img src="/lovable-uploads/888cc071-63ef-45db-9b0f-5cae6dace908.png" alt="ATL Partners" className="h-8 w-auto" />
          <img src="/lovable-uploads/15d6490f-ddb4-480a-a135-6874f46360b1.png" alt="BCI" className="h-8 w-auto" />
        </div>
      </div>
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: <div className="absolute -right-20 -top-20 opacity-60"></div>,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: <div className="absolute -right-20 -top-20 opacity-60"></div>,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: <div className="absolute -right-20 -top-20 opacity-60"></div>,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: <div className="absolute -right-20 -top-20 opacity-60"></div>,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

function PwCBentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature, index) => (
        <BentoCard key={index} {...feature} />
      ))}
    </BentoGrid>
  );
}

export { PwCBentoDemo };

