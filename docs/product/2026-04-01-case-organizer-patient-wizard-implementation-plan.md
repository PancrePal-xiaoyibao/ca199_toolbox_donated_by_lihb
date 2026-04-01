# Case Organizer Patient Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page patient wizard for `case-organizer` so non-technical patients can initialize a case directory, place files into guided categories, run processing, review candidate results, and export outputs without using the CLI directly.

**Architecture:** Extend the existing `case_organizer.review` FastAPI app into the main local web entrypoint instead of creating a second frontend stack. Use a single HTML page with progressive step panels, lightweight JSON endpoints for `init / inspect / upload / scan / review / export`, and keep all file operations inside a single patient case directory. Reuse the existing CLI and storage logic where possible so the web UI stays thin.

**Tech Stack:** Python, FastAPI, Jinja2 templates, vanilla HTML/CSS/JavaScript, pytest, existing `case_organizer` CLI/storage modules

---

## File Structure

### Existing files to modify

- `case-organizer/case_organizer/cli.py`
  - Keep `init` and `scan` behavior aligned with the web flow.
- `case-organizer/case_organizer/review/app.py`
  - Turn the existing review app into the wizard web app host.
- `case-organizer/case_organizer/review/storage.py`
  - Expand storage helpers for case directory metadata, upload summaries, and export summaries.
- `case-organizer/case_organizer/review/templates/index.html`
  - Replace the current minimal review page with the patient wizard shell.
- `case-organizer/tests/test_review_app.py`
  - Add API-level tests for wizard routes and page rendering.
- `case-organizer/README.md`
  - Document the web wizard launch and case flow.

### New files to create

- `case-organizer/case_organizer/review/case_layout.py`
  - Shared constants and helpers for wizard-visible category definitions.
- `case-organizer/case_organizer/review/wizard_service.py`
  - Thin orchestration layer for `init / inspect / upload / scan / export`.
- `case-organizer/case_organizer/review/templates/wizard.html`
  - Main single-page wizard template.
- `case-organizer/case_organizer/review/static/wizard.css`
  - Paper-like visual system and layout.
- `case-organizer/case_organizer/review/static/wizard.js`
  - Step state, fetch calls, upload actions, and progress polling.
- `case-organizer/tests/test_case_wizard_service.py`
  - Unit tests for case initialization, directory inspection, and export summary behavior.

### Responsibility boundaries

- `cli.py` remains the canonical filesystem/processing entry layer.
- `wizard_service.py` translates UI actions into filesystem and CLI-compatible operations.
- `app.py` exposes HTTP routes only; keep business logic out.
- `wizard.html/css/js` handle presentation and step-by-step interactions.

---

### Task 1: Create The Wizard Data Model

**Files:**
- Create: `case-organizer/case_organizer/review/case_layout.py`
- Create: `case-organizer/tests/test_case_wizard_service.py`

- [ ] **Step 1: Write the failing test for the category layout**

```python
from case_organizer.review.case_layout import RAW_CATEGORY_GROUPS, EXPORT_GROUPS


def test_case_layout_contains_required_patient_categories() -> None:
    raw_keys = [item["key"] for item in RAW_CATEGORY_GROUPS]
    assert "01_基本资料" in raw_keys
    assert "03_影像报告" in raw_keys
    assert "05_检验检查" in raw_keys
    assert "99_待分类" in raw_keys
    assert EXPORT_GROUPS == ["normalized", "legacy", "printable", "summaries"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_case_wizard_service.py::test_case_layout_contains_required_patient_categories -v`

Expected: FAIL with `ModuleNotFoundError` or missing symbols.

- [ ] **Step 3: Write minimal layout definitions**

