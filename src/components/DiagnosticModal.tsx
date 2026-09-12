import React, { useState, useEffect } from 'react';
import {
  X,
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
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { SystemDiagnosticResult, SystemDiagnosticCheck } from '../types.js';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiagnosticComplete?: () => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onDiagnosticComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SystemDiagnosticResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getDiagnostic();
      if (res.success && res.data) {
        setResult(res.data);
        if (onDiagnosticComplete) onDiagnosticComplete();
      } else {
        setErrorMsg(res.error || '诊断请求失败');
      }
    } catch (err: any) {
      setErrorMsg(`网络连接检测失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'database':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'math':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'relationship':
        return <GitFork className="w-4 h-4 text-emerald-600" />;
      default:
        return <Server className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            正常 Reasonable
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            注意 Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            异常 Error
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">系统全链路连接与合理性深度自检</h2>
              <p className="text-xs text-slate-400">检查所有 API 路由、数据存储管道、关系映射及股权平衡合理性</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Status summary banner */}
          {result && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                result.overall_status === 'healthy'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : result.overall_status === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {result.overall_status === 'healthy' ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                ) : result.overall_status === 'warning' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600" />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {result.overall_status === 'healthy'
                      ? '所有连接与业务逻辑均为【正常、合理】'
                      : result.overall_status === 'warning'
                      ? '检测到部分连接或数据项需关注'
                      : '检测到连接或数据逻辑存在异常'}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    共检测 {result.summary.total_checks} 个核心模块 · 通过: {result.summary.passed} · 警告: {result.summary.warnings} · 异常: {result.summary.errors}
                  </p>
                </div>
              </div>
              <button
                onClick={runCheck}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>重新检测</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Detailed checks list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              逐项连接与完整性检测清单 (Verification Items)
            </h4>

            {loading && !result ? (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-sm">正在实时探测系统各模块连接通道与数据合理性...</p>
              </div>
            ) : (
              result?.checks.map((chk: SystemDiagnosticCheck) => (
                <div
                  key={chk.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-md bg-slate-100">
                        {getCategoryIcon(chk.category)}
                      </div>
                      <span className="font-semibold text-sm text-slate-900">{chk.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-0.5" />
                        {chk.latency_ms}ms
                      </span>
                      {getStatusBadge(chk.status)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 ml-7 mb-1">{chk.description}</p>
                  <div className="ml-7 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                    <span className="text-slate-400 mr-1">检测结论:</span>
                    {chk.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>系统核心架构：Node.js Express + JSON ACID Persistence + Vite SPA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            完成并返回
          </button>
        </div>
      </div>
    </div>
  );
};
