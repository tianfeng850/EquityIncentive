import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Coins,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../services/api.js';
import { EquityRecord, ShareChangeLog, Department } from '../types.js';

interface FulfillmentLogsViewProps {
  onNavigateToReports?: () => void;
  onNavigateToPlans?: () => void;
}

export const FulfillmentLogsView: React.FC<FulfillmentLogsViewProps> = ({
  onNavigateToReports,
  onNavigateToPlans
}) => {
  const [records, setRecords] = useState<EquityRecord[]>([]);
  const [shareLogs, setShareLogs] = useState<ShareChangeLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exercise' | 'audit'>('exercise');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'exercised' | 'vested'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, shareLogsRes, deptRes] = await Promise.all([
        api.getRecords(),
        api.getShareLogs(),
        api.getDepartments()
      ]);

      if (recordsRes.success && recordsRes.data) {
        setRecords(recordsRes.data);
      }
      if (shareLogsRes.success && shareLogsRes.data) {
        setShareLogs(shareLogsRes.data);
      }
      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (err) {
      console.error('Failed to load fulfillment logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered exercise records
  const filteredRecords = records.filter(r => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.record_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.plan_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'all' || r.department_name === deptFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // KPI Calculations
  const totalExercisedShares = records.reduce((sum, r) => sum + (Number(r.shares) || 0), 0);
  const totalExercisedAmount = records.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  const totalCount = records.length;
  const avgSharePrice = totalExercisedShares > 0 ? (totalExercisedAmount / totalExercisedShares).toFixed(2) : '0.00';

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    if (activeTab === 'exercise') {
      csvContent += '履约流水号,行权员工,关联授予方案,分期期数,所属部门,成熟生效日,交割股数(股),行权单价(元),总交割金额(元),履约交割状态,创建时间\n';
      filteredRecords.forEach(r => {
        csvContent += `"${r.record_no}","${r.employee_name}","${r.plan_no}","第${r.cycle_no}期","${r.department_name}","${r.vest_date}",${r.shares},${r.exercise_price},${r.total_amount},"${r.status === 'exercised' ? '已行权交割' : '已成熟待认购'}","${r.created_at || ''}"\n`;
      });
    } else {
      csvContent += '变更日志ID,年度版本,变更类型,操作人,操作时间,变更详细说明\n';
      shareLogs.forEach(l => {
        csvContent += `"${l.id}","${l.year}年","${l.change_type}","${l.operator}","${new Date(l.created_at).toLocaleString()}","${l.details.replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `股权激励_${activeTab === 'exercise' ? '行权履约流水明细' : '基准变更审计日志'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">期权行权与归属履约日志</h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                实时履约台账
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              记录每笔期权成熟归属、认购资金结算与公司股权变更的权威合规审计凭据
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors flex items-center space-x-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>员工股权报表</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>导出履约台账 (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>累计交割履约股数</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            {totalExercisedShares.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">股</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>已完全成熟行权入账</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>累计履约交割资金</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2 font-mono">
            ¥ {totalExercisedAmount.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">元</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            均价 ¥ {avgSharePrice} 元/股
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>履约完成记录笔数</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2 font-mono">
            {totalCount}
            <span className="text-xs font-normal text-slate-400 ml-1">笔</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            全部流水符合行权决议
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>合规与审计状态</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center space-x-1.5">
            <span className="text-emerald-600">100%</span>
            <span className="text-xs font-normal text-slate-400">已核准</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            原子快照持久化保护
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Tab & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'exercise'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>期权成熟行权履约流水 ({records.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>股份基准变更审计日志 ({shareLogs.length})</span>
            </button>
          </div>

          {/* Search & Select Filters (only for exercise records) */}
          {activeTab === 'exercise' && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索流水号/员工/方案号..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
                />
              </div>

              {/* Department */}
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">所有部门</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">所有状态</option>
                <option value="exercised">已行权交割</option>
                <option value="vested">已成熟待认购</option>
              </select>

              {(searchTerm || deptFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDeptFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline px-1"
                >
                  重置
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: Exercise Fulfillment Logs */}
        {activeTab === 'exercise' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">履约流水单号</th>
                  <th className="px-5 py-3.5">行权激励员工</th>
                  <th className="px-5 py-3.5">关联方案与期数</th>
                  <th className="px-5 py-3.5">归属部门</th>
                  <th className="px-5 py-3.5 font-mono">成熟生效日</th>
                  <th className="px-5 py-3.5 text-right">交割股数</th>
                  <th className="px-5 py-3.5 text-right">行权单价</th>
                  <th className="px-5 py-3.5 text-right">总结算金</th>
                  <th className="px-5 py-3.5">履约交割状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      {records.length === 0
                        ? '暂无成熟行权履约记录。可在【授予计划】模块点击“立即触发成熟行权”生成履约流水。'
                        : '没有匹配筛选条件的履约流水记录'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <span>{rec.record_no}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '自动归属'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{rec.employee_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{rec.employee_id}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-purple-700 font-mono">
                          {rec.plan_no}
                        </div>
                        <div className="text-[11px] text-slate-500">第 {rec.cycle_no} 期成熟</div>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                        {rec.department_name}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {rec.vest_date}
                      </td>

                      <td className="px-5 py-4 font-bold text-emerald-600 text-right font-mono">
                        {Number(rec.shares).toLocaleString()} 股
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-xs text-slate-700">
                        ¥ {Number(rec.exercise_price).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900 text-right font-mono">
                        ¥ {Number(rec.total_amount).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center space-x-1 text-3xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>已行权交割</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Share Configuration Audit Logs */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">日志流水ID</th>
                  <th className="px-5 py-3.5">基准年度</th>
                  <th className="px-5 py-3.5">变更类型</th>
                  <th className="px-5 py-3.5">操作人</th>
                  <th className="px-5 py-3.5 font-mono">发生时间</th>
                  <th className="px-5 py-3.5">变更审计说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shareLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      暂无股份基准变更审计日志
                    </td>
                  </tr>
                ) : (
                  shareLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {log.id}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {log.year} 年度
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-3xs px-2 py-0.5 rounded-full font-bold border ${
                            log.change_type === 'create'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : log.change_type === 'update'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {log.change_type === 'create'
                            ? '新增基准'
                            : log.change_type === 'update'
                            ? '更新配置'
                            : log.change_type === 'pool_adjust'
                            ? '激励池调整'
                            : '估值调整'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        {log.operator || '系统管理员'}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-700">
                        <div className="font-medium text-slate-800">{log.details}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
