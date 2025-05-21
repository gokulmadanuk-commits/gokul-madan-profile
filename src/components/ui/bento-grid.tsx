
import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  image,
  caption,
}: {
  name: string;
  className: string;
  background?: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
  image?: string;
  caption?: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-xl h-[22rem]",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    {background && <div>{background}</div>}
    
    {image && (
      <div className="absolute inset-0 w-full h-full">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain p-6"
        />
      </div>
    )}
    
    <div className={cn(
      "pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300",
      image ? "mt-auto bg-gradient-to-t from-black/80 to-transparent text-white" : "group-hover:-translate-y-10"
    )}>
      <Icon className={cn(
        "h-12 w-12 origin-left transform-gpu transition-all duration-300 ease-in-out",
        image ? "text-white" : "text-neutral-700 group-hover:scale-75"
      )} />
      <h3 className={cn(
        "text-xl font-semibold",
        image ? "text-white" : "text-neutral-700 dark:text-neutral-300"
      )}>
        {name}
      </h3>
      <p className={cn(
        "max-w-lg",
        image ? "text-white/90" : "text-neutral-400"
      )}>
        {description}
      </p>
      {caption && (
        <p className="text-lg font-medium mt-2 text-white/90">
          {caption}
        </p>
      )}
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        image ? "bg-black/70 z-20" : ""
      )}
    >
      <Button variant="ghost" asChild size="sm" className={cn(
        "pointer-events-auto",
        image ? "text-white hover:bg-white/20 hover:text-white" : ""
      )}>
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className={cn(
      "pointer-events-none absolute inset-0 transform-gpu transition-all duration-300",
      image ? "" : "group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10"
    )} />
  </div>
);

export { BentoCard, BentoGrid };
