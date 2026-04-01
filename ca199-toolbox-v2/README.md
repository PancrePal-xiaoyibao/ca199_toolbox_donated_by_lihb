# CA199 Toolbox v2

新版前端重构工程。该目录用于承载新的 React 三 Tab 展示界面，不修改仓库根目录下的旧版 `index.html`。

## 目标

- 独立于旧版单文件页面
- 直接支持 `case-organizer` 导出的 `normalized/`
- 过渡期兼容 `legacy/`
- 提供 `病程总览 | 病情详情 | 病程摘要` 三个主标签页

## 开发

```bash
cd ca199-toolbox-v2
npm install
npm run dev
```

## 导入文件

优先选择以下文件：

- `indicators.csv`
- `medications.csv`
- `timeline_events.csv`
- `patient_summary.json`

过渡期也可导入：

- `data.csv`
- `medication.csv`
- `remarksline.csv`
