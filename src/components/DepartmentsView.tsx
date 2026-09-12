import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Users,
  Coins,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { Department } from '../types.js';
import { ConfirmModal } from './ConfirmModal.js';

interface DepartmentsViewProps {
  onDataChanged?: () => void;
  onNavigateToEmployees?: (deptId: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  onDataChanged,
  onNavigateToEmployees
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDept, setConfirmDept] = useState<Department | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    manager_name: '',
    description: ''
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: `加载部门失败: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({ name: '', code: '', manager_name: '', description: '' });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditing(true);
    setEditingId(dept.id);
    setForm({
      name: dept.name,
      code: dept.code,
      manager_name: dept.manager_name,
      description: dept.description
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedback({ type: 'error', text: '部门名称不能为空' });
      return;
    }

    try {
      if (isEditing && editingId) {
        const res = await api.updateDepartment(editingId, form);
        if (res.success) {
          setFeedback({ type: 'success', text: '部门信息更新成功' });
          setModalOpen(false);
          await fetchDepts();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '更新失败' });
        }
      } else {
        const res = await api.addDepartment(form);
        if (res.success) {
          setFeedback({ type: 'success', text: `部门 [${form.name}] 创建成功` });
          setModalOpen(false);
          await fetchDepts();
          if (onDataChanged) onDataChanged();
        } else {
          setFeedback({ type: 'error', text: res.error || '创建失败' });
        }
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message });
    }
  };

  const handleDelete = (dept: Department) => {
    setConfirmDept(dept);
  };

  const confirmDeleteDept = async () => {
    if (!confirmDept) return;
    try {
      const res = await api.deleteDepartment(confirmDept.id);
      if (res.success) {
        setFeedback({ type: 'success', text: `部门 [${confirmDept.name}] 已删除` });
        await fetchDepts();
        if (onDataChanged) onDataChanged();
      } else {
        setFeedback({ type: 'error', text: res.error || '删除失败' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setConfirmDept(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">组织架构部门管理 (Departments)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              维护企业内部组织单元、编制责任人及部门期权配额分布
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>新建组织部门</span>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map(dept => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {dept.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                {dept.description || '暂无部门业务职能说明'}
              </p>

              <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">部门负责人:</span>
                  <span className="font-medium text-slate-900">{dept.manager_name || '待指定'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">激励覆盖员工数:</span>
                  <span className="font-semibold text-slate-900 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {dept.employee_count || 0} 人
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-400">累计获授股权:</span>
                  <span className="font-bold text-blue-600">
                    {Number(dept.total_granted_shares || 0).toLocaleString()} 股
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {onNavigateToEmployees ? (
                <button
                  type="button"
                  onClick={() => onNavigateToEmployees(dept.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>查看该部门员工 ({dept.employee_count || 0})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-3xs text-slate-400">架构ID: {dept.id}</span>
              )}
              <span className="text-3xs text-slate-400">状态: 正常运作</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDept)}
        title="确认删除组织架构部门"
        message={
          confirmDept
            ? `确定要删除部门 [${confirmDept.name}] 吗？如果该部门下存在关联员工或股权计划，系统将校验并提示保护。`
            : ''
        }
        confirmText="确认删除"
        confirmVariant="danger"
        onConfirm={confirmDeleteDept}
        onCancel={() => setConfirmDept(null)}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{isEditing ? '编辑部门架构' : '新增部门架构'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  部门名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：核心研发中心"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">部门编号 / 缩写代号</label>
                <input
                  type="text"
                  placeholder="如：RND"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">部门负责人</label>
                <input
                  type="text"
                  placeholder="如：张华 (CTO)"
                  value={form.manager_name}
                  onChange={e => setForm({ ...form, manager_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">部门业务职能说明</label>
                <textarea
                  rows={3}
                  placeholder="部门核心业务范畴与职责..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
                >
                  {isEditing ? '保存修改' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
