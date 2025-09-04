import React from 'react';
import XolutionCarousel from './XolutionCarousel';
const XolutionSection: React.FC = () => {
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
  return <div className="mb-10">
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h3 className="text-2xl font-bold">2023 - Present</h3>
          <p className="text-xl text-gray-700">Founder and CEO</p>
          <a href="https://xolution.io" target="_blank" rel="noopener noreferrer" className="text-[#1F242F] hover:underline">
            Xolution
          </a>
        </div>
        <img src="/lovable-uploads/d1c4cddc-b280-4bac-a5ab-3f5976ffee87.png" alt="Xolution Logo" className="h-8 w-auto" />
      </div>
      
      {/* Xolution description */}
      <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
        <p className="text-lg leading-relaxed mb-4">
          Xolution is a tech-enabled Fractional FP&A partner, empowering lean mid-market PE portfolio companies
          drive rapid value creation. It serves as a bridge between technology-driven efficiency and the ever-evolving world of financial transactions.
        </p>
        <p className="text-xl font-bold text-[#1F242F]">
          What if you had the ability to produce a QoE every single month, instead of just at the time of the deal!
        </p>
      </div>
      
      <XolutionCarousel slides={carouselSlides} />
    </div>;
};
export default XolutionSection;