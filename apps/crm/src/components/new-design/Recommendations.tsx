import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const Recommendations: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-medium font-display">Recommendations</h2>
        <MoreHorizontal className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" />
      </div>
      <p className="text-xs text-gray-500 mb-6 font-medium">Personalized tips for optimizing reach</p>

      {/* Blue Card */}
      <div className="bg-primary text-white p-5 rounded-xl mb-3 relative group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer">
        <p className="text-xs font-medium leading-relaxed mb-8 pr-2">
          Launch day ahead! We recommend maximizing social engagement between 9am - 12pm.
        </p>
        <span className="text-[10px] opacity-80 uppercase tracking-wide font-bold">Today recommendation</span>
      </div>

      {/* Gray Card */}
      <div className="bg-gray-200 p-5 rounded-xl mt-auto transition-colors hover:bg-gray-300 cursor-pointer">
        <p className="text-xs font-medium text-gray-700 leading-relaxed mb-4 pr-2">
          Schedule content after 8 PM to reduce audience fatigue.
        </p>
        <div className="flex justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          <span>Analysis</span>
          <span>5 min</span>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
