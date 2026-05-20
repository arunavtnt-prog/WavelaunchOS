import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

const LaunchRoadmap: React.FC = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden group">
      
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <h2 className="text-lg font-medium font-display">Launch Roadmap</h2>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 font-medium">
            <span>Office</span>
            <span className="text-green-500">Connected</span>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" />
      </div>

      <div className="relative w-full h-40 mt-4 mb-4 flex items-center justify-center">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 z-0 pointer-events-none"></div>
        
        {/* Image */}
        <img 
          alt="3D isometric office layout" 
          className="w-full h-full object-cover opacity-90 mix-blend-multiply grayscale-[20%] contrast-125 rounded-lg border border-gray-200" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXxqWsl_73x0T2MRXnI5rS1HavOv8wO_MpiF_36eHcQSaaNA2EhxKCbikNegTjIEmJhmw0bpXOqU2gaUUI9UmjH8kdAFGnFaNwAygvKUeiZbdEGAtQvtr5x3pru2_Ercd8h8DwHthY1I5bQZgMQHoLC0DADr03wgw0PVdH8vJ8RrBQxpjgROcENvSPhOWCQRdOsagEKBLPsOD3L1JvZgig9mhsos6RsFYbFcIkw_ax5zYglSoCHx9x3xu9igRRw2CKJSHOYeAR3Gg"
        />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-lg pointer-events-none mix-blend-overlay"></div>
      </div>

      <div className="flex items-center justify-between text-xs z-10 relative">
        <span className="text-gray-500 font-medium">Available capacity</span>
        <div className="flex items-center gap-3 w-1/2">
          <div className="h-1 bg-gray-200 w-full rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 w-[83%] transition-all duration-1000 ease-out"></div>
          </div>
          <span className="text-base font-medium text-gray-900">83%</span>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
        >
          <span className="sr-only">Enable launch</span>
          <span
            className={`${
              enabled ? 'translate-x-5' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>
    </div>
  );
};

export default LaunchRoadmap;
