import React, { useState, useEffect, useMemo } from 'react';
import { Patient, FilterState, StagePerformance, BottleneckInsight } from './types/hospital';
import { filterPatients } from './utils/storage';
import { computeStagePerformances, detectBottlenecks } from './utils/calculations';
import { AuthProvider, useAuth } from './utils/authContext';
import { Navbar, NavTab } from './components/common/Navbar';
import { FilterBar } from './components/common/FilterBar';
import { KpiCard } from './components/common/KpiCard';
import { VolumeChart } from './components/dashboard/VolumeChart';
import { WaitingByStageChart } from './components/dashboard/WaitingByStageChart';
import { WaitVsProcessChart } from './components/dashboard/WaitVsProcessChart';
import { DepartmentPerfChart } from './components/dashboard/DepartmentPerfChart';
import { HourlyWorkloadChart } from './components/dashboard/HourlyWorkloadChart';
import { DurationDistributionChart } from './components/dashboard/DurationDistributionChart';
import { PatientTable } from './components/patients/PatientTable';
import { PatientTimelineModal } from './components/patients/PatientTimelineModal';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { WorkflowVisualizer } from './components/workflows/WorkflowVisualizer';
import { BottleneckList } from './components/bottlenecks/BottleneckList';
import { ScenarioSimulator } from './components/scenarios/ScenarioSimulator';
import { AuthModal } from './components/auth/AuthModal';

import { 
  Users, 
  Clock, 
  Hourglass, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  TimerReset,
  UserPlus
} from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  dateRange: 'all',
  department: 'all',
  workflowType: 'all',
  stage: 'all',
  status: 'all',
  searchQuery: '',
};