```python
RAW_CATEGORY_GROUPS = [
    {"key": "01_基本资料", "label": "基本资料", "examples": ["身份证明", "基本病历信息"]},
    {"key": "02_诊断报告书", "label": "诊断报告书", "examples": ["门诊诊断书", "复诊诊断"]},
    {"key": "03_影像报告", "label": "影像报告", "examples": ["CT", "MR", "PET-CT"]},
    {"key": "04_病理与基因", "label": "病理与基因", "examples": ["病理报告", "基因检测"]},
    {
        "key": "05_检验检查",
        "label": "检验检查",
        "children": [
            "01_肿瘤标志物",
            "02_血常规",
            "03_肝肾功能",
            "04_凝血",
            "05_炎症指标",
            "06_体液检查_尿便常规",
            "07_其他检验",
        ],
    },
    {"key": "06_处方与用药", "label": "处方与用药", "examples": ["门诊处方", "治疗方案"]},
    {"key": "07_个人病情记录", "label": "个人病情记录", "examples": ["自述记录", "微信整理"]},
    {"key": "08_手术与住院资料", "label": "手术与住院资料", "examples": ["出院小结", "手术记录"]},
    {"key": "99_待分类", "label": "待分类", "examples": ["暂时不清楚归类的资料"]},
]

EXPORT_GROUPS = ["normalized", "legacy", "printable", "summaries"]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest case-organizer/tests/test_case_wizard_service.py::test_case_layout_contains_required_patient_categories -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/case_layout.py case-organizer/tests/test_case_wizard_service.py
git commit -m "feat: add patient wizard case layout definitions"
```

### Task 2: Add Wizard Service For Case Initialization And Inspection

**Files:**
- Create: `case-organizer/case_organizer/review/wizard_service.py`
- Modify: `case-organizer/case_organizer/cli.py`
- Modify: `case-organizer/tests/test_case_wizard_service.py`

- [ ] **Step 1: Write the failing tests for case initialization and inspection**

```python
from pathlib import Path

from case_organizer.review.wizard_service import WizardService


def test_initialize_case_creates_required_directories(tmp_path: Path) -> None:
    service = WizardService()
    case_dir = tmp_path / "patient001"

    summary = service.initialize_case(case_dir)

    assert Path(summary["raw_dir"]).is_dir()
    assert Path(summary["workspace_dir"]).is_dir()
    assert Path(summary["exports_dir"]).is_dir()
    assert (case_dir / "raw" / "03_影像报告").is_dir()
    assert (case_dir / "exports" / "legacy").is_dir()


def test_inspect_case_reports_file_counts(tmp_path: Path) -> None:
    service = WizardService()
    case_dir = tmp_path / "patient001"
    service.initialize_case(case_dir)
    report_file = case_dir / "raw" / "03_影像报告" / "ct.pdf"
    report_file.write_text("demo", encoding="utf-8")

    summary = service.inspect_case(case_dir)

    assert summary["total_files"] == 1
    assert summary["category_counts"]["03_影像报告"] == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_case_wizard_service.py::test_initialize_case_creates_required_directories case-organizer/tests/test_case_wizard_service.py::test_inspect_case_reports_file_counts -v`

Expected: FAIL because `WizardService` does not exist.

- [ ] **Step 3: Implement minimal wizard service**

```python
from pathlib import Path

from case_organizer.cli import _initialize_case_directory
from case_organizer.review.case_layout import RAW_CATEGORY_GROUPS


class WizardService:
    def initialize_case(self, case_dir: Path) -> dict[str, str]:
        return _initialize_case_directory(case_dir)

    def inspect_case(self, case_dir: Path) -> dict[str, object]:
        raw_dir = case_dir / "raw"
        counts: dict[str, int] = {}
        total_files = 0
        for category in RAW_CATEGORY_GROUPS:
            category_dir = raw_dir / category["key"]
            count = len([p for p in category_dir.rglob("*") if p.is_file()])
            counts[category["key"]] = count
            total_files += count
        return {
            "case_dir": str(case_dir),
            "raw_dir": str(raw_dir),
            "total_files": total_files,
            "category_counts": counts,
        }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_case_wizard_service.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/wizard_service.py case-organizer/case_organizer/cli.py case-organizer/tests/test_case_wizard_service.py
git commit -m "feat: add wizard case initialization service"
```

### Task 3: Add Upload-To-Category And Export Summary Helpers

**Files:**
- Modify: `case-organizer/case_organizer/review/wizard_service.py`
- Modify: `case-organizer/tests/test_case_wizard_service.py`

- [ ] **Step 1: Write the failing tests for upload placement and export summary**

