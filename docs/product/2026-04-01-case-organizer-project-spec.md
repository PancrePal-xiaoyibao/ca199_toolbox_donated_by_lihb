# Case Organizer 项目定义与接口规范

- 日期：2026-04-01
- 项目：Case Organizer
- 文档类型：项目设计文档
- 当前阶段：方案确认稿

## 1. 项目定位

`case-organizer` 是一个独立于 `ca199_toolbox` 的病情整理项目。

它的职责不是展示病情，而是把杂乱的患者资料整理成可确认、可追溯、可导出的结构化病程数据。

项目定位：

- 面向患者和家属的病情整理引擎
- 面向本地目录的文件扫描与增量处理工具
- 面向后续可视化产品的标准化数据提供者

它不直接承担：

- 最终就医展示界面
- 医生主视图交互
- 自动医学判断与治疗建议

## 2. 与 ca199_toolbox 的关系

两个项目应明确解耦：

### 2.1 case-organizer

负责：

1. 扫描指定目录
2. 识别支持的文件类型
3. 调用 MinerU 或本地解析提取内容
4. 生成候选事实
5. 提供人工确认入口
6. 导出标准化病程数据

### 2.2 ca199_toolbox

负责：

1. 读取标准化病程数据
2. 呈现 `病程总览`
3. 呈现 `病情详情`
4. 呈现 `病程摘要`
5. 服务就医现场展示与沟通

### 2.3 推荐接口关系

首版使用：

`文件级接口`

即：

`case-organizer -> 标准化文件目录 -> ca199_toolbox`

而不是首版就做 API。

原因：

1. 本地优先，更符合用户实际场景
2. 调试成本低
3. 错误边界清楚
4. 更适合先稳定数据模型

## 3. 首版目标

首版要完成的最小闭环：

1. 用户指定一个患者案例目录路径
2. 系统扫描目录中的常见文件
3. 对支持类型进行内容提取
4. 生成候选事实数据
5. 用户通过本地 Web 页校对
6. 导出 `ca199_toolbox` 可直接消费的标准文件

首版成功标准：

1. 不要求用户手工整理 CSV 才能开始
2. 对常见检查材料具备稳定的基础提取能力
3. 所有结构化结果都可追溯到来源文件
4. 用户能在校对后得到可展示的病程数据

### 3.1 单患者边界

`case-organizer` 首版明确采用：

`1 人 1 用`

也就是：

- 一个病例目录只对应一个患者
- 不支持多患者列表
- 不支持多患者混合管理
- 不支持批量患者处理

原因：

1. 医疗隐私边界更清楚
2. 更符合患者和家属的真实使用方式
3. 降低资料混放风险
4. 避免产品演变成病例管理后台

## 3.2 案例目录约定

首版默认采用：

`一个患者 = 一个案例目录`

推荐目录结构：

```text
patient_cases/
  张三/
    raw/
      01_基本资料/
      02_诊断报告书/
      03_影像报告/
      04_病理与基因/
      05_检验检查/
        01_肿瘤标志物/
        02_血常规/
        03_肝肾功能/
        04_凝血/
        05_炎症指标/
        06_体液检查_尿便常规/
        07_其他检验/
      06_处方与用药/
      07_个人病情记录/
      08_手术与住院资料/
      99_待分类/
    workspace/
    exports/
      normalized/
      legacy/
      printable/
      summaries/
  李四/
    raw/
    workspace/
    exports/
```

也可以使用匿名或编号方式：

```text
patient_cases/
  patient_001/
    raw/
    workspace/
    exports/
```

各目录职责：

- `raw/`：患者或家属手工放入的原始资料目录，必须按模板子目录分类
- `workspace/`：系统运行时生成的索引、中间结果、候选结构和标准化输出
- `exports/`：面向打印、共享或下游系统消费的导出目录

设计原则：

1. 不要求用户逐个上传文件
2. 用户只需要把材料放入 `raw/`
3. 系统对案例目录做递归扫描和增量处理
4. 不同患者必须使用不同案例目录，避免资料混淆
5. 系统不允许把输出文件写回 `raw/`

目录初始化方式：

- `CLI` 初始化目录树
- `Web UI` 初始化目录树
- 两者生成完全相同的目录模板

CLI 推荐用法：

```bash
case-organizer init /path/to/patient_cases/张三
case-organizer scan /path/to/patient_cases/张三
case-organizer review /path/to/patient_cases/张三/workspace
case-organizer export /path/to/patient_cases/张三/workspace
```

如果用户传入的是案例目录而不是 `raw/` 目录，则 `scan` 默认：

