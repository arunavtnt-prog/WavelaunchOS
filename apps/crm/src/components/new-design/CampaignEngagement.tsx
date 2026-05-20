import React from 'react';

const CampaignEngagement: React.FC = () => {
  const timelinePoints = [
    { time: '11AM', status: 'completed' },
    { time: '11AM', status: 'completed-white' },
    { time: '12PM', status: 'completed-white' },
    { time: '1PM', status: 'current' },
    { time: '2PM', status: 'upcoming' },
    { time: '3PM', status: 'upcoming' },
    { time: '4PM', status: 'completed' },
  ];

  return (
    <div className="bg-primary rounded-2xl p-6 text-white h-full flex flex-col justify-between shadow-lg shadow-primary/20">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-lg font-medium font-display">Campaign Engagement</h2>
          <p className="text-xs opacity-80 mt-1 font-medium">Live audience usage</p>
        </div>
        <button className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white/10 transition-colors backdrop-blur-sm">
          Change
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-end justify-between mt-6 gap-6">
        <div>
          <div className="text-5xl font-light mb-1 font-display tracking-tight">47%</div>
          <div className="text-[10px] opacity-80 uppercase font-bold tracking-widest">11AM — 3PM</div>
        </div>

        <div className="flex-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="relative h-16 flex items-center justify-between px-2 min-w-[300px]">
            {/* Timeline Line */}
            <div className="absolute left-0 right-0 h-[1px] bg-white/20 top-[40%] -z-0"></div>
            
            {/* Points */}
            {timelinePoints.map((point, index) => (
              <div key={index} className="z-10 flex flex-col items-center gap-2 group cursor-pointer">
                {point.status === 'completed' && (
                  <div className="w-5 h-5 rounded-full border border-white/30 bg-primary group-hover:scale-110 transition-transform"></div>
                )}
                {point.status === 'completed-white' && (
                  <div className="w-5 h-5 rounded-full bg-white group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                )}
                {point.status === 'current' && (
                  <div className="relative w-5 h-5">
                    <div className="w-5 h-5 rounded-full bg-white relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-white/60"></div>
                  </div>
                )}
                {point.status === 'upcoming' && (
                  <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 group-hover:bg-white/40 transition-colors"></div>
                )}
                <span className="text-[9px] font-medium opacity-80">{point.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignEngagement;
