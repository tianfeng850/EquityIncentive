import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Calculator,
  GitFork,
  Clock,
  ShieldCheck,
  Zap,
  Terminal,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemDiagnosticResult, SystemDiagnosticCheck } from '../types.js';

export const DiagnosticView: React.FC = () => {
  const [result, setResult] = useState<SystemDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [showRaw, setShowRaw] = useState(false);

  const runAllChecks = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getDiagnostic();
      if (res.success && res.data) {
        setResult(res.data);
        setLastCheckTime(new Date().toLocaleTimeString());
      } else {
        setErrorMsg(res.error || '诊断服务未正常响应');
      }
    } catch (err: any) {
      setErrorMsg(`网络连接检测失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'database':
        return (
          <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium">
            <Database className="w-3 h-3 mr-1" />
            数据持久层
          </span>
        );
      case 'math':
        return (
          <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
            <Calculator className="w-3 h-3 mr-1" />
            算力与配额平衡
          </span>
        );
      case 'relationship':
        return (
          <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
            <GitFork className="w-3 h-3 mr-1" />
            关联通道完整性
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-3xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
            <Server className="w-3 h-3 mr-1" />
            API服务通信
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">系统全链路连接与合理性深度自检</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              实时验证 Express 后端通信、股份增改接口、数据库事务管道及期权关联模型健康度
            </p>
          </div>
        </div>

        <button
          onClick={runAllChecks}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? '正在全面探测...' : '立即重新探测所有连接'}</span>
        </button>
      </div>

      {/* Status Hero Card */}
      {result && (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            result.overall_status === 'healthy'
              ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 text-white border-emerald-500/30'
              : result.overall_status === 'warning'
              ? 'bg-gradient-to-br from-amber-900 via-slate-900 to-slate-900 text-white border-amber-500/30'
              : 'bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 text-white border-rose-500/30'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                  result.overall_status === 'healthy'
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                    : 'bg-rose-500/20 border-rose-400/40 text-rose-400'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/10">
                    全链路自检完毕
                  </span>
                  <span className="text-xs text-slate-400">探测用时: {result.duration_ms || 3}ms</span>
                </div>
                <h2 className="text-xl font-bold mt-1 text-white">
                  {result.overall_status === 'healthy'
                    ? '所有连接经探测均处于【正常、合理】状态'
                    : '系统检测到部分连接项异常，请查看明细'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  最近自检通过时间: {lastCheckTime || '刚刚'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
              <div className="text-center px-3">
                <div className="text-xs text-slate-400">检测项总数</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {result.summary.total_checks}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-3">
                <div className="text-xs text-slate-400">通过项</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {result.summary.passed}
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-3">
                <div className="text-xs text-slate-400">异常/警告</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {result.summary.warnings + result.summary.errors}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">连接探测报错：</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Verification Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            全链路连接节点自检详情清单 (Connection Health Matrix)
          </h3>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showRaw ? '隐藏原始 JSON 遥测' : '查看原始 JSON 遥测'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {result?.checks.map((chk: SystemDiagnosticCheck) => (
            <div
              key={chk.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  {getCategoryBadge(chk.category)}
                  <h4 className="font-bold text-sm text-slate-900">{chk.name}</h4>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-mono flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    延时: {chk.latency_ms} ms
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    正常 Reasonable
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <p className="text-xs text-slate-500 mb-2">{chk.description}</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 flex items-start space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 mr-1">检测结论:</span>
                    {chk.message}
                    {chk.details && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-3xs text-slate-500 font-mono">
                        {JSON.stringify(chk.details)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Raw JSON viewer */}
        {showRaw && result && (
          <div className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
