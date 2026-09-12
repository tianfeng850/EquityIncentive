import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Award,
  ScrollText
} from 'lucide-react';
import { api } from '../services/api.js';
import { Employee, Department } from '../types.js';
import { ConfirmModal } from './ConfirmModal.js';

interface EmployeesViewProps {
  onDataChanged?: () => void;
  onNavigateToPlans?: (employeeId: string) => void;
  initialDepartmentFilter?: string | null;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  onDataChanged,
  onNavigateToPlans,
  initialDepartmentFilter
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(initialDepartmentFilter || 'all');
  const [confirmEmp, setConfirmEmp] = useState<Employee | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    employee_no: '',
    name: '',
    department_id: '',
    position: '',
    email: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'terminated'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.getEmployees(),
        api.getDepartments()
      ]);
      if (empRes.success && empRes.data) setEmployees(empRes.data);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
    } catch (err: any) {
      setFeedback({ type: 'error', text: `加载员工数据失败: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialDepartmentFilter) {
      setSelectedDept(initialDepartmentFilter);
    }
  }, [initialDepartmentFilter]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      employee_no: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      name: '',
      department_id: departments[0]?.id || '',
      position: '',
      email: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEditing(true);
    setEditingId(emp.id);
    setForm({
      employee_no: emp.employee_no,
      name: emp.name,
      department_id: emp.department_id,
      position: emp.position,
      email: emp.email,
      phone: emp.phone,
      hire_date: emp.hire_date,
      status: emp.status
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (!form.name.trim()) {
      setFeedback({ type: 'error', text: '员工姓名不能为空' });
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await api.updateEmployee(editingId, form);
        if (res.success) {
          setFeedback({ type: 'success', text: `员工 ${form.name} 档案更新成功` });
          setModalOpen(false);
          await fetchData();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '更新失败' });
        }
      } else {
        const res = await api.addEmployee(form);
        if (res.success) {
          setFeedback({ type: 'success', text: `成功创建员工档案 [${form.name}]` });
          setModalOpen(false);
          await fetchData();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '添加员工失败' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `提交发生错误: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (emp: Employee) => {
    setConfirmEmp(emp);
  };

  const confirmDeleteEmp = async () => {
    if (!confirmEmp) return;
    try {
      const res = await api.deleteEmployee(confirmEmp.id);
      if (res.success) {
        setFeedback({ type: 'success', text: `员工 ${confirmEmp.name} 已成功注销` });
        await fetchData();
        if (onDataChanged) onDataChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || '删除失败' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: `删除操作失败: ${err.message}` });
    } finally {
      setConfirmEmp(null);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || e.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">员工激励档案 (Employees)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              管理核心员工期权归属人、组织部门映射与在职成熟进度
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>录入新员工档案</span>
        </button>
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
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 underline">
            关闭
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="搜索姓名、工号、职位..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 shrink-0">部门筛选:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 w-full sm:w-auto"
          >
            <option value="all">全部部门 (All Departments)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">员工工号与姓名</th>
                <th className="px-6 py-3.5">所属部门与职位</th>
                <th className="px-6 py-3.5">联系方式</th>
                <th className="px-6 py-3.5">入职日期</th>
                <th className="px-6 py-3.5">授予期权总量</th>
                <th className="px-6 py-3.5">成熟进度 (已成熟 / 待成熟)</th>
                <th className="px-6 py-3.5">状态</th>
                <th className="px-6 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    未找到匹配的员工档案
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const vestPct =
                    emp.total_granted_shares > 0
                      ? Math.round((emp.vested_shares / emp.total_granted_shares) * 100)
                      : 0;
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{emp.employee_no}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-800">{emp.department_name}</div>
                        <div className="text-xs text-slate-500">{emp.position}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-600">{emp.email || '-'}</div>
                        <div className="text-slate-400 font-mono">{emp.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{emp.hire_date}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {Number(emp.total_granted_shares).toLocaleString()} 股
                        </span>
                        <span className="text-xs text-slate-400 block">
                          {emp.plan_count || 0} 笔计划
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-36">
                          <div className="flex justify-between text-3xs font-medium mb-1 text-slate-500">
                            <span className="text-emerald-600 font-semibold">{vestPct}% 已成熟</span>
                            <span>{Number(emp.vested_shares).toLocaleString()} / {Number(emp.total_granted_shares).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${vestPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            emp.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {emp.status === 'active' ? '在职' : '离职'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        {onNavigateToPlans && (
                          <button
                            onClick={() => onNavigateToPlans(emp.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60"
                            title="为此员工发起期权授予计划"
                          >
                            <ScrollText className="w-3.5 h-3.5" />
                            <span>授予期权</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                          title="编辑档案"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                          title="删除员工"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmEmp)}
        title="注销激励员工档案"
        message={
          confirmEmp
            ? `确定要注销员工 [${confirmEmp.name}] (${confirmEmp.employee_no}) 的档案吗？如果该员工名下有进行中的期权计划，系统将提示保护。`
            : ''
        }
        confirmText="确认注销"
        confirmVariant="danger"
        onConfirm={confirmDeleteEmp}
        onCancel={() => setConfirmEmp(null)}
      />

      {/* ADD/EDIT EMPLOYEE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {isEditing ? `编辑员工档案 [${form.name}]` : '录入新激励员工档案'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    员工工号 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.employee_no}
                    onChange={e => setForm({ ...form, employee_no: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    员工姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">所属部门</label>
                  <select
                    value={form.department_id}
                    onChange={e => setForm({ ...form, department_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">岗位职务</label>
                  <input
                    type="text"
                    placeholder="如：资深技术专家"
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">工作邮箱</label>
                  <input
                    type="email"
                    placeholder="user@company.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">联系电话</label>
                  <input
                    type="tel"
                    placeholder="13800000000"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">入职日期</label>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={e => setForm({ ...form, hire_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">在职状态</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="active">在职服务中 (Active)</option>
                    <option value="terminated">已离职注销 (Terminated)</option>
                  </select>
                </div>
              </div>

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
                  {submitting ? '保存中...' : isEditing ? '保存修改' : '确认创建档案'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
