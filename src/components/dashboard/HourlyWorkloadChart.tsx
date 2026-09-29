import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Patient } from '../../types/hospital';

interface HourlyWorkloadChartProps {
  patients: Patient[];
}

export const HourlyWorkloadChart: React.FC<HourlyWorkloadChartProps> = ({ patients }) => {
  const data = React.useMemo(() => {
    const hourlyCounts: Record<number, { arrivals: number; avgWait: number; waits: number[] }> = {};
    for (let h = 7; h <= 20; h++) {
      hourlyCounts[h] = { arrivals: 0, avgWait: 0, waits: [] };
    }

    patients.forEach((p) => {
      if (p.firstArrivalTime) {
        const hour = new Date(p.firstArrivalTime).getHours();
        if (hourlyCounts[hour]) {
          hourlyCounts[hour].arrivals += 1;
          hourlyCounts[hour].waits.push(p.totalWaitingTime);
        }
      }
    });

    return Object.entries(hourlyCounts).map(([hStr, obj]) => {
      const h = Number(hStr);
      const avgW = obj.waits.length
        ? Math.round((obj.waits.reduce((s, w) => s + w, 0) / obj.waits.length) * 10) / 10
        : 0;

      const formattedHour = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
      return {
        hour: formattedHour,
        rawHour: h,
        arrivals: obj.arrivals,
        avgWait: avgW,
        isPeak: h >= 8 && h <= 11,
      };
    });
  }, [patients]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Hourly Workload &amp; Arrival Surge</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurnal distribution highlighting the 08:00–11:00 AM surge window
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
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
              formatter={(val: any, name: any, item: any) => [
                <div key="hourly-tip">
                  <div>Patient Arrivals: <strong className="font-mono">{val}</strong></div>
                  <div>Average Wait for Cohort: <span className="font-mono">{item.payload.avgWait} min</span></div>
                  {item.payload.isPeak && (
                    <div className="text-amber-400 text-xs mt-1">High Demand Peak Window</div>
                  )}
                </div>,
                'Intake',
              ]}
            />
            <Bar dataKey="arrivals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
