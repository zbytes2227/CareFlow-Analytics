import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { StagePerformance } from '../../types/hospital';

interface WaitingByStageChartProps {
  stages: StagePerformance[];
}

export const WaitingByStageChart: React.FC<WaitingByStageChartProps> = ({ stages }) => {
  // Sort stages by highest waiting time
  const data = React.useMemo(() => {
    return [...stages]
      .sort((a, b) => b.avgWaitingTime - a.avgWaitingTime)
      .slice(0, 8)
      .map((s) => ({
        stage: s.stage.replace(' & Desk Check-in', '').replace(' & Insurance Clearance', '').replace(' Dispensation', ''),
        fullStage: s.stage,
        avgWait: s.avgWaitingTime,
        medianWait: s.medianWaitingTime,
        p90Wait: s.p90WaitingTime,
        benchmark: s.benchmarkWaitTime,
        severity: s.severity,
      }));
  }, [stages]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Average Waiting Time by Stage</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mean delay before service commencement (Minutes)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
            <span>High Delay (&ge;1.6x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
            <span>Nominal</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              angle={-15}
              textAnchor="end"
              interval={0}
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
              formatter={(val: any, _name: any, item: any) => [
                <div key="wait-tip" className="space-y-1">
                  <div>Average Wait: <strong className="font-mono">{val} min</strong></div>
                  <div>Median Wait: <span className="font-mono">{item.payload.medianWait} min</span></div>
                  <div>90th Percentile: <span className="font-mono">{item.payload.p90Wait} min</span></div>
                  <div>Target Benchmark: <span className="font-mono">{item.payload.benchmark} min</span></div>
                </div>,
                item.payload.fullStage,
              ]}
            />
            <ReferenceLine y={15} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Target 15m', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
            <Bar dataKey="avgWait" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                let fill = '#3b82f6';
                if (entry.severity === 'high') fill = '#f43f5e';
                else if (entry.severity === 'moderate') fill = '#f59e0b';
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
