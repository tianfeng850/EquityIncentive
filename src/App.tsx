import React, { useState, useEffect } from 'react';
import { Menu, Activity, RefreshCw, ChevronRight, Coins, ShieldCheck, ExternalLink } from 'lucide-react';
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { SharesView } from './components/SharesView.js';
import { EmployeesView } from './components/EmployeesView.js';
import { DepartmentsView } from './components/DepartmentsView.js';
import { PlansView } from './components/PlansView.js';
import { ReportsView } from './components/ReportsView.js';
import { DiagnosticView } from './components/DiagnosticView.js';
import { DiagnosticModal } from './components/DiagnosticModal.js';
import { api } from './services/api.js';
import { CompanyShare } from './types.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('shares');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [activeShare, setActiveShare] = useState<CompanyShare | null>(null);

  // Cross-module navigation states
  const [planInitialEmp, setPlanInitialEmp] = useState<string | null>(null);
  const [planInitialYear, setPlanInitialYear] = useState<number | null>(null);
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState<string | null>(null);

  const [connectionStatus, setConnectionStatus] = useState({
    ok: true,
    latency: 5,
    checking: false
  });

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, checking: true }));
    try {
      const [healthRes, sharesRes] = await Promise.allSettled([
        api.checkHealth(),
        api.getShares()
      ]);

      if (healthRes.status === 'fulfilled') {
        setConnectionStatus({
          ok: healthRes.value.ok,
          latency: healthRes.value.latency,
          checking: false
        });
      } else {
        setConnectionStatus({ ok: false, latency: 999, checking: false });
      }

      if (sharesRes.status === 'fulfilled' && sharesRes.value.success && sharesRes.value.data) {
        const found = sharesRes.value.data.find(s => s.status === 'active') || sharesRes.value.data[0] || null;
        setActiveShare(found);
      }
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

  // Handlers for cross-module business flows
  const handleNavigateToPlansFromEmployee = (employeeId: string) => {
    setPlanInitialEmp(employeeId);
    setPlanInitialYear(null);
    setActiveTab('plans');
  };

  const handleNavigateToPlansFromShare = (year?: number) => {
    setPlanInitialYear(year || activeShare?.year || 2025);
    setPlanInitialEmp(null);
    setActiveTab('plans');
  };

  const handleNavigateToEmployeesFromDept = (deptId: string) => {
    setEmployeeDeptFilter(deptId);
    setActiveTab('employees');
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: '数据大盘总览', subtitle: '全景展示企业股权池水库、部门配额及在职成熟度' },
    shares: { title: '公司股份与估值基准', subtitle: '维护每轮次/年度公司总估值、总股本及期权池配额' },
    employees: { title: '员工激励档案库', subtitle: '管理核心骨干身份、所属部门与累计行权成熟档案' },
    departments: { title: '组织架构与部门管理', subtitle: '维护内部组织单元、编制负责人及部门期权配额分布' },
    plans: { title: '期权授予计划与成熟', subtitle: '制定个性化期权授予方案、分期成熟时间表与交割' },
    reports: { title: '期权行权台账报表', subtitle: '多维度行权记录明细、财务结算单据及导出审计表' },
    diagnostic: { title: '系统连接与健康诊断', subtitle: '全链路数据库、网络路由、配额算法与系统环境综合巡检' }
  };

  const currentPage = pageTitles[activeTab] || { title: '股权激励治理系统', subtitle: '企业级股权治理与行权平台' };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex">
      {/* LEFT COLUMN: Fixed / Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        activeShare={activeShare}
        onOpenDiagnostic={() => setDiagnosticOpen(true)}
        onRefreshHealth={checkConnection}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* RIGHT COLUMN: Header + Main Page Content + Footer */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-200">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="打开侧边导航"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Title */}
            <div className="min-w-0">
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <span>股权系统</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-600 font-medium truncate">{currentPage.title}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {currentPage.title}
              </h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Active Benchmark Pill */}
            {activeShare && (
              <div
                onClick={() => setActiveTab('shares')}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-xs text-slate-700 cursor-pointer transition-colors border border-slate-200/80"
                title="点击管理当前估值基准"
              >
                <Coins className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-900">{activeShare.year}基准:</span>
                <span className="font-mono font-medium">¥{(activeShare.valuation / 100000000).toFixed(2)}亿</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-600 font-bold font-mono">池{activeShare.pool_percentage}%</span>
              </div>
            )}

            {/* Connection Status Badge */}
            <div
              onClick={() => setDiagnosticOpen(true)}
              className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus.ok
                    ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20'
                    : 'bg-rose-500 ring-2 ring-rose-500/20'
                }`}
              />
              <span className="hidden sm:inline text-slate-600">
                {connectionStatus.ok ? '链路正常' : '连接异常'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {connectionStatus.latency}ms
              </span>
            </div>

            {/* Diagnostic Button */}
            <button
              type="button"
              onClick={() => setDiagnosticOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">全链路诊断</span>
            </button>
          </div>
        </header>

        {/* Main Work Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
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
                onNavigateToPlans={handleNavigateToPlansFromShare}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeesView
                onDataChanged={checkConnection}
                initialDepartmentFilter={employeeDeptFilter}
                onNavigateToPlans={handleNavigateToPlansFromEmployee}
              />
            )}

            {activeTab === 'departments' && (
              <DepartmentsView
                onDataChanged={checkConnection}
                onNavigateToEmployees={handleNavigateToEmployeesFromDept}
              />
            )}

            {activeTab === 'plans' && (
              <PlansView
                onDataChanged={checkConnection}
                initialEmployeeId={planInitialEmp}
                initialYear={planInitialYear}
                onNavigateToReports={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView />
            )}

            {activeTab === 'diagnostic' && (
              <DiagnosticView />
            )}
          </div>
        </main>

        {/* Compact Right Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">企业级股权激励合规治理系统</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">左右联动架构 v2.0</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="text-emerald-600 font-medium">● 核心业务链路流畅运作中</span>
              <span>·</span>
              <button
                onClick={() => setDiagnosticOpen(true)}
                className="hover:text-blue-600 underline"
              >
                巡检链路
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Full-chain Diagnostic Modal */}
      <DiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
        onDiagnosticComplete={checkConnection}
      />
    </div>
  );
}
