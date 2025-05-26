
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CarouselSlide {
  src: string;
  alt: string;
}

interface XolutionCarouselProps {
  slides: CarouselSlide[];
}

const XolutionCarousel: React.FC<XolutionCarouselProps> = ({ slides }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const handleOverviewDownload = () => {
    window.open('https://drive.google.com/file/d/12jLt5QWPXslQqPpClrUgLvVR9Ggsid6G/view?usp=sharing', '_blank');
  };

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="mb-8">
      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1 h-full">
                <Card className="overflow-hidden shadow-lg border">
                  <CardContent className="p-0">
                    <AspectRatio ratio={16 / 9}>
                      <img src={slide.src} alt={slide.alt} className="object-contain w-full h-full" />
                    </AspectRatio>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 md:-left-6" />
        <CarouselNext className="-right-4 md:-right-6" />
      </Carousel>
      
      {/* Pagination dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index + 1 === current ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
      
      {/* Download Overview button */}
      <div className="mt-6">
        <Button size="lg" className="group w-full sm:w-auto" onClick={handleOverviewDownload}>
          <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
          Download Overview
        </Button>
      </div>
    </div>
  );
};

export default XolutionCarousel;
