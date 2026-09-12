import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { api } from '../services/api.js';
import { Employee, GrantPlan, EquityRecord, Department } from '../types.js';

export const ReportsView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [plans, setPlans] = useState<GrantPlan[]>([]);
  const [records, setRecords] = useState<EquityRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'records'>('summary');
  const [selectedDept, setSelectedDept] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, plansRes, recRes, deptRes] = await Promise.all([
        api.getEmployees(),
        api.getPlans(),
        api.getRecords(),
        api.getDepartments()
      ]);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (plansRes.success && plansRes.data) setPlans(plansRes.data);
      if (recRes.success && recRes.data) setRecords(recRes.data);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employees.filter(
    e => selectedDept === 'all' || e.department_id === selectedDept
  );

  const totalGranted = employees.reduce((s, e) => s + (Number(e.total_granted_shares) || 0), 0);
  const totalVested = employees.reduce((s, e) => s + (Number(e.vested_shares) || 0), 0);
  const totalUnvested = employees.reduce((s, e) => s + (Number(e.unvested_shares) || 0), 0);
  const totalExerciseAmount = records.reduce((s, r) => s + (Number(r.total_amount) || 0), 0);

  // CSV Export
  const exportToCSV = () => {
    let csvContent = '\uFEFF'; // BOM for UTF-8 in Excel
    if (activeTab === 'summary') {
      csvContent += '工号,员工姓名,所属部门,岗位职务,在职状态,授予总量(股),已成熟(股),未成熟(股),成熟比例(%)\n';
      filteredEmployees.forEach(e => {
        const pct = e.total_granted_shares > 0 ? ((e.vested_shares / e.total_granted_shares) * 100).toFixed(1) : '0';
        csvContent += `"${e.employee_no}","${e.name}","${e.department_name}","${e.position}","${e.status === 'active' ? '在职' : '离职'}",${e.total_granted_shares},${e.vested_shares},${e.unvested_shares},"${pct}%"\n`;
      });
    } else {
      csvContent += '行权流水号,员工姓名,归属计划,期数,所属部门,行权生效日,股份数量(股),行权单价(元),总结算金额(元),状态\n';
      records.forEach(r => {
        csvContent += `"${r.record_no}","${r.employee_name}","${r.plan_no}",第${r.cycle_no}期,"${r.department_name}","${r.vest_date}",${r.shares},${r.exercise_price},${r.total_amount},"${r.status === 'exercised' ? '已行权' : '已成熟待认购'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `股权激励${activeTab === 'summary' ? '员工总表' : '成熟行权流水'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">股权激励报表与行权台账 (Equity Reports)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              多维度员工期权成熟台账、部门配额聚合分析与财务标准 CSV 导出
            </p>
          </div>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5 self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>导出当前报表 (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">累计获授总量</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalGranted.toLocaleString()} <span className="text-xs font-normal text-slate-400">股</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">已释放成熟股份</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {totalVested.toLocaleString()} <span className="text-xs font-normal text-slate-400">股</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">锁定期未成熟</div>
          <div className="text-xl font-black text-purple-600 mt-1">
            {totalUnvested.toLocaleString()} <span className="text-xs font-normal text-slate-400">股</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">行权累计总金额</div>
          <div className="text-xl font-black text-blue-600 mt-1">
            ¥ {totalExerciseAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">元</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              员工期权合并总表 ({filteredEmployees.length})
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'records'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              成熟行权交割明细流水 ({records.length})
            </button>
          </div>

          {activeTab === 'summary' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">部门:</span>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="all">所有部门</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === 'summary' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">员工姓名与工号</th>
                  <th className="px-6 py-3.5">所属部门</th>
                  <th className="px-6 py-3.5">职位</th>
                  <th className="px-6 py-3.5 text-right">累计获授股份</th>
                  <th className="px-6 py-3.5 text-right">已成熟生效</th>
                  <th className="px-6 py-3.5 text-right">未成熟期权</th>
                  <th className="px-6 py-3.5">整体成熟率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const pct =
                    emp.total_granted_shares > 0
                      ? Math.round((emp.vested_shares / emp.total_granted_shares) * 100)
                      : 0;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900">{emp.name}</span>
                        <span className="text-xs text-slate-400 font-mono ml-2">({emp.employee_no})</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-800 font-medium">{emp.department_name}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">{emp.position}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-right">
                        {Number(emp.total_granted_shares).toLocaleString()} 股
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-emerald-600 text-right">
                        {Number(emp.vested_shares).toLocaleString()} 股
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 text-right">
                        {Number(emp.unvested_shares).toLocaleString()} 股
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">流水号</th>
                  <th className="px-6 py-3.5">行权员工</th>
                  <th className="px-6 py-3.5">关联方案与期数</th>
                  <th className="px-6 py-3.5">部门</th>
                  <th className="px-6 py-3.5 font-mono">成熟生效日</th>
                  <th className="px-6 py-3.5 text-right">交割股数</th>
                  <th className="px-6 py-3.5 text-right">行权单价</th>
                  <th className="px-6 py-3.5 text-right">总交割金</th>
                  <th className="px-6 py-3.5">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                      暂无成熟行权明细
                    </td>
                  </tr>
                ) : (
                  records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-700">{rec.record_no}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{rec.employee_name}</td>
                      <td className="px-6 py-3.5 text-xs text-purple-700 font-medium">
                        {rec.plan_no} (第{rec.cycle_no}期)
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">{rec.department_name}</td>
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-600">{rec.vest_date}</td>
                      <td className="px-6 py-3.5 font-bold text-emerald-600 text-right">
                        {Number(rec.shares).toLocaleString()} 股
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs">¥ {rec.exercise_price}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-right">
                        ¥ {Number(rec.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          已完成成熟
                        </span>
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
