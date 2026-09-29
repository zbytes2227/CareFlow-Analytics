import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Patient } from '../../types/hospital';

interface DurationDistributionChartProps {
  patients: Patient[];
}

export const DurationDistributionChart: React.FC<DurationDistributionChartProps> = ({ patients }) => {
  const data = React.useMemo(() => {
    const buckets = [
      { range: '< 30m', min: 0, max: 30, count: 0 },
      { range: '30–60m', min: 30, max: 60, count: 0 },
      { range: '60–90m', min: 60, max: 90, count: 0 },
      { range: '90–120m', min: 90, max: 120, count: 0 },
      { range: '120–180m', min: 120, max: 180, count: 0 },
      { range: '> 180m', min: 180, max: Infinity, count: 0 },
    ];

    patients.forEach((p) => {
      const dur = p.totalDuration;
      for (const b of buckets) {
        if (dur >= b.min && dur < b.max) {
          b.count += 1;
          break;
        }
      }
    });

    return buckets.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: patients.length ? Math.round((b.count / patients.length) * 100) : 0,
    }));
  }, [patients]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Total Patient Journey Duration Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Frequency histogram of complete visit durations from arrival to exit
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
              }}
              formatter={(val: any, _name: any, item: any) => [
                `${val} patients (${item.payload.percentage}% of cohort)`,
                'Volume',
              ]}
              labelFormatter={(label) => `Duration Bracket: ${label}`}
            />
            <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
