# 企业股权激励管理系统 (Equity Incentive Management System)

一个集公司股份估值配置、激励池动态核算、员工与组织架构管理、期权分期成熟（Vesting）、立即行权交割与报表台账导出于一体的企业级全栈股权激励治理平台。

---

## 🌟 核心功能模块

1. **公司股份与估值管理 (Company Shares & Valuation)**
   - 维护不同基准年度的总股本、投后估值、每股公允估值
   - 动态配置期权激励池（总股份数、股本占比、预留未分配股份与剩余可用配额）
   - 智能配额防溢出与实时平衡约束

2. **组织架构与部门管理 (Departments)**
   - 维护公司组织架构、部门代号、负责人及职能描述
   - 统计部门获授期权总额与激励员工人数

3. **员工激励档案 (Employees)**
   - 记录核心员工工号、部门归属、岗位职级、入职时间及在职状态
   - 实时统计累计获授期权、已成熟期权与成熟百分比

4. **期权授予计划与分期归属 (Grant Plans & Vesting)**
   - 灵活制定多年度授予方案与协议行权单价
   - 自动生成分期成熟节奏表（如 4 年每年成熟 25%）
   - 支持“立即触发成熟行权”与 30 秒周期后台自动成熟巡检引擎

5. **台账报表与财务导出 (Reports & Ledger)**
   - 员工期权合并总表与部门维度聚合
   - 每一笔成熟行权交割的明细流水台账（含行权金额、单价与生效日）
   - 支持一键导出 UTF-8 BOM 财务规范 CSV 文件

6. **全链路连接自检与诊断 (Diagnostics)**
   - 毫秒级 Express API 网关通信与健康探测
   - 数据原子持久化存储管道检测
   - 激励池配额平衡核算与外键级联完整性核验

---

## 🛠️ 技术架构

- **前端框架**: React 18 + TypeScript + Vite + Tailwind CSS
- **图标库**: Lucide React
- **后端引擎**: Express.js + tsx + esbuild
- **数据存储**: 基于原子级文件锁与快照持久化的结构化存储 (`data/equity_db.json`)
- **构建工具**: Vite + esbuild (Node.js CommonJS 打包输出)

---

## 🚀 本地开发与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器 (前后台一体)
```bash
npm run dev
```
开发服务器将运行在 `http://localhost:3000`。

### 3. 构建生产包
```bash
npm run build
```

### 4. 启动生产服务器
```bash
npm start
```

---

## 📦 推送到 GitHub 仓库

本项目已初始化 Git 仓库，并关联远程目标：
`https://github.com/tianfeng850/EquityIncentive.git` (分支: `main`)

在具备 GitHub 访问权限的环境中推送代码：
```bash
git push -u origin main
```
*提示：如需使用 Personal Access Token (PAT) 认证，可通过 `https://<TOKEN>@github.com/tianfeng850/EquityIncentive.git` 推送，或通过 AI Studio 界面右上角的「Export to GitHub」一键导出。*
