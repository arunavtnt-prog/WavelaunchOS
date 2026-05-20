import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const TrackingCard: React.FC = () => {
  return (
    <div className="bg-primary text-white rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      
      {/* Decorative background circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-medium font-display">Tracking</h2>
          <MoreHorizontal className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
        </div>
        <p className="text-xs opacity-70 font-medium">Monthly revenue forecast</p>
      </div>
      
      <div className="relative z-10 mt-6">
        <div className="text-5xl font-light mb-1 font-display tracking-tight">5.7</div>
        <div className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Million USD</div>
      </div>
    </div>
  );
};

export default TrackingCard;
