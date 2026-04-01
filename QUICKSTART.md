# QUICKSTART

## 项目简介

当前整体方案由两个项目配合完成：

- `case-organizer`
  负责患者资料整理、结构化提取、导出标准病程数据
- `ca199-toolbox-v2`
  负责病程展示，采用 React 三 Tab 界面：
  `病程总览 | 病情详情 | 病程摘要`

旧版根目录 [index.html](/Users/qinxiaoqiang/Downloads/ca199_toolbox/index.html) 继续保留，只作为兼容参考，不再作为主开发入口。

## 当前开发原则

- `normalized` 是唯一主接口
- 推荐导入文件是：
  `exports/normalized/ca199_toolbox_bundle.json`
- `legacy` 仅保留兼容，不再作为后续设计前提
- `case-organizer` 和 `ca199_toolbox` 应分别独立演进，靠导出接口打通

## 开发入口

### 1. case-organizer

本地目录：
[case-organizer](/Users/qinxiaoqiang/Downloads/ca199_toolbox/case-organizer)

职责：
- 建立单患者目录
- 接收图片/PDF/文本等资料
- 调用解析流程
- 导出 `normalized/`

当前推荐导出入口：
- `exports/normalized/ca199_toolbox_bundle.json`

### 2. ca199-toolbox-v2

本地目录：
[ca199-toolbox-v2](/Users/qinxiaoqiang/Downloads/ca199_toolbox/ca199-toolbox-v2)

职责：
- 导入 `case-organizer` 的导出结果
- 展示病程总览、病情详情、病程摘要
- 逐步替代旧版单文件页面

本地开发：

```bash
cd /Users/qinxiaoqiang/Downloads/ca199_toolbox/ca199-toolbox-v2
npm install
npm run dev
```

## 最小闭环

团队成员后续联调，按这个顺序：

1. 在 `case-organizer` 整理病例资料
2. 导出 `exports/normalized/ca199_toolbox_bundle.json`
3. 在 `ca199-toolbox-v2` 导入该文件
4. 验证三 Tab 展示是否正确

## 设计文档路径

核心设计文档都在：
[docs/product](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product)

建议优先阅读这些：

- [2026-03-31-ca199-toolbox-redesign.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-03-31-ca199-toolbox-redesign.md)
- [2026-04-01-ca199-toolbox-frontend-design-spec.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-ca199-toolbox-frontend-design-spec.md)
- [2026-04-01-ca199-toolbox-frontend-implementation-plan.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-ca199-toolbox-frontend-implementation-plan.md)
- [2026-04-01-case-organizer-project-spec.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-case-organizer-project-spec.md)
- [2026-04-01-case-organizer-patient-wizard-spec.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-case-organizer-patient-wizard-spec.md)
- [2026-04-01-case-organizer-implementation-plan.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-case-organizer-implementation-plan.md)
- [2026-04-01-case-organizer-ca199toolbox-bridge-spec.md](/Users/qinxiaoqiang/Downloads/ca199_toolbox/docs/product/2026-04-01-case-organizer-ca199toolbox-bridge-spec.md)

## 团队后续开发建议

后续开发顺序建议固定为：

1. 先稳定 `case-organizer -> normalized bundle` 导出
2. 再继续收紧 `ca199-toolbox-v2` 的主界面与导入体验
3. 最后再考虑删减 `legacy`、弱化旧版 `index.html`

不要反过来先围着旧版接口开发。

## 版本说明

当前新版前端工作分支：

- `feature/ca199-toolbox-v2`

如果后续继续推进 `ca199-toolbox-v2`，建议都在该分支或其后续分支上继续开发，不直接在 `main` 上混改。