- 输入来自 `<案例目录>/raw`
- 输出写入 `<案例目录>/workspace`

从而形成稳定约定：

- 输入来自 `<案例目录>/raw`
- 系统产物写入 `<案例目录>/workspace`
- 导出结果进入 `<案例目录>/exports`

其中导出目录建议至少包含：

- `exports/normalized/`：新标准结构，作为长期主接口
- `exports/legacy/`：旧版 `ca199_toolbox` 兼容文件
- `exports/printable/`：打印物
- `exports/summaries/`：摘要物

## 4. 输入范围

首版必须支持以下输入类型：

- 图像：`jpg`, `jpeg`, `png`, `webp`
- 文档：`pdf`
- 文本：`txt`, `md`
- 表格：`xls`, `xlsx`, `csv`
- 文档：`doc`, `docx`

### 4.1 处理策略

不为每种格式设计完全不同的业务流程，而采用统一提取原则：

#### 本地直读

- `txt`
- `md`
- `csv`

#### MinerU 优先

- `pdf`
- `jpg`
- `jpeg`
- `png`
- `webp`
- `doc`
- `docx`
- `xls`
- `xlsx`

设计原则：

- 能直读的格式直接读取
- 其余常见格式优先通过 MinerU API 提取
- 不在首版引入复杂的多解析器竞争机制

## 5. OCR 与解析策略

### 5.1 主方案

首版主解析后端采用：

`MinerU API`

理由：

1. 你已有实际开发经验
2. 支持常见文档和图片格式
3. 环境变量配置即可使用
4. 不需要本地部署复杂 OCR 依赖
5. 更适合快速形成稳定闭环

### 5.2 备用方案

`PaddleOCR` 可保留为后续备用能力，但不进入首版主链路。

原因：

1. 本地部署复杂度更高
2. 推理环境和依赖较重
3. 当前首要问题不是“多引擎兼容”，而是“先把主链路稳定”

### 5.3 复用建议

`mineru-batch` 推荐复用：

- API 客户端
- 批量上传和轮询逻辑
- 结果下载与解压逻辑

`skill-report-genie` 推荐复用：

- 文件索引与去重思想
- 增量处理思想
- 汇总结构设计经验

不建议复用：

- 多源 RAG 检索流程
- 多 Agent 串联分析
- 自动医学报告生成主链路

### 5.4 MinerU 结果处理规则

MinerU 的返回结果不是单一文件，而是一个 zip 包，解压后通常包含：

- `full.md`
- `content_list_v2.json`
- `*_content_list.json`
- `layout.json`
- `*_model.json`
- `*_origin.pdf`
- `images/`
- 其他中间文件

因此系统必须明确：

`不允许在业务逻辑里临时猜测使用哪个结果文件`

MinerU 结果处理应拆为三个子步骤：

#### 第一步：下载与解压

- 下载 `result.zip`
- 解压到当前任务目录
- 扫描解压后的文件树

#### 第二步：结果发现

通过固定规则识别主结果文件：

##### 主文本文件优先级

1. `full.md`
2. 其他 `.md`
3. 无

##### 主结构化文件优先级

1. `content_list_v2.json`
2. `*_content_list.json`
3. `layout.json`
4. `*_model.json`
5. 无

#### 第三步：归一化

生成统一的 `DocumentEnvelope`，并生成：

`extraction_manifest.json`

建议字段：

- `job_id`
- `source_file`
- `result_zip_path`
- `extract_dir`
- `primary_text_path`
- `primary_structured_path`
- `layout_path`
- `origin_pdf_path`
- `asset_paths`
- `detected_files`
- `status`
- `resolver_version`

系统后续模块只允许消费 `extraction_manifest.json` 和 `DocumentEnvelope`，不直接扫描 MinerU 结果目录。

### 5.5 MD 与 JSON 的使用原则

MinerU 结果中：

- `md` 更适合语义抽取
- `json` 更适合结构化证据和追溯

因此首版规则应明确为：

`MD 主语义，JSON 主证据，Manifest 主入口`

#### 优先从 MD 抽取

- 诊断描述
- 医生意见
- 病理结论
- 影像总结
- 出院记录
- 病程叙事

#### 优先参考 JSON

- 表格
- 指标列表
- 页码定位
- 版面块信息
- 表头/单元格关系
- 复杂表格中的数值和单位

系统不应直接把 MinerU 原始 JSON 作为唯一事实来源，而应采用：

- Markdown 作为主文本输入
- JSON 作为结构化证据层和校验层
- 原始 zip 和解压目录作为追溯层

