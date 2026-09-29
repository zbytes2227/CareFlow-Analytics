import React from 'react';
import { 
  Activity, 
  BarChart3, 
  GitFork, 
  AlertTriangle, 
  FlaskConical,
  UserPlus,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../utils/authContext';

export type NavTab = 'dashboard' | 'patients' | 'workflows' | 'bottlenecks' | 'scenarios';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onExportData: () => void;
  onOpenNewPatientModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onExportData,
  onOpenNewPatientModal,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'patients', label: 'Patient Journeys', icon: <Activity className="w-4 h-4" /> },
    { id: 'workflows', label: 'Workflows', icon: <GitFork className="w-4 h-4" /> },
    { id: 'bottlenecks', label: 'Bottlenecks', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'scenarios', label: 'Scenario Lab', icon: <FlaskConical className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button 
          onClick={() => onSelectTab('dashboard')} 
          className="text-left group flex items-center gap-2.5 focus:outline-none shrink-0"
        >
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Hospital Workflow Analytics
            </span>
          </div>
        </button>

        {/* Zone 2: clean nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary operational actions & auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Check-in Patient</span>
            <span className="sm:hidden">Check-in</span>
          </button>

          <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="hidden sm:flex items-center gap-2 mr-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-900 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="lg:hidden flex items-center overflow-x-auto border-t border-slate-100 px-3 py-1.5 gap-1 scrollbar-none bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === item.id ? 'text-blue-700 bg-white shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
