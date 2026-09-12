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
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { CompanyShare } from '../types.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  connectionStatus: {
    ok: boolean;
    latency: number;
    checking: boolean;
  };
  activeShare?: CompanyShare | null;
  onOpenDiagnostic: () => void;
  onRefreshHealth: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  connectionStatus,
  activeShare,
  onOpenDiagnostic,
  onRefreshHealth,
  mobileOpen,
  setMobileOpen
}) => {
  const coreNavItems = [
    { id: 'dashboard', label: '大盘总览', icon: LayoutDashboard, badge: '概览' },
    { id: 'shares', label: '股份与估值', icon: Coins, badge: '基准', highlight: true },
    { id: 'employees', label: '员工档案', icon: Users },
    { id: 'departments', label: '组织架构', icon: Building2 },
    { id: 'plans', label: '授予计划', icon: ScrollText, badge: '分期' }
  ];

  const secondaryNavItems = [
    { id: 'reports', label: '行权台账报表', icon: FileSpreadsheet },
    { id: 'diagnostic', label: '链路健康诊断', icon: Activity, extra: `${connectionStatus.latency}ms` }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  股权激励系统
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                  企业版
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">企业级股权全流程治理平台</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Active Valuation Mini Card */}
          {activeShare && (
            <div
              onClick={() => handleNavClick('shares')}
              className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-blue-300 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activeShare.year} 基准年度</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                  执行中
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">投后公允估值</div>
                  <div className="text-base font-bold text-white tracking-tight">
                    ¥{(activeShare.valuation / 100000000).toFixed(2)} 亿元
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">期权激励池</div>
                  <div className="text-base font-bold text-blue-400 tracking-tight">
                    {activeShare.pool_percentage}%
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300 group-hover:text-blue-300 transition-colors">
                <span>管理估值与股份</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}

          {/* Section 1: 核心业务 */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              核心业务治理
            </div>
            <nav className="space-y-1">
              {coreNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? 'bg-blue-100/70 text-blue-700 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: 财务与风控 */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              财务审计与风控
            </div>
            <nav className="space-y-1">
              {secondaryNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.extra && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          connectionStatus.ok
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-rose-600 bg-rose-50'
                        }`}
                      >
                        {item.extra}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer / Health Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {/* Connection status indicator */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus.ok
                    ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20'
                    : 'bg-rose-500 ring-4 ring-rose-500/20'
                }`}
              />
              <div>
                <div className="text-[11px] font-bold text-slate-800">
                  {connectionStatus.ok ? '服务连接正常' : '连接异常'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  响应时延 {connectionStatus.latency} ms
                </div>
              </div>
            </div>

            <button
              onClick={onRefreshHealth}
              disabled={connectionStatus.checking}
              title="刷新连接检测"
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  connectionStatus.checking ? 'animate-spin text-blue-600' : ''
                }`}
              />
            </button>
          </div>

          {/* Quick diagnostic button */}
          <button
            onClick={onOpenDiagnostic}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors border border-blue-200/60"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>全链路连接与健康诊断</span>
          </button>
        </div>
      </aside>
    </>
  );
};
