import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Patient } from '../../types/hospital';

interface VolumeChartProps {
  patients: Patient[];
  groupBy: 'hour' | 'day';
  onToggleGroupBy: (mode: 'hour' | 'day') => void;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({
  patients,
  groupBy,
  onToggleGroupBy,
}) => {
  // Aggregate data by hour or by day
  const data = React.useMemo(() => {
    if (groupBy === 'hour') {
      const hoursMap: Record<number, number> = {};
      for (let h = 7; h <= 20; h++) hoursMap[h] = 0;

      patients.forEach((p) => {
        if (p.firstArrivalTime) {
          const h = new Date(p.firstArrivalTime).getHours();
          if (h >= 7 && h <= 20) {
            hoursMap[h] = (hoursMap[h] || 0) + 1;
          }
        }
      });

      return Object.entries(hoursMap).map(([h, count]) => ({
        label: `${String(h).padStart(2, '0')}:00`,
        patients: count,
      }));
    } else {
      // By day
      const dayMap: Record<string, number> = {};
      patients.forEach((p) => {
        const d = p.visitDate;
        dayMap[d] = (dayMap[d] || 0) + 1;
      });

      return Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          label: date.slice(5), // MM-DD
          patients: count,
        }));
    }
  }, [patients, groupBy]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Patient Volume Over Time</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Arrival volume trend showing clinical intake density
          </p>
        </div>

        {/* Interactive toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
          <button
            onClick={() => onToggleGroupBy('hour')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              groupBy === 'hour' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Hour
          </button>
          <button
            onClick={() => onToggleGroupBy('day')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              groupBy === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Day
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val} patients`, 'Intake Volume']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="patients"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
