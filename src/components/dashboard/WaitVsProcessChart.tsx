import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { StagePerformance } from '../../types/hospital';

interface WaitVsProcessChartProps {
  stages: StagePerformance[];
}

export const WaitVsProcessChart: React.FC<WaitVsProcessChartProps> = ({ stages }) => {
  const data = React.useMemo(() => {
    return [...stages]
      .slice(0, 7)
      .map((s) => ({
        stage: s.stage.split(' ')[0] + ' ' + (s.stage.split(' ')[1] || ''),
        fullStage: s.stage,
        avgWait: s.avgWaitingTime,
        avgProcess: s.avgProcessingTime,
        ratio: s.avgProcessingTime > 0 ? Math.round((s.avgWaitingTime / s.avgProcessingTime) * 10) / 10 : 0,
      }));
  }, [stages]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Waiting Time vs Service Time</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Queue duration compared to active clinical/administrative service
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              angle={-10}
              textAnchor="end"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              unit="m"
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
                `${val} min`,
                name === 'avgWait' ? 'Wait Time (Idle)' : 'Service Time (Active)',
              ]}
              labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullStage || ''}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              formatter={(value) => (value === 'avgWait' ? 'Waiting Time' : 'Processing Time')}
            />
            <Bar dataKey="avgWait" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="avgProcess" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
