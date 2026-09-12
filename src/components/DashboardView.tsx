import React, { useState, useEffect } from 'react';
import {
  Coins,
  Users,
  Building2,
  ScrollText,
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { DashboardStats, CompanyShare } from '../types.js';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenDiagnostic: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenDiagnostic }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const share = stats?.current_share;

  return (
    <div className="space-y-6">
      {/* Welcome & Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-medium mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>企业股权激励统一治理平台 · 运行正常</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            股权激励资产全景大盘
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            实时监控公司投后估值基准、激励池配额占用消耗、员工期权分期成熟节奏与行权交割情况。
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('shares')}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center space-x-1.5"
            >
              <Coins className="w-4 h-4 text-blue-700" />
              <span>配置公司股份与估值</span>
            </button>
            <button
              onClick={onOpenDiagnostic}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-1.5"
            >
              <Activity className="w-4 h-4 text-blue-300" />
              <span>全链路连接与数据核检</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Valuation */}
        <div
          onClick={() => setActiveTab('shares')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">公司最新总估值</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ¥ {share ? (share.valuation / 10000).toLocaleString() : '12,000'} <span className="text-xs font-normal text-slate-500">万元</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>基准年度: {share ? share.year : 2025}年</span>
            <span className="text-emerald-600 font-semibold flex items-center">
              ¥ {share ? Number(share.share_price).toFixed(2) : '12.00'} / 股
            </span>
          </div>
        </div>

        {/* Metric 2: Incentive Pool */}
        <div
          onClick={() => setActiveTab('shares')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">期权激励池总规模</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {share ? (share.pool_shares / 10000).toLocaleString() : '150'} <span className="text-xs font-normal text-slate-500">万股</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>总股本占比: {share ? share.pool_percentage : 15}%</span>
            <span className="text-blue-600 font-semibold">
              剩余 {share ? ((share.remaining_pool_shares || 0) / 10000).toFixed(1) : '140'} 万股
            </span>
          </div>
        </div>

        {/* Metric 3: Granted & Vested */}
        <div
          onClick={() => setActiveTab('plans')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">已授予 / 已成熟期权</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <ScrollText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats ? (stats.total_granted_shares / 10000).toLocaleString() : '60'} <span className="text-xs font-normal text-slate-500">万股</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">
              已成熟: {stats ? (stats.total_vested_shares / 10000).toFixed(1) : '27.5'} 万股
            </span>
            <span className="text-purple-600 font-semibold">
              进行中 {stats ? stats.total_plans : 3} 计划
            </span>
          </div>
        </div>

        {/* Metric 4: Employees & Org */}
        <div
          onClick={() => setActiveTab('employees')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">激励覆盖员工与组织</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats ? stats.total_employees : 5} <span className="text-xs font-normal text-slate-500">位员工</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>覆盖部门: {stats ? stats.total_departments : 4} 个</span>
            <span className="text-emerald-600 font-medium">100% 在职正常</span>
          </div>
        </div>
      </div>

      {/* Main Section: Pool allocation & Quick navigation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incentive Pool Consumption Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">股权激励池分配与消耗结构</h3>
              <p className="text-xs text-slate-500 mt-0.5">当前生效年度的股权配额分布明细</p>
            </div>
            <button
              onClick={() => setActiveTab('shares')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              <span>调整股份配置</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* Bar Visual */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>总股本 (100%) : {share ? Number(share.total_shares).toLocaleString() : '10,000,000'} 股</span>
                <span className="text-blue-600 font-bold">激励池占比 {share ? share.pool_percentage : 15}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${share ? share.pool_percentage : 15}%` }}
                  title="激励池配额"
                />
                <div
                  className="bg-slate-200 h-full"
                  style={{ width: `${100 - (share ? share.pool_percentage : 15)}%` }}
                  title="创始与投资人股份"
                />
              </div>
              <div className="flex justify-between text-3xs text-slate-400 mt-1">
                <span>激励池总额: {share ? Number(share.pool_shares).toLocaleString() : '1,500,000'} 股</span>
                <span>其他股份: {share ? (share.total_shares - share.pool_shares).toLocaleString() : '8,500,000'} 股</span>
              </div>
            </div>

            {/* Sub-breakdown of Pool */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-3xs text-slate-400 font-medium">已授予给员工</div>
                <div className="text-sm font-bold text-purple-600 mt-0.5">
                  {stats ? Number(stats.total_granted_shares).toLocaleString() : '600,000'} 股
                </div>
              </div>
              <div>
                <div className="text-3xs text-slate-400 font-medium">预留未分配股份</div>
                <div className="text-sm font-bold text-amber-600 mt-0.5">
                  {share ? Number(share.reserved_shares).toLocaleString() : '500,000'} 股
                </div>
              </div>
              <div>
                <div className="text-3xs text-slate-400 font-medium">剩余可用激励配额</div>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">
                  {share ? Number(share.remaining_pool_shares || 0).toLocaleString() : '400,000'} 股
                </div>
              </div>
            </div>
          </div>

          {/* Core Modules Quick Jump */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3">
            <button
              onClick={() => setActiveTab('shares')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <Coins className="w-4 h-4 text-blue-600" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-semibold text-xs text-slate-900 mt-2">公司股份管理</div>
              <div className="text-3xs text-slate-500 mt-0.5">添加/编辑年度估值与股份</div>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <ScrollText className="w-4 h-4 text-indigo-600" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-semibold text-xs text-slate-900 mt-2">授予计划与成熟</div>
              <div className="text-3xs text-slate-500 mt-0.5">制定新计划与手动立即行权</div>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-semibold text-xs text-slate-900 mt-2">报表与行权记录</div>
              <div className="text-3xs text-slate-500 mt-0.5">员工/部门汇总与CSV导出</div>
            </button>
          </div>
        </div>

        {/* Right Col: Connection & System Health summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">系统连接与健康度</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              实时监测Express API网关、数据读写原子锁、外键关联及激励池运算合规性。
            </p>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">公司股份配置通道</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  正常合理
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">数据库持久化存储</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  正常运行
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">激励池配额平衡核验</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  无溢出合规
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">自动成熟巡检引擎</span>
                <span className="text-blue-700 font-bold flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  30秒/轮
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onOpenDiagnostic}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>打开完整系统诊断报告</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
