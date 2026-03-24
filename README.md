# deepcfo
每个小老板都有一个深度AI CFO，"会说话就能管财税"

## DeepCFO Demo V1.3
本仓库提供了一个可直接运行的 **V1.3 业务逻辑前端 Demo**，覆盖以下链路：

- 冷启动：统一社会信用代码触发企业信息自动填充
- 数据初始化：旧系统导入 / 银行流水导入 / 从零开始
- AI 对话记账：口语录入、recentTransactions 指代消解（“那笔”）
- 发票 OCR 全流程：5 步识别 + 7 项自动关联
- 凭证状态机：草稿 → 待确认 → 已入账 → 已申报 → 已归档

> 说明：当前为演示系统，OCR 与企业查询使用本地模拟数据，方便快速验证产品流程。

## 快速启动
```bash
python3 demo_server.py
```

打开浏览器访问：

- http://localhost:8000/index.html

## 文件结构
- `index.html`：Demo 主界面与全部业务逻辑（前端内置）
- `demo_server.py`：本地静态服务启动脚本
