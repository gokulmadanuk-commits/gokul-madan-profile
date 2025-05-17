
import React from 'react';

const XolutionHighlights: React.FC = () => {
  return (
    <section id="xolution" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 pointer-events-none" />
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Building Xolution</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p className="leading-relaxed">
                After years in Private Equity advisory, I built the tool I always wished existed — a platform that transforms chaotic Excel workflows into streamlined, automated monthly reporting.
              </p>
              <p className="leading-relaxed">
                With customizable inputs, standardized outputs, and real-time visibility, Xolution helps deal teams and portfolio companies track KPIs and progress against investment theses — without waiting on consultants.
              </p>
              <p className="leading-relaxed">
                Currently being piloted by top consulting firms, and scaling fast.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="aspect-video bg-stripe-gray-light rounded-lg border shadow-sm">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-4 text-stripe-purple/30">
                        <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
                      </svg>
                      <p className="text-muted-foreground">Interactive Demo</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-secondary rounded-full w-full"></div>
                  <div className="h-4 bg-secondary rounded-full w-5/6"></div>
                  <div className="h-4 bg-secondary rounded-full w-4/6"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-6 -left-6 w-24 h-24 bg-stripe-purple/10 rounded-full animate-float"></div>
            <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 bg-stripe-blue/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default XolutionHighlights;
