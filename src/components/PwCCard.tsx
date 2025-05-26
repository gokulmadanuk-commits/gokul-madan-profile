
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Logo {
  src: string;
  alt: string;
  className?: string;
}

interface PwCCardProps {
  title: string;
  description: string | React.ReactNode;
  logos?: Logo[];
  tags?: string[];
  className?: string;
}

const PwCCard: React.FC<PwCCardProps> = ({
  title,
  description,
  logos,
  tags,
  className
}) => {
  return <Card className={`shadow-lg ${className || ''}`}>
      <CardContent className="p-6 h-full flex flex-col">
        <h4 className="mb-3 font-bold text-[#31602f] text-xl">{title}</h4>
        <div className="text-gray-600 mb-4 flex-grow">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>
        
        {logos && logos.length > 0 && <div className="mb-2">
            {logos.length <= 3 ? <div className="flex items-center justify-between">
                {logos.map((logo, index) => <div key={index} className="flex items-center justify-center h-16 w-24">
                    <img src={index === 2 ? "/lovable-uploads/36bec207-8772-4896-a399-3611639fe1ab.png" : logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                  </div>)}
              </div> : logos.length <= 4 ? <div>
                <div className="flex items-center justify-between mb-2">
                  {logos.slice(0, 2).map((logo, index) => <div key={index} className="flex items-center justify-center h-16 w-24">
                      <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                    </div>)}
                </div>
                <div className="flex items-center justify-around">
                  {logos.slice(2).map((logo, index) => <div key={index + 2} className="flex items-center justify-center h-16 w-24">
                      <img src={index === 0 ? "/lovable-uploads/36bec207-8772-4896-a399-3611639fe1ab.png" : logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                    </div>)}
                </div>
              </div> : <div className="space-y-2">
                <div className="flex items-center justify-around">
                  {logos.slice(0, 3).map((logo, index) => <div key={index} className="flex items-center justify-center h-14 w-20">
                      <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                    </div>)}
                </div>
                <div className="flex items-center justify-around">
                  {logos.slice(3, 6).map((logo, index) => <div key={index + 3} className="flex items-center justify-center h-14 w-20">
                      <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                    </div>)}
                </div>
                <div className="flex items-center justify-around">
                  {logos.slice(6, 9).map((logo, index) => <div key={index + 6} className="flex items-center justify-center h-14 w-20">
                      <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                    </div>)}
                </div>
              </div>}
          </div>}
        
        {tags && tags.length > 0 && <div className="flex gap-2 flex-wrap mt-auto">
            {tags.map((tag, index) => <span key={index} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {tag}
              </span>)}
          </div>}
      </CardContent>
    </Card>;
};

export default PwCCard;
