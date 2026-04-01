# Case Organizer 与 CA199 Toolbox 数据衔接方案

- 日期：2026-04-01
- 项目：Case Organizer / CA199 Toolbox
- 文档类型：数据衔接设计文档
- 当前阶段：过渡方案

## 1. 背景

当前两个项目的数据模型并不一致：

### 1.1 旧版 `ca199_toolbox`

当前页面 [index.html](/Users/qinxiaoqiang/Downloads/ca199_toolbox/index.html) 仍然基于手工加载的旧格式文件：

- `data.csv`
- `medication.csv`
- `remarksline.csv`

其交互模型是：

`加载几个 CSV -> 勾选指标 -> 生成图表`

### 1.2 新版 `case-organizer`

当前导出的是更标准的新结构：

- `indicators.csv`
- `medications.csv`
- `timeline_events.csv`
- `patient_summary.json`
- `standard_case.json`

因此，两边目前存在真实断裂。

## 2. 设计结论

采用：

`双层导出`

也就是：

1. 新结构继续作为长期主接口
2. 同时增加一个旧格式兼容导出层，专门给旧版 `ca199_toolbox` 使用

## 3. 单患者原则

本衔接方案建立在以下强约束上：

- `case-organizer` 只支持单患者病例目录
- `ca199_toolbox` 只读取单患者结果
- 不设计多患者混合加载

这样可以避免：

- 不同患者数据混合
- 旧前端错误地把多个病例拼成一张图
- 开源后被滥用成轻率的病例管理平台

## 4. 导出目录建议

建议导出目录结构如下：

```text
exports/
  normalized/
    indicators.csv
    medications.csv
    timeline_events.csv
    patient_summary.json
    standard_case.json
  legacy/
    data.csv
    medication.csv
    remarksline.csv
  printable/
  summaries/
```

## 5. 两层接口定义

### 5.1 `normalized/`

定位：

- 长期主接口
- 新版 `ca199_toolbox` 的直接输入

特点：

- 字段更稳定
- 语义更清楚
- 更容易支撑未来病程总览、病情详情、病程摘要

### 5.2 `legacy/`

定位：

- 过渡兼容层
- 旧版 `ca199_toolbox` 的输入

特点：

- 只用于兼容旧页面
- 不作为长期标准
- 明确和 `normalized/` 分离，避免模型污染

## 6. 旧格式映射建议

### 6.1 `legacy/data.csv`

来源：

- `normalized/indicators.csv`

目标字段建议映射为旧页面所需：

- `testTime`
- `indicatorName`
- `indicatorValue`

### 6.2 `legacy/medication.csv`

来源：

- `normalized/medications.csv`

目标字段建议映射为旧页面所需：

- `START_DATE`
- `END_DATE`
- `DRUG_NAME`
- `TAG`

### 6.3 `legacy/remarksline.csv`

来源：

- `normalized/timeline_events.csv`

可优先选择高价值事件生成，例如：

- 关键检查结论
- 治疗切换
- 重要医生意见
- 患者自述关键变化

目标字段建议映射为旧页面所需：

- `REMARKS_DATE`
- `REMARKS`
- `OFFSETX`
- `OFFSETY`

其中：

- `OFFSETX`
- `OFFSETY`

首版可以给默认值，不要求智能布局。

## 7. 版本策略

### 7.1 短期

`case-organizer export` 同时输出：

- `normalized/`
- `legacy/`

这样旧版 `ca199_toolbox` 不必立刻重写。

### 7.2 长期

新版 `ca199_toolbox` 直接读取：

- `normalized/indicators.csv`
- `normalized/medications.csv`
- `normalized/timeline_events.csv`
- `normalized/patient_summary.json`

当新版前端稳定后，再逐步淡出 `legacy/`。

## 8. 结论

当前最稳的方案不是强行让旧页面直接吃新结构，而是：

`新结构为主，legacy 兼容为辅`

同时明确：

- 只支持单患者
- 不做多患者管理
- 不把兼容层混进主模型