```python
from io import BytesIO
from pathlib import Path

from case_organizer.review.wizard_service import WizardService


def test_save_upload_writes_file_into_selected_category(tmp_path: Path) -> None:
    service = WizardService()
    case_dir = tmp_path / "patient001"
    service.initialize_case(case_dir)

    saved_path = service.save_upload(
        case_dir=case_dir,
        category_key="06_处方与用药",
        filename="rx.jpg",
        content=b"binary",
    )

    assert saved_path.name == "rx.jpg"
    assert saved_path.parent.name == "06_处方与用药"


def test_export_summary_lists_expected_directories(tmp_path: Path) -> None:
    service = WizardService()
    case_dir = tmp_path / "patient001"
    service.initialize_case(case_dir)

    summary = service.export_summary(case_dir)

    assert "normalized" in summary["exports"]
    assert "legacy" in summary["exports"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_case_wizard_service.py::test_save_upload_writes_file_into_selected_category case-organizer/tests/test_case_wizard_service.py::test_export_summary_lists_expected_directories -v`

Expected: FAIL with missing methods.

- [ ] **Step 3: Implement minimal helpers**

```python
from pathlib import Path

from case_organizer.review.case_layout import EXPORT_GROUPS


class WizardService:
    ...

    def save_upload(self, case_dir: Path, category_key: str, filename: str, content: bytes) -> Path:
        target = case_dir / "raw" / category_key / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return target

    def export_summary(self, case_dir: Path) -> dict[str, object]:
        exports = {}
        for name in EXPORT_GROUPS:
            export_dir = case_dir / "exports" / name
            exports[name] = {
                "path": str(export_dir),
                "exists": export_dir.exists(),
                "file_count": len([p for p in export_dir.rglob("*") if p.is_file()]),
            }
        return {"case_dir": str(case_dir), "exports": exports}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_case_wizard_service.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/wizard_service.py case-organizer/tests/test_case_wizard_service.py
git commit -m "feat: add wizard upload and export helpers"
```

### Task 4: Expose Wizard API Routes In FastAPI

**Files:**
- Modify: `case-organizer/case_organizer/review/app.py`
- Modify: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write the failing API tests**

```python
from fastapi.testclient import TestClient

from case_organizer.review.app import build_review_app


def test_wizard_page_renders(tmp_path) -> None:
    client = TestClient(build_review_app(tmp_path))
    response = client.get("/")
    assert response.status_code == 200
    assert "创建病例" in response.text


def test_initialize_case_endpoint_creates_case(tmp_path) -> None:
    client = TestClient(build_review_app(tmp_path))
    response = client.post("/api/wizard/init", json={"case_name": "patient001"})
    assert response.status_code == 200
    assert response.json()["raw_dir"].endswith("/patient001/raw")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_review_app.py::test_wizard_page_renders case-organizer/tests/test_review_app.py::test_initialize_case_endpoint_creates_case -v`

Expected: FAIL because route/template does not exist.

- [ ] **Step 3: Add API routes and template rendering**

```python
@app.get("/", response_class=HTMLResponse)
def wizard_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "wizard.html",
        {"request": request, "page_title": "Case Organizer"},
    )


@app.post("/api/wizard/init")
def init_case(payload: dict[str, str]) -> dict[str, str]:
    case_name = payload["case_name"].strip()
    case_dir = workspace_root / case_name
    return wizard_service.initialize_case(case_dir)


@app.get("/api/wizard/inspect")
def inspect_case(case_dir: str) -> dict[str, object]:
    return wizard_service.inspect_case(Path(case_dir))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_review_app.py -v`

Expected: PASS for the new route tests.

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/app.py case-organizer/tests/test_review_app.py
git commit -m "feat: expose patient wizard API routes"
```

### Task 5: Build The Single-Page Wizard HTML Shell

**Files:**
- Create: `case-organizer/case_organizer/review/templates/wizard.html`
- Create: `case-organizer/case_organizer/review/static/wizard.css`
- Modify: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write the failing render assertion**

```python
def test_wizard_page_contains_all_six_steps(tmp_path) -> None:
    client = TestClient(build_review_app(tmp_path))
    response = client.get("/")
    assert "放入资料" in response.text
    assert "检查资料" in response.text
    assert "开始整理" in response.text
    assert "校对结果" in response.text
    assert "导出结果" in response.text
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_review_app.py::test_wizard_page_contains_all_six_steps -v`

Expected: FAIL

- [ ] **Step 3: Create the HTML shell and CSS**

```html
<main class="wizard-shell">
  <header class="wizard-header">
    <p class="eyebrow">Case Organizer</p>
    <h1>病情资料整理向导</h1>
    <ol class="wizard-progress">
      <li class="is-active">创建病例</li>
      <li>放入资料</li>
      <li>检查资料</li>
      <li>开始整理</li>
      <li>校对结果</li>
      <li>导出结果</li>
    </ol>
  </header>
  <section id="wizard-panel"></section>
  <aside id="wizard-sidebar"></aside>
