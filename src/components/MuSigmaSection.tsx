import React from 'react';
const MuSigmaSection: React.FC = () => {
  return <div className="mt-16 mb-10">
      <div className="flex items-center justify-between w-full mb-4">
        <div>
          <h3 className="text-2xl font-bold">2011 - 2015</h3>
          <p className="text-xl text-gray-700">Associate</p>
          <p className="text-primary hover:underline">
            Mu Sigma Inc.
          </p>
        </div>
        <img src="/lovable-uploads/2e8e1f34-d32d-49fb-8294-4d4670c7f88e.png" alt="Mu Sigma Logo" className="h-14 w-auto rounded-md" />
      </div>
      
      {/* Mu Sigma description */}
      <div className="mb-8 rounded-lg p-6 bg-transparent py-0 px-0">
        <p className="text-lg leading-relaxed mb-4">I pioneered digital adoption strategies for Fortune 500 companies in the Telecommunications and Banking sectors:</p>
        <ul className="text-lg leading-relaxed list-disc pl-6 space-y-2 px-[30px]">
          <li>Built statistical models at the AT&T Big Data Centre of Excellence to enhance customer targeting for digital channels</li>
          <li>Led teams in launching cross-channel sales processes with the Buy Online – Pick Up in Store initiative at AT&T</li>
          <li>Managed the web analytics for the iPhone 6 launch on the AT&T website</li>
          <li>Developed robust segmentation frameworks for a Key Bank, enabling effective sales performance management and staff optimization</li>
        </ul>
        
        {/* Client logos */}
        <div className="flex items-center gap-8 mt-6 px-[30px]">
          <img src="/lovable-uploads/3e0b2e47-aa77-4237-9556-3cfec7225785.png" alt="AT&T Logo" className="h-14 w-auto" />
          <img src="/lovable-uploads/542d6830-9573-47fc-a7ba-978504ebb01a.png" alt="KeyBank Logo" className="h-16 w-auto" />
        </div>
      </div>
    </div>;
};
export default MuSigmaSection;