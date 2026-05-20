import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Components
import ContentPerformance from './ContentPerformance';
import LaunchRoadmap from './LaunchRoadmap';
import Recommendations from './Recommendations';
import TrackingCard from './TrackingCard';
import DetailedReport from './DetailedReport';
import CampaignEngagement from './CampaignEngagement';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-8">
        <h1 className="text-3xl md:text-4xl font-normal tracking-tight font-display mb-4 sm:mb-0">Overview</h1>
        <div className="flex gap-8 text-sm sm:text-base font-light text-gray-400">
          <div className="flex items-center group cursor-default">
            <span className="text-xl sm:text-2xl text-black font-normal mr-2 group-hover:text-primary transition-colors">
              {format(currentTime, 'h:mm a')}
            </span>
            <span className="text-xs uppercase tracking-widest pt-1 font-medium">Time</span>
          </div>
          <div className="flex items-center group cursor-default">
            <span className="text-xl sm:text-2xl text-black font-normal group-hover:text-primary transition-colors">
              {format(currentTime, 'd MMMM')}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-12 lg:col-span-6">
          <ContentPerformance />
        </div>
        
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <LaunchRoadmap />
        </div>
        
        <div className="col-span-1 md:col-span-6 lg:col-span-3">
          <Recommendations />
        </div>

        {/* Row 2 */}
        <div className="col-span-1 md:col-span-6 lg:col-span-2">
          <TrackingCard />
        </div>

        <div className="col-span-1 md:col-span-6 lg:col-span-4">
          <DetailedReport />
        </div>

        <div className="col-span-1 md:col-span-12 lg:col-span-6">
          <CampaignEngagement />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;