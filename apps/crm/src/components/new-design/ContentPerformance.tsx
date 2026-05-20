import React from 'react';
import { MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';

interface BarData {
  height: string;
  color: string;
}

const ContentPerformance: React.FC = () => {
  // Simulating the visual bars from the design
  // Views bars
  const viewBars: BarData[] = [
    { height: '30%', color: 'bg-gray-300' },
    { height: '50%', color: 'bg-gray-300' },
    { height: '40%', color: 'bg-gray-300' },
    { height: '60%', color: 'bg-gray-300' },
    { height: '80%', color: 'bg-gray-300' },
    { height: '100%', color: 'bg-white border border-gray-100' },
    { height: '90%', color: 'bg-white border border-gray-100' },
  ];

  // Shares bars
  const shareBars: BarData[] = [
    { height: '20%', color: 'bg-gray-300' },
    { height: '30%', color: 'bg-gray-300' },
    { height: '45%', color: 'bg-gray-300' },
    { height: '40%', color: 'bg-gray-300' },
    { height: '60%', color: 'bg-white border border-gray-100' },
    { height: '55%', color: 'bg-white border border-gray-100' },
    { height: '40%', color: 'bg-gray-300' },
  ];

  // Likes bars
  const likeBars: BarData[] = [
    { height: '40%', color: 'bg-gray-300' },
    { height: '50%', color: 'bg-gray-300' },
    { height: '60%', color: 'bg-gray-300' },
    { height: '45%', color: 'bg-gray-300' },
    { height: '85%', color: 'bg-white border border-gray-100' },
    { height: '95%', color: 'bg-white border border-gray-100' },
    { height: '75%', color: 'bg-white border border-gray-100' },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-lg font-medium font-display">Content Performance</h2>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium hover:bg-gray-200 transition-colors">
          Change module
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Views Column */}
        <div className="flex flex-col justify-end">
          <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              Views <ArrowUp className="w-3 h-3" />
            </span>
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-black" />
          </div>
          
          <div className="h-24 flex items-end justify-between gap-1 mb-4">
            {viewBars.map((bar, i) => (
              <div 
                key={i} 
                className={`w-1.5 rounded-sm transition-all duration-500 ${bar.color} hover:bg-primary`}
                style={{ height: bar.height }}
              />
            ))}
          </div>

          <div>
            <div className="text-3xl font-light text-black tracking-tight">
              52<span className="text-gray-400 mx-1">-</span>71
            </div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-medium tracking-wide">k Views per month</div>
          </div>
        </div>

        {/* Shares Column */}
        <div className="flex flex-col justify-end">
          <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              Shares <ArrowDown className="w-3 h-3" />
            </span>
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-black" />
          </div>
          
          <div className="h-24 flex items-end justify-between gap-1 mb-4 opacity-70">
            {shareBars.map((bar, i) => (
              <div 
                key={i} 
                className={`w-1.5 rounded-sm transition-all duration-500 ${bar.color} hover:bg-primary`}
                style={{ height: bar.height }}
              />
            ))}
          </div>

          <div>
            <div className="text-3xl font-light text-black tracking-tight">
              29<span className="text-gray-400 mx-1">-</span>37
            </div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-medium tracking-wide">k Shares per month</div>
          </div>
        </div>

        {/* Likes Column */}
        <div className="flex flex-col justify-end">
          <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              Likes <ArrowDown className="w-3 h-3" />
            </span>
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-black" />
          </div>
          
          <div className="h-24 flex items-end justify-between gap-1 mb-4">
            {likeBars.map((bar, i) => (
              <div 
                key={i} 
                className={`w-1.5 rounded-sm transition-all duration-500 ${bar.color} hover:bg-primary`}
                style={{ height: bar.height }}
              />
            ))}
          </div>

          <div>
            <div className="text-3xl font-light text-black tracking-tight">
              49<span className="text-gray-400 mx-1">-</span>85
            </div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase font-medium tracking-wide">k Likes per month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPerformance;