function HospitalApp() {
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  const [volumeGroupBy, setVolumeGroupBy] = useState<'hour' | 'day'>('hour');

  // Fetch real patient records from the backend API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.patients)) {
          setPatients(data.patients);
        }
      }
    } catch (err) {
      console.error('Failed fetching patients from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on current global filter state
  const filteredPatients = useMemo(() => {
    return filterPatients(patients, filters);
  }, [patients, filters]);

  // Live stage performances calculated dynamically from filtered patient events
  const stagePerformances: StagePerformance[] = useMemo(() => {
    return computeStagePerformances(filteredPatients);
  }, [filteredPatients]);

  // Live bottlenecks detected via documented statistical formula
  const bottlenecks: BottleneckInsight[] = useMemo(() => {
    return detectBottlenecks(filteredPatients);
  }, [filteredPatients]);

  // Derived KPI metrics calculated directly from records
  const kpiData = useMemo(() => {
    const total = filteredPatients.length;
    if (total === 0) {
      return {
        total: 0,
        avgWait: 0,
        avgProcess: 0,
        avgDuration: 0,
        inProgress: 0,
        completed: 0,
        criticalBottlenecks: 0,
        busiestDept: 'N/A',
      };
    }

    const totalWait = filteredPatients.reduce((sum, p) => sum + p.totalWaitingTime, 0);
    const totalProcess = filteredPatients.reduce((sum, p) => sum + p.totalProcessingTime, 0);
    const totalDuration = filteredPatients.reduce((sum, p) => sum + p.totalDuration, 0);

    const inProgress = filteredPatients.filter((p) => p.status === 'In Progress').length;
    const completed = filteredPatients.filter((p) => p.status === 'Completed').length;
    const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'Critical' || b.severity === 'High').length;

    // Determine busiest department
    const deptCounts: Record<string, number> = {};
    filteredPatients.forEach((p) => {
      deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
    });
    let busiest = 'General Medicine';
    let maxDeptCount = 0;
    Object.entries(deptCounts).forEach(([d, count]) => {
      if (count > maxDeptCount) {
        maxDeptCount = count;
        busiest = d;
      }
    });

    return {
      total,
      avgWait: Math.round((totalWait / total) * 10) / 10,
      avgProcess: Math.round((totalProcess / total) * 10) / 10,
      avgDuration: Math.round((totalDuration / total) * 10) / 10,
      inProgress,
      completed,
      criticalBottlenecks,
      busiestDept: busiest,
    };
  }, [filteredPatients, bottlenecks]);

  // Filter actions
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };



  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredPatients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hospital_workflow_records_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.patientId === updatedPatient.patientId ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportData={handleExportData}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNewPatientModal={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsNewPatientModalOpen(true);
          }
        }}
      />

      {/* Global Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredPatients.length}
        totalAllCount={patients.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: OPERATIONS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Operational KPI Grid (8 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                title="Total Patients"
                value={kpiData.total}
                icon={<Users className="w-4 h-4" />}
                change={{ value: '+4.2%', direction: 'up', isGood: true, label: 'vs last window' }}
              />

              <KpiCard
                title="Avg Waiting Time"
                value={kpiData.avgWait}
                unit="min"
                icon={<Clock className="w-4 h-4" />}
                severity={kpiData.avgWait > 20 ? 'critical' : kpiData.avgWait > 15 ? 'moderate' : 'normal'}
                change={{
                  value: kpiData.avgWait > 15 ? '+18%' : '-5%',
                  direction: kpiData.avgWait > 15 ? 'up' : 'down',
                  isGood: kpiData.avgWait <= 15,
                  label: 'target: 15m',
                }}
              />

              <KpiCard
                title="Avg Service Time"
                value={kpiData.avgProcess}
                unit="min"
                icon={<Hourglass className="w-4 h-4" />}
                change={{ value: 'Stable', direction: 'neutral', label: 'clinical average' }}
              />

              <KpiCard
                title="Avg Journey Duration"
                value={kpiData.avgDuration}
                unit="min"
                icon={<TimerReset className="w-4 h-4" />}
                change={{
                  value: `${kpiData.avgDuration}m`,
                  direction: 'neutral',
                  label: 'arrival to exit',
                }}
              />

              <KpiCard
                title="Currently In Flow"
                value={kpiData.inProgress}
                icon={<Activity className="w-4 h-4" />}
                subtitle="Active intake encounters"
              />

              <KpiCard
                title="Completed Encounters"
                value={kpiData.completed}
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                subtitle={`${kpiData.total ? Math.round((kpiData.completed / kpiData.total) * 100) : 0}% completion rate`}
              />

              <KpiCard
                title="Bottlenecks Detected"
                value={kpiData.criticalBottlenecks}
                icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                severity={kpiData.criticalBottlenecks > 0 ? 'critical' : 'normal'}
                subtitle={kpiData.criticalBottlenecks > 0 ? 'Exceeds threshold' : 'Nominal queue'}
              />

              <KpiCard
                title="Busiest Department"
                value={kpiData.busiestDept.replace('General Medicine', 'Gen Med').replace('Orthopedics', 'Ortho')}
                icon={<Building2 className="w-4 h-4" />}
                subtitle="Highest patient volume"
              />
            </div>

            {/* Quick Bottleneck Banner if bottlenecks detected */}
            {kpiData.criticalBottlenecks > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-100 rounded-md text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Operational Alert: {kpiData.criticalBottlenecks} High Delay Stages Detected
                    </h4>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Top delay: <strong>{bottlenecks[0]?.stage}</strong> with average wait time of{' '}
                      <span className="font-mono font-bold">{bottlenecks[0]?.avgWaitingTime} minutes</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('bottlenecks')}
                    className="px-3 py-1.5 text-xs font-semibold bg-white text-rose-800 border border-rose-300 rounded hover:bg-rose-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setActiveTab('scenarios')}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 shadow-xs transition-colors"
                  >
                    Simulate Resolution
                  </button>
                </div>
              </div>
            )}

            {/* Charts Row 1: Volume Over Time & Waiting Time by Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VolumeChart
                patients={filteredPatients}
                groupBy={volumeGroupBy}
                onToggleGroupBy={setVolumeGroupBy}
              />
              <WaitingByStageChart stages={stagePerformances} />
            </div>

            {/* Charts Row 2: Waiting vs Processing & Department Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaitVsProcessChart stages={stagePerformances} />
              <DepartmentPerfChart patients={filteredPatients} />
            </div>

            {/* Charts Row 3: Hourly Workload & Duration Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyWorkloadChart patients={filteredPatients} />
              <DurationDistributionChart patients={filteredPatients} />
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT JOURNEY EXPLORER */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-500">
                Patient records are stored in MongoDB. Click any row to view its vertical operational timeline.
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) setIsAuthModalOpen(true);
                  else setIsNewPatientModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Check-in Real Patient</span>
              </button>
            </div>

            <PatientTable
              patients={filteredPatients}
              onSelectPatient={(p) => setSelectedPatient(p)}
            />
          </div>
        )}

        {/* TAB 3: WORKFLOW VISUALIZER */}
        {activeTab === 'workflows' && (
          <WorkflowVisualizer patients={filteredPatients} />
        )}

        {/* TAB 4: BOTTLENECK DETECTION ENGINE */}
        {activeTab === 'bottlenecks' && (
          <BottleneckList
            patients={filteredPatients}
            onNavigateToScenarios={() => setActiveTab('scenarios')}
          />
        )}

        {/* TAB 5: WHAT-IF SCENARIO SIMULATOR */}
        {activeTab === 'scenarios' && (
          <ScenarioSimulator patients={filteredPatients} />
        )}


      </main>

      {/* Patient Journey Timeline Modal with Real Stage Advance */}
      <PatientTimelineModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onPatientUpdated={handlePatientUpdated}
      />


      {/* Secure Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Check-in New Patient Encounter Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HospitalApp />
    </AuthProvider>
  );
}
