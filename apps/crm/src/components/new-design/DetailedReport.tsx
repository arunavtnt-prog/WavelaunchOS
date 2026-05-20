import React from 'react';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { BarChart, Bar, LabelList, ResponsiveContainer, Cell, XAxis } from 'recharts';

const data = [
  { name: 'Mon', value: 276, trend: 'up' },
  { name: 'Tue', value: 282, trend: 'up' },
  { name: 'Wed', value: 297, trend: 'up', active: true },
  { name: 'Thu', value: 269, trend: 'down' },
  { name: 'Fri', value: 274, trend: 'up' },
  { name: 'Sat', value: 175, trend: 'down' },
  { name: 'Sun', value: 138, trend: 'down' },
];

const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const isSmallBar = height < 30; // Check if bar is too small for internal text
  
  return (
    <g>
      <text 
        x={x + width / 2} 
        y={y + height - 8} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="bottom"
        className="text-[10px] font-medium"
        style={{ fontSize: '10px' }}
      >
        {value}
      </text>
    </g>
  );
};

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const dayData = data.find(d => d.name === payload.value);
  const isUp = dayData?.trend === 'up';

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} dy={0} textAnchor="middle" fill="#666" className="text-[10px] font-medium">
        {payload.value}
      </text>
      <g transform="translate(6, 4)">
          {/* Using text for arrows to keep it simple within SVG context */}
          <text 
            fontSize="8" 
            fill={isUp ? "#999" : "#999"} 
            x={2}
            y={isUp ? 4 : 4}
          >
           {isUp ? '↑' : '↓'}
          </text>
      </g>
      <text x={0} y={28} textAnchor="middle" fill="#999" className="text-[8px]">
        {dayData?.active ? '' : 'kWh'}
      </text>
      {dayData?.active && (
         <rect x="-10" y="20" width="20" height="10" rx="2" fill="#1713ed" />
      )}
      {dayData?.active && (
         <text x={0} y={27} textAnchor="middle" fill="#fff" className="text-[8px]">
            kWh
         </text>
      )}
    </g>
  );
};

const DetailedReport: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-medium font-display">Detailed report</h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">Graphs of engagement metrics</p>
        </div>
        <button className="px-3 py-1 rounded-full border border-gray-300 text-xs font-medium flex items-center gap-1 hover:bg-gray-200 transition-colors bg-white">
          Week <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-[160px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={<CustomXAxisTick />}
              interval={0}
              height={50}
            />
            <Bar dataKey="value" radius={[2, 2, 2, 2]}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? '#1713ed' : '#2A2A2A'} 
                    className="transition-colors duration-300 hover:opacity-80 cursor-pointer"
                />
              ))}
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DetailedReport;
