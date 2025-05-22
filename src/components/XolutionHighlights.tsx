import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
const XolutionHighlights: React.FC = () => {
  // Client logos to display - matching the ones in ProfessionalJourney
  const clientLogos = [{
    src: "/lovable-uploads/ba563727-2d13-4f21-8f46-2594c63aa02c.png",
    alt: "WestBridge Logo"
  }, {
    src: "/lovable-uploads/830fa207-5dba-44b1-a4c1-508b484c44b0.png",
    alt: "Accordion Logo"
  }, {
    src: "/lovable-uploads/735e5e15-6c5a-4b2c-b895-585f5e58b920.png",
    alt: "CrossCountry Consulting Logo"
  }, {
    src: "/lovable-uploads/aa767c51-79ad-4265-9ed0-9c9936391277.png",
    alt: "Houlihan Lokey Logo"
  }, {
    src: "/lovable-uploads/ed3a1c78-0582-4c4f-9a80-6a9d9e330a7a.png",
    alt: "Siegfried Logo"
  }, {
    src: "/lovable-uploads/3f5e2dc5-5f5c-4dce-b899-bcad38cd8534.png",
    alt: "Vistria Logo"
  }];

  // Updated carousel slides with new image paths
  const carouselSlides = [{
    src: "/lovable-uploads/8ee16498-f5bf-4553-acf5-1f4b857b9a53.png",
    alt: "Challenges Tracking Portfolio Company Performance"
  }, {
    src: "/lovable-uploads/fe476a3c-be34-4bf9-b289-b4e806c296d3.png",
    alt: "Driving Value for Companies in the Mid-Market Sweet Spot"
  }, {
    src: "/lovable-uploads/84938ca9-0f1c-4d4f-b2c9-27d7ddb688c1.png",
    alt: "Laying the Foundation for Effective FP&A"
  }, {
    src: "/lovable-uploads/85ac2339-e18f-4c5f-b428-bb367f058892.png",
    alt: "Need for Robust Reporting"
  }, {
    src: "/lovable-uploads/f3e151b5-474a-4bd9-a845-9c774056dfe8.png",
    alt: "Modular Architecture"
  }, {
    src: "/lovable-uploads/aa65d36c-616c-42f0-9d25-6e09c5717d56.png",
    alt: "Xolution Approach"
  }];
  return <section id="xolution" className="py-20 bg-white">
      
    </section>;
};
export default XolutionHighlights;