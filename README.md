# CA199 医疗指标可视化工具

一个功能强大的医疗指标趋势可视化工具，支持实时数据加载、用药方案追踪和交互式图表展示。专为医疗工作者、研究者和患者设计。

![License: AGPL-3.0+](https://img.shields.io/badge/license-AGPL--3.0+-blue.svg)
![Non-Commercial](https://img.shields.io/badge/use-non--commercial-orange.svg)
![Status: Active](https://img.shields.io/badge/status-active-brightgreen.svg)

## 📌 关于本项目

本项目由社区成员 **lihb** 慷慨捐赠，旨在为医疗工作者和研究者提供免费、开放的医疗数据可视化工具。

- 🎁 **捐赠人**: lihb
- 📅 **捐赠时间**: 2024年
- 📜 **捐赠证明**: [DONATION_CERTIFICATE.md](./DONATION_CERTIFICATE.md)
- 📋 **授权声明**: [DONOR_AUTHORIZATION.md](./DONOR_AUTHORIZATION.md)

> ⚠️ **重要**: 本项目采用 **AGPL-3.0+ 许可证**，仅限 **非商业性使用**。禁止用于商业运营和盈利活动。

---

## ✨ 功能特性

- 📊 **实时图表渲染**：加载CSV数据后即时生成医疗指标趋势图
- 💊 **用药方案追踪**：展示用药时间轴，关联指标变化
- 🎯 **关键点标注**：自动标识指标的最大值和最后一个数据点
- 📈 **变化率分析**：显示指标数值变化幅度和百分比变化
- 🔍 **交互式控制**：灵活的指标选择、阈值调整、鼠标缩放和平移
- 📱 **响应式设计**：桌面和移动设备友好的用户界面
- 🔒 **完全隐私**：所有数据处理在本地完成，无服务器上传

---

## 🚀 快速开始 (3步上手)

> 🔒 **数据安全保证**: 所有数据处理都在您的本地电脑上完成，**不会上传任何云端服务器**，完全离线可用！

### 使用流程

```
1️⃣ 下载解压           (1分钟)
        ↓
2️⃣ 编辑CSV数据        (5分钟)
        ↓
3️⃣ 打开index.html      (1分钟)
        ↓
4️⃣ 加载数据查看结果    (1分钟)
```

**👉 [详细快速开始指南](./QUICKSTART.md)** ← 推荐阅读！

### 1. 准备数据文件

#### data.csv - 医疗指标数据

```csv
testTime,indicatorName,indicatorValue
2024-01-01 10:30:00,CA199,120.5
2024-01-08 10:30:00,CA199,150.3
2024-01-15 10:30:00,CEA,45.2
```

**必需列**:

- `testTime`: 检测时间（支持 YYYY-MM-DD 或 YYYY-MM-DD HH:MM:SS 格式）
- `indicatorName`: 指标名称（如 CA199, CEA, AFP 等）
- `indicatorValue`: 指标数值（数字类型）

#### medication.csv - 用药方案数据

```csv
START_DATE,END_DATE,DRUG_NAME
2024-01-01,2024-01-15,化疗方案A
2024-01-20,2024-02-10,化疗方案B
```

**必需列**:

- `START_DATE`: 用药开始时间
- `END_DATE`: 用药结束时间
- `DRUG_NAME`: 用药方案名称

### 2. 打开应用

```
1. 用浏览器打开 index.html (Chrome/Edge/Safari/Firefox)
2. 点击"加载指标数据"选择 data.csv
3. 点击"加载用药数据"选择 medication.csv
4. 选择指标 → 点击"生成图表"
```

**💡 提示**: 整个过程在您的浏览器本地进行，数据不上传任何服务器！

### 3. 功能使用

#### 显示控制

- **关键点**: 标注指标的最大值和最后一个数据点
- **变化率**: 显示指标变化幅度，可设置阈值筛选

#### 数值变化阈值

设置最小数值变化量（如≥0.5），仅显示超过此阈值的变化

#### 变化幅度

设置最小百分比变化（0-100%），仅显示相对变化超过此比例的数据点

#### 交互操作

- **鼠标滚轮**: 缩放时间范围
- **鼠标拖动**: 平移查看不同时间段
- **悬停提示**: 显示具体数值和用药方案

---

## 🔒 数据隐私与安全

### ✅ 您的医疗数据100%安全

| 保证项 | 说明 |
|--------|------|
| **数据位置** | 100% 在您的本地电脑 |
| **云端上传** | ❌ 零上传，完全离线可用 |
| **服务器存储** | ❌ 没有任何服务器存储您的数据 |
| **网络连接** | ✅ 可完全离线运行 |
| **数据删除** | ✅ 关闭浏览器即自动删除 |
| **隐私级别** | ⭐⭐⭐⭐⭐ 最高等级 |

### 工作原理

```
您的电脑浏览器
    ↓
加载CSV文件 (本地)
    ↓
处理数据 (本地)
    ↓
显示图表 (本地)
    ↓
❌ 不连接任何服务器
❌ 不上传任何数据
❌ 不保存到云端
```

**所有数据处理在浏览器本地完成，绝对不会上传到任何云端服务器！**

---

## 📁 文件结构

```
ca199_toolbox/
├── index.html                      # 主应用程序（HTML + JavaScript）
├── js/
│   ├── echarts.min.js             # 图表库（AGPL-3.0+）
│   └── papaparse.min.js           # CSV 解析库（AGPL-3.0+）
├── cache/                         # 缓存数据目录
├── data.csv                       # 示例医疗指标数据
├── medication.csv                 # 示例用药方案数据
│
├── README.md                      # 项目说明文档（本文件）
├── LICENSE                        # AGPL-3.0+ 许可证
├── DONATION_CERTIFICATE.md        # 捐赠证明书（重要！）
├── DONOR_AUTHORIZATION.md         # 捐赠授权声明（重要！）
├── .gitignore                     # Git 忽略配置
├── package.json                   # 项目元数据
├── 使用说明.txt                   # 快速指南（中文）
│
└── docs/                          # 文档目录（可选）
    └── FAQ.md                     # 常见问题

```

---

## 📊 数据格式要求

### 时间格式

- 支持 `YYYY-MM-DD` 格式（例：2024-01-01）
- 支持 `YYYY-MM-DD HH:MM:SS` 格式（例：2024-01-01 10:30:00）
- 自动识别并解析

### 数值格式

- 支持整数和浮点数
- 自动过滤非数值字段（如"阳性"、"阴性"等）
- 空值自动忽略

### 编码格式

- **必须使用 UTF-8 编码**（确保中文正确显示）
- 推荐使用文本编辑器检查编码

---

## 🛠 技术栈

| 技术                 | 说明               | 许可证             |
| -------------------- | ------------------ | ------------------ |
| **ECharts**    | 交互式数据可视化库 | AGPL-3.0+          |
| **PapaParse**  | CSV 数据解析库     | AGPL-3.0+          |
| **HTML5**      | 标记语言           | AGPL-3.0+          |
| **JavaScript** | 前端逻辑           | AGPL-3.0+          |
| **CSS3**       | 样式表             | AGPL-3.0+          |

### 浏览器支持

| 浏览器          | 最低版本 |
| --------------- | -------- |
| Chrome/Chromium | 60+      |
| Firefox         | 55+      |
| Safari          | 12+      |
| Edge            | 79+      |

---

## ⚖️ 许可证

本项目采用 **AGPL-3.0+** 许可证。

- 📋 [完整许可证文本](./LICENSE)
- 🔗 [AGPL-3.0 官方说明](https://www.gnu.org/licenses/agpl-3.0.html)

### 使用条款

根据 AGPL-3.0+ 协议，您有权利：

- ✅ 自由使用、修改和分发本软件
- ✅ 用于学术和非商用目的
- ✅ 查看和修改源代码

同时您必须：

- ⚠️ **非商用用途**：个人研究、学术研究、医疗实践等
- ⚠️ 保留原作者信息和许可证声明
- ⚠️ 如果分发本软件的修改版本，必须公开源代码
- ⚠️ 如果通过网络向用户提供本软件，必须提供源代码下载链接

### 商用许可

如需商用授权，请联系原捐赠人 **lihb** 协商特殊许可条款。

---

## 🎁 关于捐赠

### 捐赠人信息

| 信息     | 内容                                              |
| -------- | ------------------------------------------------- |
| 捐赠人   | lihb                                              |
| 捐赠内容 | 完整源代码、文档及所有资产                        |
| 捐赠方式 | 无偿捐赠给开源社区                                |
| 捐赠时间 | 2025年12月                                        |
| 证明文件 | [DONATION_CERTIFICATE.md](./DONATION_CERTIFICATE.md) |

### 重要文档

- **[DONATION_CERTIFICATE.md](./DONATION_CERTIFICATE.md)** - 正式捐赠证明书，证明捐赠的合法性和有效性
- **[DONOR_AUTHORIZATION.md](./DONOR_AUTHORIZATION.md)** - 详细的捐赠授权声明和法律条款

**请阅读上述文件了解使用条款和限制。**

---

## ❓ 常见问题

### Q: 为什么数据没有显示？

- 检查 CSV 文件编码是否为 UTF-8
- 确认列名是否与默认配置匹配（testTime, indicatorName, indicatorValue）
- 检查数据格式是否正确（时间格式、数值格式）

### Q: 如何修改默认列名？

编辑 index.html 中的 DEFAULT_CONFIG 对象：

```javascript
const DEFAULT_CONFIG = {
  dataTable: {
    timeField: 'testTime',        // 修改为你的时间列名
    nameField: 'indicatorName',   // 修改为你的指标列名
    valueField: 'indicatorValue'  // 修改为你的数值列名
  },
  medicationTable: {
    startTimeField: 'START_DATE',
    endTimeField: 'END_DATE',
    regimenField: 'DRUG_NAME'
  }
};
```

### Q: 能否离线使用？

可以。所有依赖库已本地化，无需网络连接即可运行。

### Q: 这个工具可以用于商业目的吗？

**不可以**。根据 AGPL-3.0+ 许可证，本工具仅限非商业性使用。如需商用，请联系捐赠人 lihb 协商特殊许可。

### Q: 数据安全吗？

✅ **完全安全**。所有数据处理均在您的浏览器本地完成，**不上传任何服务器**，不存储到云端。您的医疗数据完全保密。

**工作原理**：
```
您的电脑 → 浏览器处理 → 本地显示
❌ 不经过服务器
❌ 不存储到云端
✅ 关闭页面即删除
```

### Q: 可以修改代码吗？

✅ **可以**。在遵守 AGPL-3.0+ 许可证的前提下，您可以自由修改代码。如果分发修改版本，必须公开源代码。

### Q: 能否用于医疗诊断？

⚠️ **不能作为诊断依据**。本工具仅用于数据展示和趋势分析，所有医疗判断必须由资质医疗专业人士进行。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献要求

- 遵守 AGPL-3.0+ 许可证
- 保留原作者和捐赠人信息
- 所有修改版本必须公开源代码

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)（如有）

---

## 📝 更新日志

### v1.0.0 (2024年)

- ✨ 初始版本发布
- ✨ 支持医疗指标趋势可视化
- ✨ 集成用药方案追踪
- ✨ 关键点和变化率标注
- ✨ AGPL-3.0+ 开源许可
- ✨ 正式捐赠证明和授权文件

---

## 🙏 致谢

### 核心贡献者

- **lihb** - 项目捐赠者和原作者

### 依赖项目

- 感谢 [ECharts](https://echarts.apache.org/) 提供强大的图表能力
- 感谢 [PapaParse](https://www.papaparse.com/) 提供 CSV 解析功能
- 感谢所有使用者和反馈者的支持

---

## 📮 联系方式

- 📧 **问题报告**: 提交 GitHub Issue
- 💬 **讨论**: GitHub Discussions（如有）
- 📝 **建议**: 欢迎通过 Issue 或 Discussion 提出改进建议

---

## ⚠️ 免责声明

### 医疗使用声明

**重要**: 本工具仅用于医疗数据展示和分析，**不能作为临床诊断依据**。

- ⚠️ 不能替代医疗专业人士的诊断
- ⚠️ 所有医疗判断必须由资质医疗专业人士进行
- ⚠️ 使用本工具造成的任何医疗后果，开发者和捐赠人不承担责任

### 数据隐私说明

- ✅ 所有数据处理在本地完成
- ✅ 不向任何服务器发送数据
- ✅ 用户对自己的数据完全负责

### 法律声明

使用本工具即表示您同意：

- 遵守适用的所有法律法规
- 理解非商业性使用的限制
- 尊重他人的医疗隐私
- 承诺不将本工具用于非法目的

---

## 📊 统计信息

| 指标         | 数据                                          |
| ------------ | --------------------------------------------- |
| 许可证       | AGPL-3.0+                                     |
| 使用限制     | 仅非商业性使用                                |
| 隐私级别     | 完全本地处理                                  |
| 浏览器兼容性 | Chrome 60+, Firefox 55+, Safari 12+, Edge 79+ |

---

## 📄 相关文档

| 文档                                              | 说明                     |
| ------------------------------------------------- | ------------------------ |
| **[QUICKSTART.md](./QUICKSTART.md)**                 | ⭐ 快速上手指南（推荐先看） |
| [LICENSE](./LICENSE)                                 | AGPL-3.0+ 许可证完整文本 |
| [DONATION_CERTIFICATE.md](./DONATION_CERTIFICATE.md) | 正式捐赠证明书           |
| [DONOR_AUTHORIZATION.md](./DONOR_AUTHORIZATION.md)   | 捐赠授权声明             |
| [使用说明.txt](./使用说明.txt)                       | 中文快速指南             |

---

<div align="center">

---

## 🎯 开始使用

### [👉 快速开始指南 (QUICKSTART.md)](./QUICKSTART.md)

**3步快速上手**：下载 → 解压 → 编辑数据 → 打开index.html

### 数据安全承诺

✅ 所有数据在本地处理  
✅ 不上传任何云端  
✅ 完全离线可用  
✅ 关闭即删除  

---

**Made with ❤️ for open-source medical information technology**

*Donated by lihb to the open-source community*

*AGPL-3.0+ | Non-Commercial Use Only | 100% Local Processing*

</div>
