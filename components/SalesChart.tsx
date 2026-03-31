'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

export default function SalesChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="glass-card p-6 h-[400px] w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold text-lg tracking-wide uppercase">Sales Performance</h3>
        <div className="text-xs text-gray-500 font-mono tracking-tighter">LIVE FEED / REAL-TIME DATA</div>
      </div>
      
      <div className="w-full h-full pb-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF41" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00FF41" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis 
              dataKey="time" 
              stroke="#4b5563" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
              itemStyle={{ color: '#00FF41' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#00FF41" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
