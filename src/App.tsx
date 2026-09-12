import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { DashboardView } from './components/DashboardView.js';
import { SharesView } from './components/SharesView.js';
import { EmployeesView } from './components/EmployeesView.js';
import { DepartmentsView } from './components/DepartmentsView.js';
import { PlansView } from './components/PlansView.js';
import { ReportsView } from './components/ReportsView.js';
import { DiagnosticView } from './components/DiagnosticView.js';
import { DiagnosticModal } from './components/DiagnosticModal.js';
import { api } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('shares');
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    ok: true,
    latency: 5,
    checking: false
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await api.checkHealth();
      setConnectionStatus({
        ok: res.ok,
        latency: res.latency,
        checking: false
      });
    } catch {
      setConnectionStatus({
        ok: false,
        latency: 999,
        checking: false
      });
    }
  };

  useEffect(() => {
    checkConnection();
    // Poll health every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        onOpenDiagnostic={() => setDiagnosticOpen(true)}
        onRefreshHealth={checkConnection}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />
        )}

        {activeTab === 'shares' && (
          <SharesView
            onDataChanged={checkConnection}
            onOpenDiagnostic={() => setDiagnosticOpen(true)}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesView onDataChanged={checkConnection} />
        )}

        {activeTab === 'departments' && (
          <DepartmentsView onDataChanged={checkConnection} />
        )}

        {activeTab === 'plans' && (
          <PlansView onDataChanged={checkConnection} />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">股权激励管理系统</span>
            <span>·</span>
            <span>企业级治理平台</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-600 font-medium">● 所有服务及连接状态：正常且合理</span>
            <span>API 延时: {connectionStatus.latency}ms</span>
          </div>
        </div>
      </footer>

      {/* Global Diagnostic Modal */}
      <DiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        onDiagnosticComplete={checkConnection}
      />
    </div>
  );
}