</main>
```

```css
:root {
  --paper: #f4efe6;
  --ink: #1f2a2a;
  --line: rgba(31, 42, 42, 0.14);
  --accent: #355f52;
  --warn: #9c5c2b;
  --danger: #8f3b30;
}

body {
  margin: 0;
  color: var(--ink);
  background:
    radial-gradient(circle at top left, rgba(210, 198, 180, 0.35), transparent 28%),
    linear-gradient(180deg, #efe8dc, #f7f2ea 48%, #fbf8f2);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_review_app.py::test_wizard_page_contains_all_six_steps -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/templates/wizard.html case-organizer/case_organizer/review/static/wizard.css case-organizer/tests/test_review_app.py
git commit -m "feat: add patient wizard HTML shell"
```

### Task 6: Implement Step State And File Upload UI

**Files:**
- Create: `case-organizer/case_organizer/review/static/wizard.js`
- Modify: `case-organizer/case_organizer/review/app.py`
- Modify: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write the failing upload endpoint test**

```python
def test_upload_endpoint_places_file_in_category(tmp_path) -> None:
    client = TestClient(build_review_app(tmp_path))
    init_response = client.post("/api/wizard/init", json={"case_name": "patient001"})
    case_dir = init_response.json()["case_dir"]

    response = client.post(
        "/api/wizard/upload",
        data={"case_dir": case_dir, "category_key": "03_影像报告"},
        files={"file": ("ct.pdf", b"pdf-data", "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json()["saved_path"].endswith("/03_影像报告/ct.pdf")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_review_app.py::test_upload_endpoint_places_file_in_category -v`

Expected: FAIL because endpoint does not exist.

- [ ] **Step 3: Add upload endpoint and front-end state logic**

```python
@app.post("/api/wizard/upload")
async def upload_to_category(
    case_dir: str = Form(...),
    category_key: str = Form(...),
    file: UploadFile = File(...),
) -> dict[str, str]:
    content = await file.read()
    saved = wizard_service.save_upload(Path(case_dir), category_key, file.filename, content)
    return {"saved_path": str(saved)}
```

```javascript
const state = { step: 1, caseDir: null, caseName: "", inspect: null };

async function createCase() {
  const caseName = document.querySelector("#case-name").value.trim();
  const response = await fetch("/api/wizard/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_name: caseName }),
  });
  state.caseDir = (await response.json()).case_dir;
  state.step = 2;
  renderStep();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_review_app.py -v`

Expected: PASS for the upload test and prior route tests.

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/app.py case-organizer/case_organizer/review/static/wizard.js case-organizer/tests/test_review_app.py
git commit -m "feat: add patient wizard uploads and step state"
```

### Task 7: Connect Inspect, Scan Status, And Review Panels

**Files:**
- Modify: `case-organizer/case_organizer/review/wizard_service.py`
- Modify: `case-organizer/case_organizer/review/app.py`
- Modify: `case-organizer/case_organizer/review/static/wizard.js`
- Modify: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write failing tests for inspect and scan kickoff**

```python
def test_scan_endpoint_runs_pipeline_for_case_directory(tmp_path, monkeypatch) -> None:
    client = TestClient(build_review_app(tmp_path))
    init_response = client.post("/api/wizard/init", json={"case_name": "patient001"})
    case_dir = init_response.json()["case_dir"]

    response = client.post("/api/wizard/scan", json={"case_dir": case_dir})

    assert response.status_code == 200
    assert "manifest_path" in response.json()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_review_app.py::test_scan_endpoint_runs_pipeline_for_case_directory -v`

Expected: FAIL because endpoint does not exist.

- [ ] **Step 3: Implement scan bridge and review fetch**

```python
from case_organizer.cli import _scan_pipeline


class WizardService:
    ...
    def run_scan(self, case_dir: Path) -> dict[str, object]:
        workspace_dir = case_dir / "workspace"
        manifest = _scan_pipeline(case_dir / "raw", workspace_dir)
        return {
            "manifest": manifest,
            "manifest_path": str(workspace_dir / "manifest.json"),
            "candidate_case_path": str(workspace_dir / "candidate_case.json"),
        }
```

```javascript
async function runScan() {
  const response = await fetch("/api/wizard/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_dir: state.caseDir }),
  });
  state.scanResult = await response.json();
  state.step = 5;
  renderStep();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_review_app.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/wizard_service.py case-organizer/case_organizer/review/app.py case-organizer/case_organizer/review/static/wizard.js case-organizer/tests/test_review_app.py
git commit -m "feat: connect patient wizard inspect and scan flow"
```

### Task 8: Add Export Summary And ca199_toolbox Handoff UI

**Files:**
- Modify: `case-organizer/case_organizer/review/app.py`
- Modify: `case-organizer/case_organizer/review/static/wizard.js`
- Modify: `case-organizer/case_organizer/review/templates/wizard.html`
- Modify: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write the failing export summary test**

```python
def test_export_summary_endpoint_returns_legacy_and_normalized_sections(tmp_path) -> None:
    client = TestClient(build_review_app(tmp_path))
    init_response = client.post("/api/wizard/init", json={"case_name": "patient001"})
    case_dir = init_response.json()["case_dir"]

    response = client.get("/api/wizard/export-summary", params={"case_dir": case_dir})

    assert response.status_code == 200
    payload = response.json()
    assert "legacy" in payload["exports"]
    assert "normalized" in payload["exports"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest case-organizer/tests/test_review_app.py::test_export_summary_endpoint_returns_legacy_and_normalized_sections -v`

Expected: FAIL

- [ ] **Step 3: Implement export summary endpoint and final step UI**

```python
@app.get("/api/wizard/export-summary")
def export_summary(case_dir: str) -> dict[str, object]:
    return wizard_service.export_summary(Path(case_dir))
```

```javascript
async function loadExportSummary() {
  const url = new URL("/api/wizard/export-summary", window.location.origin);
  url.searchParams.set("case_dir", state.caseDir);
  const response = await fetch(url);
  state.exportSummary = await response.json();
  state.step = 6;
  renderStep();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest case-organizer/tests/test_review_app.py -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review/app.py case-organizer/case_organizer/review/static/wizard.js case-organizer/case_organizer/review/templates/wizard.html case-organizer/tests/test_review_app.py
git commit -m "feat: add patient wizard export summary step"
```

### Task 9: Documentation And Manual Verification

**Files:**
- Modify: `case-organizer/README.md`
- Modify: `docs/product/2026-04-01-case-organizer-patient-wizard-spec.md`

- [ ] **Step 1: Add README usage section for the web wizard**

```md
## Patient Wizard

Run the local web wizard:

```bash
cd case-organizer
python -m case_organizer.cli review /path/to/patient001/workspace
```

Or start with:

```bash
case-organizer init /path/to/patient001
case-organizer scan /path/to/patient001
```
```

- [ ] **Step 2: Run the full test suite**

Run: `cd case-organizer && pytest -q`

Expected: PASS with all tests green.

- [ ] **Step 3: Manual smoke test**

Run:

```bash
cd case-organizer
python -m case_organizer.cli init /tmp/patient001
python -m case_organizer.cli review /tmp/patient001/workspace
```

Expected:

- Browser opens or server starts successfully
- Home page shows six steps
- Creating a case writes `raw/`, `workspace/`, and `exports/`
- Uploading a file into `03_影像报告` stores it in `/tmp/patient001/raw/03_影像报告/`

- [ ] **Step 4: Commit**

```bash
git add case-organizer/README.md docs/product/2026-04-01-case-organizer-patient-wizard-spec.md
git commit -m "docs: add patient wizard usage notes"
```

---

## Self-Review

### Spec coverage

- Six-step wizard: covered by Tasks 4-8
- Single-patient case directory model: covered by Tasks 1-3
- Guided upload categories: covered by Tasks 1, 3, and 6
- Scan / review / export wiring: covered by Tasks 7-8
- Shared local web entrypoint: covered by Tasks 4-8

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation markers remain in tasks.
- Each task includes concrete file paths, commands, and code snippets.

### Type consistency

- `WizardService` is the single orchestration object throughout the plan.
- `case_dir` remains the shared path variable across API, service, and client code.
- Export groups stay consistent with the documented structure: `normalized`, `legacy`, `printable`, `summaries`.
