import React from 'react';
import {
  LayoutDashboard,
  Coins,
  Users,
  Building2,
  ScrollText,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  connectionStatus: {
    ok: boolean;
    latency: number;
    checking: boolean;
  };
  onOpenDiagnostic: () => void;
  onRefreshHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  connectionStatus,
  onOpenDiagnostic,
  onRefreshHealth
}) => {
  const navItems = [
    { id: 'dashboard', label: '大盘总览', icon: LayoutDashboard },
    { id: 'shares', label: '股份管理', icon: Coins, highlight: true },
    { id: 'employees', label: '员工档案', icon: Users },
    { id: 'departments', label: '组织架构', icon: Building2 },
    { id: 'plans', label: '授予计划', icon: ScrollText },
    { id: 'reports', label: '行权报表', icon: FileSpreadsheet },
    { id: 'diagnostic', label: '连接诊断', icon: Activity }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">股权激励管理系统</span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded-full font-medium">
                  企业版
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">企业估值 · 激励配额 · 成熟行权 · 全链路风控</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Connection Status & Diagnostic Trigger */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDiagnostic}
              title="点击查看所有后端与数据连接健康诊断"
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                connectionStatus.ok
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus.ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="font-semibold">
                {connectionStatus.ok ? '所有连接正常' : '连接异常'}
              </span>
              <span className="text-slate-400 hidden sm:inline">
                ({connectionStatus.latency}ms)
              </span>
            </button>

            <button
              onClick={onRefreshHealth}
              disabled={connectionStatus.checking}
              title="刷新连接检测"
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${connectionStatus.checking ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden border-t border-slate-100 px-2 py-1.5 flex items-center justify-around bg-slate-50/70 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-xs font-medium rounded ${
                isActive ? 'text-blue-700 font-semibold' : 'text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
