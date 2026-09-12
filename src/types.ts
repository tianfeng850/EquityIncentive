export interface CompanyShare {
  id: string;
  year: number;
  registered_capital?: number; // 公司注册资本（元）
  valuation: number; // 总估值
  total_shares: number; // 总股本
  pool_shares: number; // 激励池总股数
  pool_percentage: number; // 激励池比例(%)
  reserved_shares: number; // 预留股份
  granted_shares: number; // 已授予股数 (动态统计)
  remaining_pool_shares: number; // 激励池剩余可用股数
  share_price: number; // 每股基准价值
  currency: string; // CNY, USD, HKD 等
  status: 'active' | 'draft' | 'archived';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ShareChangeLog {
  id: string;
  share_id: string;
  year: number;
  change_type: 'create' | 'update' | 'pool_adjust' | 'valuation_adjust';
  details: string;
  old_values?: Partial<CompanyShare>;
  new_values?: Partial<CompanyShare>;
  operator: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager_name: string;
  description: string;
  employee_count?: number;
  total_granted_shares?: number;
  created_at: string;
}

export interface Employee {
  id: string;
  employee_no: string;
  name: string;
  department_id: string;
  department_name: string;
  position: string;
  email: string;
  phone: string;
  hire_date: string;
  status: 'active' | 'terminated';
  total_granted_shares: number;
  vested_shares: number;
  unvested_shares: number;
  plan_count?: number;
  created_at: string;
}

export interface GrantCycle {
  id: string;
  plan_id: string;
  cycle_no: number;
  vest_date: string;
  vest_percentage: number;
  vest_shares: number;
  status: 'pending' | 'vested' | 'forfeited';
  vest_conditions: string;
  vested_at?: string;
}

export interface GrantPlan {
  id: string;
  plan_no: string;
  employee_id: string;
  employee_name: string;
  employee_no: string;
  department_id: string;
  department_name: string;
  share_year: number;
  grant_mode: 'shares' | 'percentage' | 'amount';
  total_shares: number;
  grant_price: number;
  total_value: number;
  grant_date: string;
  lockup_months: number;
  status: 'active' | 'completed' | 'cancelled';
  notes: string;
  cycles: GrantCycle[];
  created_at: string;
}

export interface EquityRecord {
  id: string;
  record_no: string;
  plan_id: string;
  plan_no: string;
  cycle_id: string;
  cycle_no: number;
  employee_id: string;
  employee_name: string;
  department_name: string;
  vest_date: string;
  shares: number;
  exercise_price: number;
  total_amount: number;
  status: 'vested' | 'exercised';
  created_at: string;
}

export interface SystemDiagnosticCheck {
  id: string;
  name: string;
  category: 'api' | 'database' | 'relationship' | 'math';
  status: 'ok' | 'warning' | 'error';
  latency_ms: number;
  description: string;
  message: string;
  details?: Record<string, any>;
}

export interface SystemDiagnosticResult {
  overall_status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  checks: SystemDiagnosticCheck[];
  summary: {
    total_checks: number;
    passed: number;
    warnings: number;
    errors: number;
  };
}

export interface DashboardStats {
  current_share?: CompanyShare;
  total_employees: number;
  active_employees: number;
  total_departments: number;
  total_plans: number;
  total_granted_shares: number;
  total_vested_shares: number;
  total_unvested_shares: number;
  incentive_pool_usage_pct: number;
  total_exercise_value: number;
}
