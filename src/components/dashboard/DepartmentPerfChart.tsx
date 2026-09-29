import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Patient } from '../../types/hospital';

interface DepartmentPerfChartProps {
  patients: Patient[];
}

export const DepartmentPerfChart: React.FC<DepartmentPerfChartProps> = ({ patients }) => {
  const [metric, setMetric] = React.useState<'wait' | 'volume' | 'duration'>('wait');

  const data = React.useMemo(() => {
    const deptMap: Record<string, { waits: number[]; durations: number[]; count: number }> = {};

    patients.forEach((p) => {
      const dept = p.department;
      if (!deptMap[dept]) {
        deptMap[dept] = { waits: [], durations: [], count: 0 };
      }
      deptMap[dept].waits.push(p.totalWaitingTime);
      deptMap[dept].durations.push(p.totalDuration);
      deptMap[dept].count += 1;
    });

    return Object.entries(deptMap).map(([dept, obj]) => {
      const avgWait = obj.waits.length
        ? Math.round((obj.waits.reduce((s, w) => s + w, 0) / obj.waits.length) * 10) / 10
        : 0;
      const avgDuration = obj.durations.length
        ? Math.round((obj.durations.reduce((s, d) => s + d, 0) / obj.durations.length) * 10) / 10
        : 0;

      return {
        department: dept.replace('General Medicine', 'Gen Med').replace('Orthopedics', 'Ortho').replace('Pediatrics', 'Peds'),
        fullDepartment: dept,
        volume: obj.count,
        avgWait,
        avgDuration,
      };
    });
  }, [patients]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Department Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational comparison across clinical departments
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
          <button
            onClick={() => setMetric('wait')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              metric === 'wait' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avg Wait
          </button>
          <button
            onClick={() => setMetric('duration')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              metric === 'duration' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Duration
          </button>
          <button
            onClick={() => setMetric('volume')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              metric === 'volume' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient Volume
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="department"
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
              unit={metric === 'volume' ? '' : 'm'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
              }}
              formatter={(val: any) => [
                metric === 'volume' ? `${val} patients` : `${val} min`,
                metric === 'volume'
                  ? 'Total Encounters'
                  : metric === 'wait'
                  ? 'Average Waiting Time'
                  : 'Average Journey Duration',
              ]}
              labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDepartment || ''}
            />
            <Bar
              dataKey={metric === 'wait' ? 'avgWait' : metric === 'duration' ? 'avgDuration' : 'volume'}
              fill={metric === 'wait' ? '#f43f5e' : metric === 'duration' ? '#6366f1' : '#0284c7'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
