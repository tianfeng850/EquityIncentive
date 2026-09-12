import {
  CompanyShare,
  ShareChangeLog,
  Department,
  Employee,
  GrantPlan,
  EquityRecord,
  SystemDiagnosticResult,
  DashboardStats
} from '../types.js';

// Base URL uses relative path to avoid CORS and localhost hardcoding issues in iframe / preview
const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  try {
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      return {
        success: false,
        error: `服务器返回了非JSON响应 (${res.status} ${res.statusText})。详情: ${text.substring(0, 100)}`
      };
    }

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || `请求失败 (${res.status})`
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: `数据解析失败: ${err.message}`
    };
  }
}

export const api = {
  // Health
  async checkHealth(): Promise<{ ok: boolean; latency: number; error?: string }> {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}/health`, { cache: 'no-store' });
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        return { ok: true, latency };
      }
      return { ok: false, latency, error: `服务状态响应码: ${res.status}` };
    } catch (err: any) {
      return { ok: false, latency: Math.round(performance.now() - start), error: err.message };
    }
  },

  // Dashboard stats
  async getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    const res = await fetch(`${BASE_URL}/stats`);
    return handleResponse<DashboardStats>(res);
  },

  // Company Shares
  async getShares(): Promise<{ success: boolean; data?: CompanyShare[]; error?: string }> {
    const res = await fetch(`${BASE_URL}/shares`);
    return handleResponse<CompanyShare[]>(res);
  },

  async getShareLogs(shareId?: string): Promise<{ success: boolean; data?: ShareChangeLog[]; error?: string }> {
    const url = shareId ? `${BASE_URL}/shares/logs?share_id=${encodeURIComponent(shareId)}` : `${BASE_URL}/shares/logs`;
    const res = await fetch(url);
    return handleResponse<ShareChangeLog[]>(res);
  },

  async addShare(payload: {
    year: number;
    valuation: number;
    total_shares: number;
    pool_shares?: number;
    pool_percentage?: number;
    reserved_shares?: number;
    share_price?: number;
    currency?: string;
    status?: string;
    notes?: string;
    overwrite?: boolean;
  }): Promise<{ success: boolean; data?: CompanyShare; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-name': '系统管理员'
      },
      body: JSON.stringify(payload)
    });
    return handleResponse<CompanyShare>(res);
  },

  async updateShare(id: string, payload: Partial<CompanyShare>): Promise<{ success: boolean; data?: CompanyShare; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/shares/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-operator-name': '系统管理员'
      },
      body: JSON.stringify(payload)
    });
    return handleResponse<CompanyShare>(res);
  },

  async deleteShare(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/shares/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(res);
  },

  // Departments
  async getDepartments(): Promise<{ success: boolean; data?: Department[]; error?: string }> {
    const res = await fetch(`${BASE_URL}/departments`);
    return handleResponse<Department[]>(res);
  },

  async addDepartment(dept: { name: string; code?: string; manager_name?: string; description?: string }): Promise<{ success: boolean; data?: Department; error?: string }> {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept)
    });
    return handleResponse<Department>(res);
  },

  async updateDepartment(id: string, dept: Partial<Department>): Promise<{ success: boolean; data?: Department; error?: string }> {
    const res = await fetch(`${BASE_URL}/departments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept)
    });
    return handleResponse<Department>(res);
  },

  async deleteDepartment(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/departments/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(res);
  },

  // Employees
  async getEmployees(): Promise<{ success: boolean; data?: Employee[]; error?: string }> {
    const res = await fetch(`${BASE_URL}/employees`);
    return handleResponse<Employee[]>(res);
  },

  async addEmployee(emp: Partial<Employee>): Promise<{ success: boolean; data?: Employee; error?: string }> {
    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp)
    });
    return handleResponse<Employee>(res);
  },

  async updateEmployee(id: string, emp: Partial<Employee>): Promise<{ success: boolean; data?: Employee; error?: string }> {
    const res = await fetch(`${BASE_URL}/employees/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emp)
    });
    return handleResponse<Employee>(res);
  },

  async deleteEmployee(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/employees/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return handleResponse<void>(res);
  },

  // Plans
  async getPlans(): Promise<{ success: boolean; data?: GrantPlan[]; error?: string }> {
    const res = await fetch(`${BASE_URL}/plans`);
    return handleResponse<GrantPlan[]>(res);
  },

  async addPlan(plan: any): Promise<{ success: boolean; data?: GrantPlan; error?: string }> {
    const res = await fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    return handleResponse<GrantPlan>(res);
  },

  async vestCycle(cycleId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/plans/vest-cycle/${encodeURIComponent(cycleId)}`, {
      method: 'POST'
    });
    return handleResponse<any>(res);
  },

  // Records
  async getRecords(): Promise<{ success: boolean; data?: EquityRecord[]; error?: string }> {
    const res = await fetch(`${BASE_URL}/records`);
    return handleResponse<EquityRecord[]>(res);
  },

  // Diagnostic
  async getDiagnostic(): Promise<{ success: boolean; data?: SystemDiagnosticResult; error?: string }> {
    const res = await fetch(`${BASE_URL}/diagnostic`);
    return handleResponse<SystemDiagnosticResult>(res);
  }
};
