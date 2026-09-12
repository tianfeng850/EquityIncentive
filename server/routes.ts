import { Router, Request, Response } from 'express';
import { db } from './db.js';

export const apiRouter = Router();

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'equity-incentive-management-system',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime())
  });
});

// 2. Dashboard statistics
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Company shares CRUD
apiRouter.get('/shares', (req: Request, res: Response) => {
  try {
    const shares = db.getCompanyShares();
    res.json({ success: true, data: shares });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/shares/logs', (req: Request, res: Response) => {
  try {
    const shareId = req.query.share_id as string | undefined;
    const logs = db.getShareLogs(shareId);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/shares/:id', (req: Request, res: Response) => {
  try {
    const share = db.getShareById(req.params.id);
    if (!share) {
      return res.status(404).json({ success: false, error: '未找到指定年度股份记录' });
    }
    res.json({ success: true, data: share });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CRITICAL: POST /api/shares - Adding company share info
apiRouter.post('/shares', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    console.log('[API] Received POST /api/shares with body:', body);

    const result = db.addCompanyShare(body, (req.headers['x-operator-name'] as string) || '管理员');
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || '添加股份信息失败'
      });
    }

    res.status(201).json({
      success: true,
      message: `成功保存 ${result.data?.year} 年度公司股份信息`,
      data: result.data
    });
  } catch (err: any) {
    console.error('[API] Error in POST /api/shares:', err);
    res.status(500).json({
      success: false,
      error: `添加股份信息发生服务器内部错误: ${err.message}`
    });
  }
});

apiRouter.put('/shares/:id', (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const result = db.updateCompanyShare(req.params.id, body, (req.headers['x-operator-name'] as string) || '管理员');
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || '更新股份信息失败'
      });
    }

    res.json({
      success: true,
      message: '公司股份配置已成功更新',
      data: result.data
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `更新股份信息错误: ${err.message}`
    });
  }
});

apiRouter.delete('/shares/:id', (req: Request, res: Response) => {
  try {
    const result = db.deleteCompanyShare(req.params.id);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || '删除股份配置失败'
      });
    }

    res.json({
      success: true,
      message: '股份配置删除成功'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `删除股份信息错误: ${err.message}`
    });
  }
});

// 4. Departments CRUD
apiRouter.get('/departments', (req: Request, res: Response) => {
  try {
    const depts = db.getDepartments();
    res.json({ success: true, data: depts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/departments', (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ success: false, error: '部门名称不能为空' });
    }
    const record = db.addDepartment(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/departments/:id', (req: Request, res: Response) => {
  try {
    const record = db.updateDepartment(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ success: false, error: '部门不存在' });
    }
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/departments/:id', (req: Request, res: Response) => {
  try {
    const result = db.deleteDepartment(req.params.id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, message: '部门已删除' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Employees CRUD
apiRouter.get('/employees', (req: Request, res: Response) => {
  try {
    const employees = db.getEmployees();
    res.json({ success: true, data: employees });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/employees', (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ success: false, error: '员工姓名不能为空' });
    }
    const record = db.addEmployee(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/employees/:id', (req: Request, res: Response) => {
  try {
    const record = db.updateEmployee(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ success: false, error: '员工不存在' });
    }
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/employees/:id', (req: Request, res: Response) => {
  try {
    const result = db.deleteEmployee(req.params.id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, message: '员工已删除' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Grant Plans & Cycles CRUD
apiRouter.get('/plans', (req: Request, res: Response) => {
  try {
    const plans = db.getGrantPlans();
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/plans', (req: Request, res: Response) => {
  try {
    const result = db.addGrantPlan(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.status(201).json({ success: true, data: result.data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/plans/vest-cycle/:cycleId', (req: Request, res: Response) => {
  try {
    const result = db.vestCycleImmediately(req.params.cycleId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({
      success: true,
      message: '期权周期已成功手动成熟行权',
      data: result.data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Equity Records (Vested & Exercised History)
apiRouter.get('/records', (req: Request, res: Response) => {
  try {
    const records = db.getEquityRecords();
    res.json({ success: true, data: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Connection & Diagnostic Engine
apiRouter.get('/diagnostic', (req: Request, res: Response) => {
  try {
    const diagnostic = db.runDiagnostic();
    res.json({ success: true, data: diagnostic });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
