import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Coins,
  Zap,
  User,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { GrantPlan, Employee, CompanyShare } from '../types.js';

interface PlansViewProps {
  onDataChanged?: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onDataChanged }) => {
  const [plans, setPlans] = useState<GrantPlan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shares, setShares] = useState<CompanyShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    employee_id: '',
    share_year: 2025,
    total_shares: 50000,
    grant_price: 2.5,
    grant_date: new Date().toISOString().split('T')[0],
    lockup_months: 12,
    notes: '核心骨干激励计划，分4年每年成熟25%'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, empRes, sharesRes] = await Promise.all([
        api.getPlans(),
        api.getEmployees(),
        api.getShares()
      ]);
      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
        if (plansRes.data.length > 0 && !expandedPlanId) {
          setExpandedPlanId(plansRes.data[0].id);
        }
      }
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (sharesRes.success && sharesRes.data) setShares(sharesRes.data);
    } catch (err: any) {
      setFeedback({ type: 'error', text: `加载计划失败: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    const activeShare = shares.find(s => s.status === 'active') || shares[0];
    const defaultEmployee = employees[0]?.id || '';
    setForm({
      employee_id: defaultEmployee,
      share_year: activeShare ? activeShare.year : 2025,
      total_shares: 50000,
      grant_price: 2.5,
      grant_date: new Date().toISOString().split('T')[0],
      lockup_months: 12,
      notes: '核心骨干激励计划，分4年每年成熟25%'
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (!form.employee_id) {
      setFeedback({ type: 'error', text: '请选择激励对象员工' });
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.addPlan(form);
      if (res.success) {
        setFeedback({ type: 'success', text: `成功创建期权授予计划 [${res.data?.plan_no}]` });
        setModalOpen(false);
        await fetchData();
        if (onDataChanged) onDataChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || '创建授予计划失败' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `提交发生错误: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVestImmediately = async (cycleId: string, planNo: string, cycleNo: number) => {
    if (!window.confirm(`确认将计划 ${planNo} 的第 ${cycleNo} 期成熟并立即行权吗？`)) {
      return;
    }

    try {
      const res = await api.vestCycle(cycleId);
      if (res.success) {
        setFeedback({ type: 'success', text: `第 ${cycleNo} 期期权已成功手动成熟并记入行权总表！` });
        await fetchData();
        if (onDataChanged) onDataChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || '操作失败' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `行权失败: ${err.message}` });
    }
  };

  const selectedShare = shares.find(s => s.year === Number(form.share_year));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <ScrollText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">期权授予计划与分期成熟 (Grant Plans)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              制定员工期权授予方案、跟踪多周期成熟节点及手动/自动行权交割
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>制定新授予方案</span>
        </button>
      </div>

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
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 underline">
            关闭
          </button>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            暂无授予方案，请点击上方【制定新授予方案】创建
          </div>
        ) : (
          plans.map(plan => {
            const isExpanded = expandedPlanId === plan.id;
            const vestedCount = plan.cycles.filter(c => c.status === 'vested').length;
            const vestedShares = plan.cycles
              .filter(c => c.status === 'vested')
              .reduce((s, c) => s + (Number(c.vest_shares) || 0), 0);
            const vestPct = Math.round((vestedShares / plan.total_shares) * 100);

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Plan Header */}
                <div
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {plan.employee_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {plan.plan_no}
                        </span>
                        <h3 className="font-bold text-base text-slate-900">{plan.employee_name}</h3>
                        <span className="text-xs text-slate-400 font-mono">({plan.employee_no})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                        <span>部门: {plan.department_name}</span>
                        <span>·</span>
                        <span>基准年度: {plan.share_year}年</span>
                        <span>·</span>
                        <span>授予日: {plan.grant_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">授予期权总量</div>
                      <div className="text-base font-bold text-slate-900">
                        {Number(plan.total_shares).toLocaleString()} 股
                      </div>
                      <div className="text-3xs text-slate-500">
                        行权单价: ¥{plan.grant_price} / 股
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">归属成熟进度</div>
                      <div className="text-sm font-bold text-emerald-600">{vestPct}% 已成熟</div>
                      <div className="text-3xs text-slate-500">
                        {vestedCount} / {plan.cycles.length} 期
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Plan Cycles Breakdown Accordion */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        分期归属节奏表 ({plan.cycles.length} 个成熟周期)
                      </h4>
                      <span className="text-xs text-slate-500">
                        备注说明: {plan.notes || '无特别说明'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {plan.cycles.map(cycle => {
                        const isVested = cycle.status === 'vested';
                        return (
                          <div
                            key={cycle.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isVested
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-slate-50/60 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-slate-800">
                                第 {cycle.cycle_no} 期成熟
                              </span>
                              <span
                                className={`text-3xs px-2 py-0.5 rounded-full font-semibold ${
                                  isVested
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isVested ? '已成熟生效' : '待成熟'}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between text-slate-600">
                                <span className="text-slate-400">成熟约定日:</span>
                                <span className="font-mono font-medium">{cycle.vest_date}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span className="text-slate-400">释放比例:</span>
                                <span className="font-semibold text-purple-700">
                                  {cycle.vest_percentage}%
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span className="text-slate-400">释放股数:</span>
                                <span className="font-bold text-slate-900">
                                  {Number(cycle.vest_shares).toLocaleString()} 股
                                </span>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-3xs text-slate-500 line-clamp-2">
                              考核条件: {cycle.vest_conditions}
                            </div>

                            {!isVested && (
                              <button
                                onClick={() => handleVestImmediately(cycle.id, plan.plan_no, cycle.cycle_no)}
                                className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs transition-colors flex items-center justify-center space-x-1 shadow-xs"
                              >
                                <Zap className="w-3 h-3" />
                                <span>立即触发成熟行权</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW PLAN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">制定新期权授予计划</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  激励对象员工 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.employee_id}
                  onChange={e => setForm({ ...form, employee_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  required
                >
                  <option value="">-- 请选择员工 --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employee_no}) - {e.department_name} / {e.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">股份基准年度</label>
                  <select
                    value={form.share_year}
                    onChange={e => setForm({ ...form, share_year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {shares.map(s => (
                      <option key={s.id} value={s.year}>
                        {s.year}年度 (可用池: {Number(s.remaining_pool_shares || 0).toLocaleString()} 股)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    授予股份数量 (股) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={form.total_shares}
                    onChange={e => setForm({ ...form, total_shares: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">行权协议价 (元/股)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.grant_price}
                    onChange={e => setForm({ ...form, grant_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">正式授予生效日期</label>
                  <input
                    type="date"
                    value={form.grant_date}
                    onChange={e => setForm({ ...form, grant_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">计划方案说明</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Pool check preview */}
              {selectedShare && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-800">
                    激励池校验: {selectedShare.year}年度激励池剩余可用{' '}
                    <span className="text-blue-600 font-bold">
                      {Number(selectedShare.remaining_pool_shares || 0).toLocaleString()} 股
                    </span>
                  </div>
                  <div className="text-3xs text-slate-500">
                    系统将自动生成标准 4 期成熟计划（第1~4年每年匀速成熟 25%）
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                >
                  {submitting ? '创建中...' : '确认生成计划'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
