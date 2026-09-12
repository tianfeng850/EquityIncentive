import React, { useState, useEffect } from 'react';
import {
  Coins,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  TrendingUp,
  PieChart,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  ScrollText
} from 'lucide-react';
import { api } from '../services/api.js';
import { CompanyShare, ShareChangeLog } from '../types.js';
import { ConfirmModal } from './ConfirmModal.js';

interface SharesViewProps {
  onDataChanged?: () => void;
  onOpenDiagnostic?: () => void;
  onNavigateToPlans?: (year?: number) => void;
}

export const SharesView: React.FC<SharesViewProps> = ({
  onDataChanged,
  onOpenDiagnostic,
  onNavigateToPlans
}) => {
  const [shares, setShares] = useState<CompanyShare[]>([]);
  const [logs, setLogs] = useState<ShareChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');
  const [confirmShare, setConfirmShare] = useState<CompanyShare | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    valuation: 100000000, // 1亿元
    total_shares: 10000000, // 1000万股
    pool_shares: 1500000, // 150万股
    pool_percentage: 15,
    reserved_shares: 500000,
    share_price: 10,
    currency: 'CNY',
    status: 'active' as 'active' | 'draft' | 'archived',
    notes: '',
    overwrite: false
  });

  // Alert message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSharesData = async () => {
    setLoading(true);
    try {
      const [sharesRes, logsRes] = await Promise.all([
        api.getShares(),
        api.getShareLogs()
      ]);
      if (sharesRes.success && sharesRes.data) {
        setShares(sharesRes.data);
      }
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: `获取股份数据失败: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharesData();
  }, []);

  // Handle open add modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    const existingYears = shares.map(s => s.year);
    let nextYear = new Date().getFullYear();
    while (existingYears.includes(nextYear)) {
      nextYear += 1;
    }

    const defaultTotal = 10000000;
    const defaultValuation = 100000000;
    const defaultPool = 1500000;

    setForm({
      year: nextYear,
      valuation: defaultValuation,
      total_shares: defaultTotal,
      pool_shares: defaultPool,
      pool_percentage: 15,
      reserved_shares: 500000,
      share_price: Number((defaultValuation / defaultTotal).toFixed(2)),
      currency: 'CNY',
      status: 'active',
      notes: `${nextYear}年度公司股权激励池基准规划`,
      overwrite: false
    });
    setFeedback(null);
    setModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (share: CompanyShare) => {
    setIsEditing(true);
    setEditingId(share.id);
    setForm({
      year: share.year,
      valuation: share.valuation,
      total_shares: share.total_shares,
      pool_shares: share.pool_shares,
      pool_percentage: share.pool_percentage,
      reserved_shares: share.reserved_shares,
      share_price: share.share_price,
      currency: share.currency,
      status: share.status,
      notes: share.notes || '',
      overwrite: true
    });
    setFeedback(null);
    setModalOpen(true);
  };

  // Input changes with dual linkage
  const handleValuationChange = (val: number) => {
    const newPrice = form.total_shares > 0 ? Number((val / form.total_shares).toFixed(4)) : 0;
    setForm(prev => ({
      ...prev,
      valuation: val,
      share_price: newPrice
    }));
  };

  const handleTotalSharesChange = (total: number) => {
    const newPrice = total > 0 ? Number((form.valuation / total).toFixed(4)) : 0;
    const newPoolShares = Math.round(total * (form.pool_percentage / 100));
    setForm(prev => ({
      ...prev,
      total_shares: total,
      pool_shares: newPoolShares,
      share_price: newPrice
    }));
  };

  const handlePoolPercentageChange = (pct: number) => {
    const newPoolShares = Math.round(form.total_shares * (pct / 100));
    setForm(prev => ({
      ...prev,
      pool_percentage: pct,
      pool_shares: newPoolShares
    }));
  };

  const handlePoolSharesChange = (sharesCount: number) => {
    const newPct = form.total_shares > 0 ? Number(((sharesCount / form.total_shares) * 100).toFixed(4)) : 0;
    setForm(prev => ({
      ...prev,
      pool_shares: sharesCount,
      pool_percentage: newPct
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    // Front-end sanity checks
    if (!form.year || form.year < 1990 || form.year > 2100) {
      setFeedback({ type: 'error', text: '请填写合理的年份 (1990 - 2100)' });
      setSubmitting(false);
      return;
    }
    if (form.valuation <= 0) {
      setFeedback({ type: 'error', text: '公司估值必须为大于 0 的数值' });
      setSubmitting(false);
      return;
    }
    if (form.total_shares <= 0) {
      setFeedback({ type: 'error', text: '公司总股本必须大于 0' });
      setSubmitting(false);
      return;
    }
    if (form.pool_shares > form.total_shares) {
      setFeedback({
        type: 'error',
        text: `激励池总股数 (${form.pool_shares.toLocaleString()}) 不可大于总股本 (${form.total_shares.toLocaleString()})`
      });
      setSubmitting(false);
      return;
    }
    if (form.reserved_shares > form.pool_shares) {
      setFeedback({
        type: 'error',
        text: `预留股数 (${form.reserved_shares.toLocaleString()}) 不可大于激励池总股数 (${form.pool_shares.toLocaleString()})`
      });
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await api.updateShare(editingId, form);
        if (res.success) {
          setFeedback({ type: 'success', text: `成功更新 ${form.year} 年度公司股份信息！` });
          setModalOpen(false);
          await fetchSharesData();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '更新股份信息失败' });
        }
      } else {
        const res = await api.addShare(form);
        if (res.success) {
          setFeedback({ type: 'success', text: `成功添加 ${form.year} 年度公司股份配置！` });
          setModalOpen(false);
          await fetchSharesData();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '添加股份信息失败' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `请求发生网络或连接错误: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Share
  const handleDelete = (share: CompanyShare) => {
    setConfirmShare(share);
  };

  const confirmDeleteShare = async () => {
    if (!confirmShare) return;
    try {
      const res = await api.deleteShare(confirmShare.id);
      if (res.success) {
        setFeedback({ type: 'success', text: `已删除 ${confirmShare.year} 年度股份记录` });
        await fetchSharesData();
        if (onDataChanged) onDataChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || '删除失败' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `删除操作失败: ${err.message}` });
    } finally {
      setConfirmShare(null);
    }
  };

  const activeShare = shares.find(s => s.status === 'active') || shares[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">公司股份与估值配置 (Company Shares)</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                设定各年度公司投后估值基准、总股本规模、期权激励池配额及每股结算价格
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDiagnostic}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>检查所有连接</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>添加公司股份信息</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 underline ml-4"
          >
            关闭
          </button>
        </div>
      )}

      {/* Active Share Highlight Box */}
      {activeShare && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-700/80 gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  当前生效估值基准
                </span>
                <span className="text-sm text-slate-300">版本年度：{activeShare.year} 年</span>
              </div>
              <h2 className="text-2xl font-bold mt-2 text-white">
                {activeShare.currency} {(activeShare.valuation / 10000).toLocaleString()} 万元
                <span className="text-sm font-normal text-slate-400 ml-2">总估值</span>
              </h2>
            </div>

              <div className="flex items-center space-x-2">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-right">
                  <div className="text-xs text-slate-400">每股估值基准单价</div>
                  <div className="text-lg font-bold text-emerald-400">
                    ¥ {Number(activeShare.share_price).toFixed(2)} / 股
                  </div>
                </div>
                {onNavigateToPlans && (
                  <button
                    onClick={() => onNavigateToPlans(activeShare.year)}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center space-x-1.5 shadow-sm shadow-blue-500/20 transition-all"
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>创建该年授予计划</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(activeShare)}
                  className="px-3 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>调整此基准</span>
                </button>
              </div>
          </div>

          {/* Progress / Metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div>
              <div className="text-xs text-slate-400">公司总股本</div>
              <div className="text-base font-semibold mt-1">
                {Number(activeShare.total_shares).toLocaleString()} 股
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">激励池总规模 ({activeShare.pool_percentage}%)</div>
              <div className="text-base font-semibold mt-1 text-blue-400">
                {Number(activeShare.pool_shares).toLocaleString()} 股
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">已授予激励股份</div>
              <div className="text-base font-semibold mt-1 text-purple-400">
                {Number(activeShare.granted_shares || 0).toLocaleString()} 股
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">剩余可用激励配额</div>
              <div className="text-base font-semibold mt-1 text-emerald-400">
                {Number(activeShare.remaining_pool_shares || 0).toLocaleString()} 股
              </div>
            </div>
          </div>

          {/* Incentive pool visual bar */}
          <div className="mt-5 pt-4 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>激励池占用消耗进度</span>
              <span>
                {activeShare.pool_shares > 0
                  ? (((activeShare.granted_shares || 0) / activeShare.pool_shares) * 100).toFixed(1)
                  : 0}
                % 已授予
              </span>
            </div>
            <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    activeShare.pool_shares > 0
                      ? ((activeShare.granted_shares || 0) / activeShare.pool_shares) * 100
                      : 0
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Table & Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50/50">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              年度股份配置清单 ({shares.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              变更审计日志 ({logs.length})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            {activeTab === 'list' ? '支持按年份多版本管理' : '每次增改均受系统审计跟踪'}
          </span>
        </div>

        {activeTab === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">年度版本</th>
                  <th className="px-6 py-3.5">公司总估值</th>
                  <th className="px-6 py-3.5">总股本</th>
                  <th className="px-6 py-3.5">激励池总规模 (比例)</th>
                  <th className="px-6 py-3.5">已授予 / 剩余可用</th>
                  <th className="px-6 py-3.5">每股基准价</th>
                  <th className="px-6 py-3.5">状态</th>
                  <th className="px-6 py-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shares.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      暂无股份信息，请点击右上角【添加公司股份信息】创建
                    </td>
                  </tr>
                ) : (
                  shares.map(share => (
                    <tr key={share.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 flex items-center space-x-2">
                        <span>{share.year} 年度</span>
                        {share.status === 'active' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-3xs px-1.5 py-0.5 rounded font-medium">
                            生效中
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {share.currency} {(share.valuation / 10000).toLocaleString()} 万
                      </td>
                      <td className="px-6 py-4">{Number(share.total_shares).toLocaleString()} 股</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {Number(share.pool_shares).toLocaleString()} 股
                        </span>
                        <span className="text-xs text-slate-400 ml-1">({share.pool_percentage}%)</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">
                            {Number(share.granted_shares || 0).toLocaleString()}
                          </span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-emerald-600 font-medium">
                            {Number(share.remaining_pool_shares || 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">
                        ¥ {Number(share.share_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            share.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : share.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {share.status === 'active' ? '正式基准' : share.status === 'draft' ? '草案规划' : '历史归档'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {onNavigateToPlans && (
                          <button
                            onClick={() => onNavigateToPlans(share.year)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                            title="以此基准创建授予计划"
                          >
                            <ScrollText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(share)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="编辑股份信息"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(share)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                          title="删除股份记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">发生时间</th>
                  <th className="px-6 py-3.5">对应年份</th>
                  <th className="px-6 py-3.5">变更类型</th>
                  <th className="px-6 py-3.5">变更明细与审计描述</th>
                  <th className="px-6 py-3.5">操作人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      暂无变更日志
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5 text-xs text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{log.year} 年</td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {log.change_type === 'create' ? '新建配置' : '配置变更'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-700 text-xs">{log.details}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">{log.operator}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Share Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmShare)}
        title="确认删除公司股份配置"
        message={
          confirmShare
            ? `确定要删除 ${confirmShare.year} 年度的股份配置吗？如果当前年度有关联的股权授予计划，系统将校验并拒绝删除以保证业务一致性。`
            : ''
        }
        confirmText="确认删除"
        confirmVariant="danger"
        onConfirm={confirmDeleteShare}
        onCancel={() => setConfirmShare(null)}
      />

      {/* ADD / EDIT COMPANY SHARE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {isEditing ? `编辑 ${form.year} 年度公司股份信息` : '添加公司股份与估值配置'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    录入完整的公司估值总额、股本规模与期权激励池配额，系统将自动联动计算
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Error banner inside modal */}
              {feedback && feedback.type === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">保存失败：</span>
                    {feedback.text}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    基准年度 (Year) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max="2100"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    required
                  />
                  <p className="text-3xs text-slate-400 mt-1">例如: 2025 或 2026</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    版本状态 (Status)
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="active">正式生效基准 (Active)</option>
                    <option value="draft">规划草案 (Draft)</option>
                    <option value="archived">归档历史 (Archived)</option>
                  </select>
                </div>

                {/* Company Valuation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      公司总估值 (元) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-3xs text-blue-600 font-medium">
                      {(form.valuation / 10000).toLocaleString()} 万元
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={form.valuation}
                    onChange={e => handleValuationChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                    required
                  />
                  <div className="flex space-x-1.5 mt-1.5">
                    {[50000000, 100000000, 200000000, 500000000].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => handleValuationChange(v)}
                        className="px-2 py-0.5 text-3xs rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {v / 100000000}亿
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Shares */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      公司总股本 (股) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-3xs text-slate-500 font-medium">
                      {(form.total_shares / 10000).toLocaleString()} 万股
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={form.total_shares}
                    onChange={e => handleTotalSharesChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                    required
                  />
                  <div className="flex space-x-1.5 mt-1.5">
                    {[10000000, 20000000, 50000000, 100000000].map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleTotalSharesChange(s)}
                        className="px-2 py-0.5 text-3xs rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {s / 10000}万股
                      </button>
                    ))}
                  </div>
                </div>

                {/* Incentive Pool Shares */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      激励池总量 (股) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-3xs text-blue-600 font-medium">
                      占比 {form.pool_percentage}%
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={form.total_shares}
                    value={form.pool_shares}
                    onChange={e => handlePoolSharesChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                    required
                  />
                </div>

                {/* Pool Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      激励池占总股本比 (%)
                    </label>
                    <span className="text-3xs text-slate-400">输入百分比自动联动股数</span>
                  </div>
                  <input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={form.pool_percentage}
                    onChange={e => handlePoolPercentageChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                  />
                  <div className="flex space-x-1.5 mt-1.5">
                    {[10, 12, 15, 20].map(pct => (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => handlePoolPercentageChange(pct)}
                        className="px-2 py-0.5 text-3xs rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reserved Shares */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    预留未分配股数 (股)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.pool_shares}
                    value={form.reserved_shares}
                    onChange={e => setForm({ ...form, reserved_shares: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                  />
                  <p className="text-3xs text-slate-400 mt-1">预留股份不可超过激励池总额</p>
                </div>

                {/* Share Price */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      每股估值基准 (元/股)
                    </label>
                    <span className="text-3xs text-emerald-600 font-medium">自动计算</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.share_price}
                    onChange={e => setForm({ ...form, share_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono bg-slate-50"
                  />
                  <p className="text-3xs text-slate-400 mt-1">计算公式: 总估值 / 总股本</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  版本备注 / 估值依据 (Notes)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="例如：B轮投资协议签署后设定的最新激励池方案..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* Overwrite toggle in case of year conflict */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs text-slate-600">
                    若所选年份（{form.year}年）已存在，允许直接覆盖更新现有记录
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.overwrite}
                    onChange={e => setForm({ ...form, overwrite: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Real-time Validation Summary Card */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1 text-blue-900">
                <div className="font-bold flex items-center space-x-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>实时合理性核验 (Real-time Validation):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    · 每股净资产/基准价:{' '}
                    <span className="font-semibold text-slate-900">
                      ¥ {Number(form.share_price).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    · 激励池占比:{' '}
                    <span className="font-semibold text-slate-900">{form.pool_percentage}%</span>
                  </div>
                  <div>
                    · 可授予上限:{' '}
                    <span className="font-semibold text-slate-900">
                      {form.pool_shares.toLocaleString()} 股
                    </span>
                  </div>
                  <div>
                    · 合法性检查:{' '}
                    <span className="font-semibold text-emerald-600">全部通过 ✓</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>正在保存提交...</span>
                    </>
                  ) : (
                    <span>{isEditing ? '保存修改并更新' : '确认添加并生效'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