## 6. CLI + Web 分工

首版采用：

`方案 A：CLI 作为生产引擎，Web 作为校对界面`

### 6.1 CLI 职责

CLI 负责：

1. 接收目录路径
2. 扫描文件
3. 去重与增量检测
4. 调用 MinerU / 本地直读
5. 生成候选 JSON
6. 导出标准化数据
7. 启动 Web Review

CLI 是首版主入口。

### 6.2 Web Review 职责

Web 负责：

1. 展示候选事实
2. 让用户确认和修正
3. 让用户补充患者语言
4. 标记关键事件
5. 最终确认导出

Web 不负责：

1. 重型解析
2. 文件扫描
3. 大规模批处理调度

### 6.3 为什么这样分工

优点：

1. 批处理能力和 UI 能力解耦
2. CLI 易于稳定和自动化
3. Web 更聚焦于人工确认
4. 便于后续独立演进

## 7. 核心数据流

首版推荐数据流如下：

```text
指定目录
  ↓
文件扫描
  ↓
文件索引 / 去重 / 增量检测
  ↓
内容提取
  ├─ md/txt/csv 本地直读
  └─ 其他常见格式走 MinerU
  ↓
DocumentEnvelope
  ↓
候选事实抽取
  ↓
本地 Web Review 确认
  ↓
标准化导出
  ↓
ca199_toolbox 读取展示
```

## 8. 内部数据层次

为避免“提取”和“分析”混在一起，建议内部只保留三层：

### 8.1 原始层

保存原始输入文件引用和基础元数据。

例如：

- 文件路径
- 文件 hash
- 文件类型
- 修改时间

### 8.2 提取层

把解析结果统一为 `DocumentEnvelope`。

建议字段：

- `file_id`
- `file_path`
- `file_type`
- `extract_status`
- `ocr_used`
- `result_zip_path`
- `primary_text_path`
- `primary_structured_path`
- `layout_path`
- `origin_pdf_path`
- `text_content`
- `page_texts`
- `tables`
- `attachments`
- `source_meta`

### 8.3 事实层

从 `DocumentEnvelope` 中提取候选事实。

建议字段：

- 日期
- 检查类型
- 指标名
- 数值
- 单位
- 参考范围
- 治疗名称
- 医生意见原文
- 患者备注原文
- 来源文件
- 置信度

注意：

首版只做“事实提取”，不做“病情判断”。

## 8.1 标准输出规范来源

`case-organizer` 的标准输出结构应以病例模板 doc/docx 为统一规范来源，而不是以当前页面截图或临时弹窗为准。

当前参考模板包括：

- [病例模板，建议整理后打印使用.doc](/Users/qinxiaoqiang/Downloads/skill-report-genie/reference/病例模板，建议整理后打印使用.doc)
- [病 情 介 绍.doc](/Users/qinxiaoqiang/Downloads/skill-report-genie/reference/病%20情%20介%20绍.doc)

设计原则：

1. 模板是输出规范的主来源
2. 前端页面只是在标准病情结构之上的一种展示方式
3. 病程概述弹窗不能反向定义病情数据结构

## 8.4 标准病情结构

为了覆盖病例模板中的关键信息，内部标准病情结构建议至少包含以下模块：

```json
{
  "patient_profile": {},
  "diagnosis": {},
  "pathology": {},
  "genomics": [],
  "lab_results": [],
  "tumor_markers": [],
  "treatments": [],
  "imaging_studies": [],
  "clinical_events": [],
  "current_status": {},
  "consult_questions": [],
  "source_documents": []
}
```

### patient_profile

- 姓名
- 年龄
- 性别
- 电话
- 身高
- 体重
- 病历号/就诊号

### diagnosis

- 主要病名
- 分期
- 初诊日期
- 当前疾病阶段
- 手术摘要

### pathology

- 组织学类型
- 分化程度
- 切缘状态
- 神经侵犯
- 脉管癌栓
- 淋巴结状态
- 免疫组化结果

### genomics

每份基因报告一条，建议包含：

- 检测日期
- 检测机构
- 主要变异
- MSS/TMB/PD-L1 等结果
- 原文摘要
- `source_file`

### tumor_markers

每次肿瘤标志物检测一条，建议包含：

- 日期
- 指标名称
- 数值
- 单位
- 参考范围
- 异常状态
- `source_file`

### treatments

按治疗阶段建模，而不是按每次输液建模，建议包含：

