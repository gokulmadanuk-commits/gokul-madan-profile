
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Logo {
  src: string;
  alt: string;
  className?: string;
}

interface PwCCardProps {
  title: string;
  description: string;
  logos?: Logo[];
  tags?: string[];
  className?: string;
}

const PwCCard: React.FC<PwCCardProps> = ({ title, description, logos, tags, className }) => {
  return (
    <Card className={`shadow-lg ${className || ''}`}>
      <CardContent className="p-6 h-full flex flex-col">
        <h4 className="mb-3 font-bold text-[#31602f] text-xl">{title}</h4>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        
        {logos && logos.length > 0 && (
          <div className="mb-4">
            {logos.length <= 3 ? (
              <div className="flex items-center justify-between">
                {logos.map((logo, index) => (
                  <img key={index} src={logo.src} alt={logo.alt} className={logo.className || "h-8 w-auto"} />
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  {logos.slice(0, 2).map((logo, index) => (
                    <img key={index} src={logo.src} alt={logo.alt} className={logo.className || "h-8 w-auto"} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  {logos.slice(2).map((logo, index) => (
                    <img key={index + 2} src={logo.src} alt={logo.alt} className={logo.className || "h-8 w-auto"} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-auto">
            {tags.map((tag, index) => (
              <span key={index} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PwCCard;
