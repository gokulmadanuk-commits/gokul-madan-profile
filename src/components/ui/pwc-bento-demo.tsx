
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    name: "",
    description: "",
    href: "/",
    cta: "",
    background: <div className="absolute -right-20 -top-20 opacity-60"></div>,
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