- `phase_id`
- `regimen_name`
- `start_date`
- `end_date`
- `intent`
- `cycles`
- `drugs`
- `response_summary`
- `adverse_events`
- `source_files`

### imaging_studies

每次影像一条，建议包含：

- 日期
- 检查方式
- 检查部位
- 医院
- 所见
- 诊断意见
- 对比说明
- `source_file`

### clinical_events

关键病程节点，建议包含：

- `event_date`
- `event_type`
- `title`
- `description`
- `doctor_note`
- `patient_note`
- `next_step`
- `related_sources`

### current_status

- 当前体力状态
- 饮食
- 睡眠
- 体重变化
- 大小便
- 当前毒副作用
- 当前主要问题

### consult_questions

- 问题内容
- 优先级
- 相关背景

## 9. 导出接口规范

`case-organizer` 首版导出目录建议如下：

```text
patient_case/
  raw/
    uploads/
  extracted/
    extracted_text.json
    extracted_facts.json
  normalized/
    indicators.csv
    medications.csv
    timeline_events.csv
    patient_summary.json
  manifest.json
```

## 9.1 打印输出结构

打印输出应以病例模板结构为准，建议固定为以下章节：

1. 患者基本信息
2. 核心诊断
3. 基因检测
4. 病理 / 免疫组化
5. 既往治疗史
6. 最近肿标
7. 近期影像资料
8. 患者现状
9. 问诊需求 / 诉求
10. 备注

这部分应作为未来 docx / pdf / markdown 导出的统一章节顺序。

## 9.2 前端展示输出结构

前端展示只是标准病情结构的派生视图，不应单独定义业务字段。

前端主要消费：

- `patient_summary.json`
- `indicators.csv`
- `medications.csv`
- `timeline_events.csv`

并从统一病情结构派生出：

- `病程总览`
- `病情详情`
- `病程摘要`

### 9.3 indicators.csv

建议字段：

- `test_date`
- `indicator_name`
- `indicator_value`
- `unit`
- `reference_low`
- `reference_high`
- `source_file`
- `source_page`
- `confidence`

### 9.4 medications.csv

建议字段：

- `start_date`
- `end_date`
- `drug_name`
- `tag`
- `source_file`
- `confidence`

### 9.5 timeline_events.csv

建议字段：

- `event_date`
- `event_type`
- `title`
- `description`
- `doctor_note`
- `patient_note`
- `next_step`
- `source_file`

### 9.6 patient_summary.json

建议字段：

- `patient_name`
- `primary_diagnosis`
- `key_metrics`
- `current_phase`
- `last_updated_at`

## 10. 项目结构建议

建议 `case-organizer` 使用如下结构：

```text
case-organizer/
  cli/
  scanner/
  extract/
  normalize/
  review/
  exporters/
  schemas/
  storage/
  tests/
  docs/
```

模块职责：

- `cli/`：命令入口
- `scanner/`：扫描目录、识别文件、去重、增量检测
- `extract/`：MinerU 调用、本地文本读取、结果归一
- `normalize/`：从提取结果生成候选事实
- `review/`：本地 Web 校对页
- `exporters/`：导出标准化文件
- `schemas/`：统一 JSON Schema / CSV 字段规范
- `storage/`：本地索引与元数据存储

## 11. 首版范围

首版只做以下内容：

1. 支持指定目录扫描
2. 支持常见文件格式
3. MinerU 为主的解析链路
4. 统一候选事实模型
5. 本地 Web 校对
6. 导出给 `ca199_toolbox`

## 12. 首版不做

明确不做以下内容：

1. 多 Agent 编排
2. 自动病情分析结论
3. 自动治疗建议
4. 多源 RAG 检索
5. 实时语音助手
6. 云端协作系统
7. 复杂知识增强链路

## 13. 风险与控制

### 风险 1：MinerU 提取结果不稳定

控制：

- 保留候选事实层，不直接自动入库
- 所有结构化结果必须允许人工确认

### 风险 2：文件类型过多导致流程分叉

控制：

- 采用“直读 + MinerU 优先”的统一策略
- 首版不做多引擎竞争

### 风险 3：项目重新变复杂

控制：

- 只做整理，不做分析
- 只做事实，不做结论
- 只做本地，不做云协作

## 14. 当前建议结论

`case-organizer` 应作为独立项目立项，并采用：

- `CLI 主入口`
- `Web 校对界面`
- `MinerU 主解析后端`
- `文件级接口对接 ca199_toolbox`

这条路线最符合你现有经验，也最能避免重复掉入“多文件类型 + 多 Agent + 多源分析”的复杂陷阱。
