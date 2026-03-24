# DeepCFO — 小微企业 AI 财税助手

> 让每一个小微企业主都能轻松管好公司的钱 💰

[![Deploy](https://img.shields.io/badge/Live%20App-6incscj4yd12-blue)](https://6incscj4yd12.space.minimaxi.com)
[![Tech](https://img.shields.io/badge/React%2018-61DAFB?logo=react)](https://react.dev)
[![Tech](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tech](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![MIT](https://img.shields.io/badge/MIT License-green)](LICENSE)

---

## 🎯 产品定位

DeepCFO 是一款面向 **1-20人小微企业** 的 AI 财税管理工具。

目标用户：创业者、个体工商户、小微企业主
核心价值：AI 驱动的智能记账 + 税务申报 + 工资管理 + 财务分析

---

## ✨ 功能模块

### Sprint 0 — 企业注册激活
- 3步注册流程（营业执照 → 企业信息 → 自动识别地区）
- 手机号验证激活

### Sprint 1 — AI 智能记账
- 文字/语音描述 → 自动生成记账凭证
- 收支分类（收入/支出/转账/工资）
- 历史凭证查询与管理

### Sprint 2 — 税务闭环
- 增值税申报（一般纳税人/小规模）
- 企业所得税预缴
- AI 生成申报草稿
- 报税截图分享（支持微信/WPS/文件分享）

### Sprint 3 — 工资管理
- 员工信息管理（3步向导：基础信息 → 银行账户 → 社保公积金）
- 月度工资发放
- 工资条生成与发送

### Sprint 4 — 财务报表
- 资产负债表
- 利润表
- 现金流量表
- AI 智能解读

### Sprint 5 — 首页仪表盘（开发中）
- KPI 概览（余额/收入/支出/净利润）
- 待办预警列表
- AI 建议区
- 操作日志

### Sprint 6 — 合同管理
- 合同列表与详情
- 付款计划管理
- 到期提醒

### Sprint 7 — 工资独立 Tab
- 独立底部 Tab（员工/发工资/工资条）
- 员工设置向导（必填3步）
- 月度工资发放流程
- 工资条历史

### Sprint 8 — UI 全面升级
- **配色**：青色科技风（#00696f 深青 + #00f2ff 荧光青）
- **字体**：Space Grotesk（标题） + Inter（正文）
- **导航**：4Tab + 浮动AI按钮 + 桌面端侧边栏
- **卡片系统**：玻璃效果 + 渐变主按钮

### Sprint 9 — 发票 OCR（规划中）
- 拍照上传发票
- AI 自动识别票面信息
- 自动生成记账凭证

### Sprint 10 — 合规预警（规划中）
- 税务合规规则引擎
- 申报截止日提醒
- 风险预警推送

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS 3 + Tailwind Animate |
| 状态管理 | Zustand |
| 路由 | React Router DOM v6 |
| AI 对话 | Groq API (Llama-4) |
| 图表 | 内嵌 SVG（轻量） |
| PDF 生成 | jsPDF + html2canvas |
| 图标 | Lucide React + Material Symbols |
| 字体 | Space Grotesk + Inter + Noto Sans SC |

---

## 📁 项目结构

```
deepcfo-v4/
├── src/
│   ├── App.tsx                    # 主入口，路由 + 布局
│   ├── index.css                  # 全局样式
│   ├── components/
│   │   ├── TabBar.tsx             # 底部导航栏
│   │   ├── AIFloatingButton.tsx   # 浮动AI按钮
│   │   ├── AIPanel.tsx            # AI对话浮窗面板
│   │   ├── DesktopLayout.tsx      # 桌面端侧边栏
│   │   └── ErrorBoundary.tsx      # 错误边界
│   ├── features/
│   │   ├── register/              # Sprint 0: 注册
│   │   ├── onboarding/           # Sprint 0: 初始化引导
│   │   ├── activation/            # Sprint 0: 激活
│   │   ├── home/                  # Sprint 5: 首页仪表盘
│   │   ├── chat/                  # Sprint 1: AI聊天
│   │   ├── tax/                   # Sprint 2: 报税
│   │   ├── finance/               # Sprint 4: 财务报表
│   │   ├── salary/                # Sprint 3/7: 工资管理
│   │   ├── vouchers/              # Sprint 1: 凭证管理
│   │   └── me/                    # Sprint 7: 我的（含工资入口）
│   ├── lib/
│   │   ├── chatEngine.ts          # AI对话引擎
│   │   ├── taxEngine.ts           # 税务计算引擎
│   │   ├── taxPDF.ts              # PDF生成+分享
│   │   ├── financeReport.ts       # 财务报表生成
│   │   └── enterpriseApi.ts       # 企业数据API
│   ├── store/
│   │   └── useAppStore.tsx        # 全局状态
│   └── types/
│       └── index.ts               # TypeScript类型定义
├── public/
├── tailwind.config.js             # Tailwind配置 + 配色系统
├── index.html
└── package.json
```

---

## 🚀 本地开发

```bash
cd deepcfo-v4

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

---

## 🔑 环境变量

```env
VITE_GROQ_API_KEY=your_groq_api_key   # AI对话能力
```

---

## 🎨 设计规范

配色系统基于 Google Material Design 3 + 青色科技风：

| 用途 | 色值 |
|------|------|
| 主色 | `#00696f` 深青 |
| 强调色 | `#00f2ff` 荧光青 |
| 正向色 | `#006947` 深绿 |
| 警示色 | `#705d00` 琥珀 |
| 危险色 | `#ba1a1a` 红色 |
| 背景色 | `#f7f9fb` 微蓝白 |
| 卡片色 | `#ffffff` 纯白 |

详见：[DeepCFO Sprint 8 UI 设计规范](./docs/design-spec.md)

---

## 📄 开源协议

MIT License © DeepCFO Team

---

## 🔗 相关链接

- **在线演示**: https://6incscj4yd12.space.minimaxi.com
- **产品规划**: /docs/产品迭代计划V2.md
- **设计规范**: /docs/design-spec.md
