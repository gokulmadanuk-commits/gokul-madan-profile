
"use client";

import { useMotionValueEvent, useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({
  data
}: {
  data: TimelineEntry[];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);
  
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"]
  });
  
  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  
  return (
    <div className="relative mx-auto max-w-4xl px-4 md:px-6" ref={containerRef}>
      <div className="relative">
        {/* Timeline line */}
        <motion.div 
          style={{ height: heightTransform, opacity: opacityTransform }}
          className="absolute left-0 md:left-1/2 h-full w-0.5 bg-primary transform -translate-x-1/2"
        />
        
        <div className="space-y-12" ref={ref}>
          {data.map((entry, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${
                index % 2 === 0 
                ? "md:flex-row" 
                : "md:flex-row-reverse"
              } gap-8 md:gap-12`}
            >
              <div className="flex-1 md:text-right md:pr-8">
                <h3 className="text-lg font-medium mb-2">{entry.title}</h3>
              </div>
              
              <div className="relative">
                <div className="absolute left-0 md:left-0 top-0 h-4 w-4 rounded-full bg-primary transform md:translate-x-(-50%) mt-1.5" />
              </div>
              
              <div className="flex-1 md:pl-8">
                {entry.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
