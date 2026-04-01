# Case Organizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first `case-organizer` project that scans a patient document directory, extracts content using MinerU and local readers, normalizes the result into a reviewable case model, and exports standardized files for `ca199_toolbox`.

**Architecture:** Implement `case-organizer` as a Python monolith with a CLI entrypoint and a lightweight local Web review app. Keep extraction and review separate: CLI owns scanning, deduplication, MinerU orchestration, manifest generation, normalization, and export; Web owns candidate fact review and approval. Use file-based interfaces and explicit manifests rather than hidden runtime discovery.

**Tech Stack:** Python 3.11, Typer, Pydantic, httpx, python-dotenv, pandas, openpyxl, markdown-it-py or plain markdown handling, FastAPI, Jinja2 or minimal SPA, pytest

---

## File Structure

### New repository layout

- `case-organizer/pyproject.toml`
- `case-organizer/README.md`
- `case-organizer/.env.template`
- `case-organizer/.gitignore`
- `case-organizer/case_organizer/__init__.py`
- `case-organizer/case_organizer/cli.py`
- `case-organizer/case_organizer/config.py`
- `case-organizer/case_organizer/logging.py`
- `case-organizer/case_organizer/scanner/__init__.py`
- `case-organizer/case_organizer/scanner/file_scanner.py`
- `case-organizer/case_organizer/scanner/file_index.py`
- `case-organizer/case_organizer/scanner/file_types.py`
- `case-organizer/case_organizer/extract/__init__.py`
- `case-organizer/case_organizer/extract/local_readers.py`
- `case-organizer/case_organizer/extract/mineru_client.py`
- `case-organizer/case_organizer/extract/mineru_runner.py`
- `case-organizer/case_organizer/extract/archive_resolver.py`
- `case-organizer/case_organizer/extract/document_normalizer.py`
- `case-organizer/case_organizer/models/__init__.py`
- `case-organizer/case_organizer/models/document.py`
- `case-organizer/case_organizer/models/case_data.py`
- `case-organizer/case_organizer/normalize/__init__.py`
- `case-organizer/case_organizer/normalize/fact_extractor.py`
- `case-organizer/case_organizer/normalize/template_mapper.py`
- `case-organizer/case_organizer/exporters/__init__.py`
- `case-organizer/case_organizer/exporters/csv_exporter.py`
- `case-organizer/case_organizer/exporters/json_exporter.py`
- `case-organizer/case_organizer/review/__init__.py`
- `case-organizer/case_organizer/review/app.py`
- `case-organizer/case_organizer/review/storage.py`
- `case-organizer/case_organizer/review/templates/index.html`
- `case-organizer/tests/test_file_scanner.py`
- `case-organizer/tests/test_file_index.py`
- `case-organizer/tests/test_archive_resolver.py`
- `case-organizer/tests/test_document_normalizer.py`
- `case-organizer/tests/test_fact_extractor.py`
- `case-organizer/tests/test_csv_exporter.py`
- `case-organizer/tests/fixtures/mineru_result/`
- `case-organizer/tests/fixtures/sample_case/`

### Existing design docs to reference

- `docs/product/2026-04-01-case-organizer-project-spec.md`
- `docs/product/2026-03-31-ca199-toolbox-redesign.md`
- `docs/product/2026-04-01-ca199-toolbox-frontend-design-spec.md`

## Task 1: Bootstrap The New Python Project

**Files:**
- Create: `case-organizer/pyproject.toml`
- Create: `case-organizer/README.md`
- Create: `case-organizer/.env.template`
- Create: `case-organizer/.gitignore`
- Create: `case-organizer/case_organizer/__init__.py`
- Create: `case-organizer/case_organizer/config.py`
- Create: `case-organizer/case_organizer/logging.py`
- Create: `case-organizer/case_organizer/cli.py`
- Test: `case-organizer/tests/test_cli_smoke.py`

- [ ] **Step 1: Write the failing CLI smoke test**

```python
from typer.testing import CliRunner

from case_organizer.cli import app


def test_cli_shows_root_help():
    runner = CliRunner()

    result = runner.invoke(app, ["--help"])

    assert result.exit_code == 0
    assert "scan" in result.stdout
    assert "review" in result.stdout
    assert "export" in result.stdout
```

- [ ] **Step 2: Create the project metadata and base package**

```toml
[project]
name = "case-organizer"
version = "0.1.0"
description = "Local-first patient case organizer"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.115.0",
  "httpx>=0.27.0",
  "jinja2>=3.1.4",
  "openpyxl>=3.1.5",
  "pandas>=2.2.3",
  "pydantic>=2.9.2",
  "python-dotenv>=1.0.1",
  "typer>=0.12.5",
  "uvicorn>=0.32.0"
]

[project.optional-dependencies]
dev = [
  "pytest>=8.3.3",
  "pytest-asyncio>=0.24.0",
  "ruff>=0.7.3"
]

[project.scripts]
case-organizer = "case_organizer.cli:app"
```

```python
from pathlib import Path

from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseModel):
    mineru_api_token: str = ""
    mineru_extract_batch_endpoint: str = "https://mineru.net/api/v4/extract/task/batch"
    mineru_file_urls_endpoint: str = "https://mineru.net/api/v4/file-urls/batch"
    mineru_results_base: str = "https://mineru.net/api/v4"
    poll_interval_seconds: int = 5
    workspace_dir: Path = Path("./workspace")
```

```python
import typer

app = typer.Typer(help="Case Organizer CLI")


@app.command()
def scan(path: str) -> None:
    print(f"scan {path}")


@app.command()
def review(path: str) -> None:
    print(f"review {path}")


@app.command()
def export(path: str) -> None:
    print(f"export {path}")
```

- [ ] **Step 3: Add environment and ignore files**

```env
MINERU_API_TOKEN=
MINERU_EXTRACT_BATCH_ENDPOINT=https://mineru.net/api/v4/extract/task/batch
MINERU_FILE_URLS_ENDPOINT=https://mineru.net/api/v4/file-urls/batch
MINERU_RESULTS_BASE=https://mineru.net/api/v4
POLL_INTERVAL_SECONDS=5
WORKSPACE_DIR=./workspace
```

```gitignore
.env
.pytest_cache
__pycache__/
workspace/
.venv/
dist/
build/
```

- [ ] **Step 4: Run the smoke test**

Run:

```bash
cd case-organizer && pytest tests/test_cli_smoke.py -v
```

Expected:

- PASS with help output showing `scan`, `review`, and `export`

- [ ] **Step 5: Commit**

```bash
git add case-organizer
git commit -m "feat: bootstrap case-organizer project"
```

## Task 2: Implement File Scanning And Incremental Indexing

**Files:**
- Create: `case-organizer/case_organizer/scanner/file_types.py`
- Create: `case-organizer/case_organizer/scanner/file_scanner.py`
- Create: `case-organizer/case_organizer/scanner/file_index.py`
- Create: `case-organizer/tests/test_file_scanner.py`
- Create: `case-organizer/tests/test_file_index.py`

- [ ] **Step 1: Write the failing scanner tests**

```python
from pathlib import Path

from case_organizer.scanner.file_scanner import scan_supported_files


def test_scan_supported_files_filters_expected_extensions(tmp_path: Path):
    (tmp_path / "a.pdf").write_text("x", encoding="utf-8")
    (tmp_path / "b.md").write_text("x", encoding="utf-8")
    (tmp_path / "c.exe").write_text("x", encoding="utf-8")

    files = scan_supported_files(tmp_path)

    assert [item.name for item in files] == ["a.pdf", "b.md"]
```

```python
from pathlib import Path

from case_organizer.scanner.file_index import FileIndex


def test_file_index_detects_unchanged_file(tmp_path: Path):
    source = tmp_path / "doc.md"
    source.write_text("hello", encoding="utf-8")

    index = FileIndex(tmp_path / "manifest.json")
    first = index.track(source)
    second = index.track(source)

    assert first.should_process is True
    assert second.should_process is False
```

- [ ] **Step 2: Add file type and scanner modules**

```python
SUPPORTED_EXTENSIONS = {
    ".csv",
    ".doc",
    ".docx",
    ".jpeg",
    ".jpg",
    ".md",
    ".pdf",
    ".png",
    ".txt",
    ".webp",
    ".xls",
    ".xlsx",
}
```

```python
from pathlib import Path

from .file_types import SUPPORTED_EXTENSIONS


def scan_supported_files(root: Path) -> list[Path]:
    files = [
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]
    return sorted(files, key=lambda path: str(path).lower())
```

- [ ] **Step 3: Add the incremental index**

```python
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path


@dataclass
class TrackResult:
    file_id: str
    should_process: bool


class FileIndex:
    def __init__(self, index_path: Path):
        self.index_path = index_path
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self._data = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {"files": {}}

    def track(self, path: Path) -> TrackResult:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        key = str(path.resolve())
        current = {"sha256": digest, "mtime": path.stat().st_mtime}
        previous = self._data["files"].get(key)
        should_process = previous != current
        self._data["files"][key] = current
        self.index_path.write_text(json.dumps(self._data, ensure_ascii=False, indent=2), encoding="utf-8")
        return TrackResult(file_id=digest, should_process=should_process)
```

- [ ] **Step 4: Run scanner tests**

Run:

```bash
cd case-organizer && pytest tests/test_file_scanner.py tests/test_file_index.py -v
```

Expected:

- PASS with deterministic scanning order and correct incremental detection

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/scanner case-organizer/tests/test_file_scanner.py case-organizer/tests/test_file_index.py
git commit -m "feat: add file scanning and incremental index"
```

## Task 3: Implement Local Readers And MinerU Client

**Files:**
- Create: `case-organizer/case_organizer/extract/local_readers.py`
- Create: `case-organizer/case_organizer/extract/mineru_client.py`
- Create: `case-organizer/case_organizer/extract/mineru_runner.py`
- Modify: `case-organizer/case_organizer/config.py`
- Test: `case-organizer/tests/test_local_readers.py`

- [ ] **Step 1: Write the failing local reader tests**

```python
from pathlib import Path

from case_organizer.extract.local_readers import read_local_text


def test_read_local_text_supports_markdown(tmp_path: Path):
    path = tmp_path / "note.md"
    path.write_text("# 标题\n正文", encoding="utf-8")

    result = read_local_text(path)

    assert result.text_content == "# 标题\n正文"
    assert result.reader == "local_text"
```

- [ ] **Step 2: Implement local text and csv readers**

```python
from dataclasses import dataclass
from pathlib import Path

import pandas as pd


@dataclass
class LocalReadResult:
    text_content: str
    reader: str
    tables: list[dict]


def read_local_text(path: Path) -> LocalReadResult:
    return LocalReadResult(
        text_content=path.read_text(encoding="utf-8"),
        reader="local_text",
        tables=[],
    )


def read_local_csv(path: Path) -> LocalReadResult:
    df = pd.read_csv(path)
    return LocalReadResult(
        text_content=df.to_markdown(index=False),
        reader="local_csv",
        tables=[{"name": path.name, "rows": df.to_dict(orient="records")}],
    )
```

- [ ] **Step 3: Implement the MinerU API client and runner**

```python
import httpx
from dataclasses import dataclass


@dataclass
class MinerUBatchSubmission:
    batch_id: str
    file_urls: list[str]


class MinerUClient:
    def __init__(self, settings):
        self.settings = settings
        self.http = httpx.AsyncClient()

    async def get_presigned_urls(self, files: list[dict], model_version: str = "vlm") -> dict:
        headers = {"Authorization": f"Bearer {self.settings.mineru_api_token}", "Content-Type": "application/json"}
        payload = {"files": files, "model_version": model_version}
        response = await self.http.post(self.settings.mineru_file_urls_endpoint, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        return response.json()
```

```python
from pathlib import Path


async def upload_files(client: MinerUClient, files: list[Path], urls: list[str]) -> None:
    for file_path, put_url in zip(files, urls):
        await client.http.put(put_url, content=file_path.read_bytes(), timeout=None)
```

- [ ] **Step 4: Run reader tests**

Run:

```bash
cd case-organizer && pytest tests/test_local_readers.py -v
```

Expected:

- PASS with markdown and csv readers returning structured local results

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/extract case-organizer/tests/test_local_readers.py case-organizer/case_organizer/config.py
git commit -m "feat: add local readers and MinerU client"
```

## Task 4: Implement Archive Resolution And Document Normalization

**Files:**
- Create: `case-organizer/case_organizer/models/document.py`
- Create: `case-organizer/case_organizer/extract/archive_resolver.py`
- Create: `case-organizer/case_organizer/extract/document_normalizer.py`
- Create: `case-organizer/tests/test_archive_resolver.py`
- Create: `case-organizer/tests/test_document_normalizer.py`
- Create: `case-organizer/tests/fixtures/mineru_result/result/`

- [ ] **Step 1: Write the failing archive resolver test**

```python
from pathlib import Path

from case_organizer.extract.archive_resolver import resolve_result_directory


def test_resolve_result_directory_picks_expected_primary_files(tmp_path: Path):
    result_dir = tmp_path / "result"
    result_dir.mkdir()
    (result_dir / "full.md").write_text("病理结果", encoding="utf-8")
    (result_dir / "content_list_v2.json").write_text("{}", encoding="utf-8")
    (result_dir / "layout.json").write_text("{}", encoding="utf-8")

    manifest = resolve_result_directory(source_file="sample.pdf", result_zip_path=tmp_path / "result.zip", extract_dir=result_dir)

    assert manifest.primary_text_path.endswith("full.md")
    assert manifest.primary_structured_path.endswith("content_list_v2.json")
```

- [ ] **Step 2: Define the manifest and envelope models**

```python
from pydantic import BaseModel


class ExtractionManifest(BaseModel):
    job_id: str
    source_file: str
    result_zip_path: str
    extract_dir: str
    primary_text_path: str | None = None
    primary_structured_path: str | None = None
    layout_path: str | None = None
    origin_pdf_path: str | None = None
    asset_paths: list[str] = []
    detected_files: list[str] = []
    status: str
    resolver_version: str = "v1"


class DocumentEnvelope(BaseModel):
    file_id: str
    file_path: str
    file_type: str
    extract_status: str
    ocr_used: bool
    result_zip_path: str | None = None
    primary_text_path: str | None = None
    primary_structured_path: str | None = None
    layout_path: str | None = None
    origin_pdf_path: str | None = None
    text_content: str = ""
    tables: list[dict] = []
    attachments: list[str] = []
    source_meta: dict = {}
```

- [ ] **Step 3: Implement the resolver and normalizer**

```python
from pathlib import Path
import uuid

from case_organizer.models.document import ExtractionManifest


def resolve_result_directory(source_file: str, result_zip_path: Path, extract_dir: Path) -> ExtractionManifest:
    files = sorted(path.relative_to(extract_dir).as_posix() for path in extract_dir.rglob("*") if path.is_file())
    md_candidates = [name for name in files if name == "full.md"] + [name for name in files if name.endswith(".md") and name != "full.md"]
    structured_candidates = (
        [name for name in files if name == "content_list_v2.json"]
        + [name for name in files if name.endswith("_content_list.json")]
        + [name for name in files if name == "layout.json"]
        + [name for name in files if name.endswith("_model.json")]
    )
    origin_pdf = next((name for name in files if name.endswith("_origin.pdf")), None)
    assets = [name for name in files if name.startswith("images/")]

    return ExtractionManifest(
        job_id=str(uuid.uuid4()),
        source_file=source_file,
        result_zip_path=str(result_zip_path),
        extract_dir=str(extract_dir),
        primary_text_path=str(extract_dir / md_candidates[0]) if md_candidates else None,
        primary_structured_path=str(extract_dir / structured_candidates[0]) if structured_candidates else None,
        layout_path=str(extract_dir / "layout.json") if "layout.json" in files else None,
        origin_pdf_path=str(extract_dir / origin_pdf) if origin_pdf else None,
        asset_paths=[str(extract_dir / item) for item in assets],
        detected_files=files,
        status="resolved",
    )
```

```python
import json
from pathlib import Path

from case_organizer.models.document import DocumentEnvelope, ExtractionManifest


def normalize_manifest(manifest: ExtractionManifest, file_id: str, file_type: str) -> DocumentEnvelope:
    text_content = Path(manifest.primary_text_path).read_text(encoding="utf-8") if manifest.primary_text_path else ""
    structured_payload = json.loads(Path(manifest.primary_structured_path).read_text(encoding="utf-8")) if manifest.primary_structured_path else {}
    tables = structured_payload.get("tables", []) if isinstance(structured_payload, dict) else []

    return DocumentEnvelope(
        file_id=file_id,
        file_path=manifest.source_file,
        file_type=file_type,
        extract_status=manifest.status,
        ocr_used=True,
        result_zip_path=manifest.result_zip_path,
        primary_text_path=manifest.primary_text_path,
        primary_structured_path=manifest.primary_structured_path,
        layout_path=manifest.layout_path,
        origin_pdf_path=manifest.origin_pdf_path,
        text_content=text_content,
        tables=tables,
        attachments=manifest.asset_paths,
        source_meta={"detected_files": manifest.detected_files},
    )
```

- [ ] **Step 4: Run manifest tests**

Run:

```bash
cd case-organizer && pytest tests/test_archive_resolver.py tests/test_document_normalizer.py -v
```

Expected:

- PASS with `full.md` and `content_list_v2.json` selected deterministically

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/models case-organizer/case_organizer/extract case-organizer/tests/test_archive_resolver.py case-organizer/tests/test_document_normalizer.py
git commit -m "feat: add MinerU manifest resolver and document envelope"
```

## Task 5: Implement Standard Case Model And Fact Extraction

**Files:**
- Create: `case-organizer/case_organizer/models/case_data.py`
- Create: `case-organizer/case_organizer/normalize/fact_extractor.py`
- Create: `case-organizer/case_organizer/normalize/template_mapper.py`
- Create: `case-organizer/tests/test_fact_extractor.py`

- [ ] **Step 1: Write the failing fact extraction test**

```python
from case_organizer.models.document import DocumentEnvelope
from case_organizer.normalize.fact_extractor import extract_candidate_case


def test_extract_candidate_case_from_markdown_text():
    envelope = DocumentEnvelope(
        file_id="1",
        file_path="病例.md",
        file_type=".md",
        extract_status="resolved",
        ocr_used=False,
        text_content="病名\n胰腺导管腺癌pT3N0M0\n2025-05-20至今：北京协和医院使用全量nalirifox方案进行术后辅助化疗9次。",
        tables=[],
        attachments=[],
        source_meta={},
    )

    candidate = extract_candidate_case([envelope])

    assert candidate.diagnosis.primary_diagnosis == "胰腺导管腺癌pT3N0M0"
    assert candidate.treatments[0].regimen_name == "nalirifox"
```

- [ ] **Step 2: Define the standard case model**

```python
from pydantic import BaseModel, Field


class PatientProfile(BaseModel):
    name: str | None = None
    age: int | None = None
    sex: str | None = None
    phone: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    medical_record_no: str | None = None


class Diagnosis(BaseModel):
    primary_diagnosis: str | None = None
    stage: str | None = None
    initial_diagnosis_date: str | None = None
    current_phase: str | None = None
    surgery_summary: str | None = None


class TreatmentPhase(BaseModel):
    phase_id: str
    regimen_name: str
    start_date: str | None = None
    end_date: str | None = None
    intent: str | None = None
    cycles: str | None = None
    adverse_events: list[str] = Field(default_factory=list)


class StandardCase(BaseModel):
    patient_profile: PatientProfile = PatientProfile()
    diagnosis: Diagnosis = Diagnosis()
    pathology: dict = Field(default_factory=dict)
    genomics: list[dict] = Field(default_factory=list)
    lab_results: list[dict] = Field(default_factory=list)
    tumor_markers: list[dict] = Field(default_factory=list)
    treatments: list[TreatmentPhase] = Field(default_factory=list)
    imaging_studies: list[dict] = Field(default_factory=list)
    clinical_events: list[dict] = Field(default_factory=list)
    current_status: dict = Field(default_factory=dict)
    consult_questions: list[dict] = Field(default_factory=list)
    source_documents: list[dict] = Field(default_factory=list)
```

- [ ] **Step 3: Implement candidate extraction and template mapping**

```python
import re

from case_organizer.models.case_data import StandardCase, TreatmentPhase


def extract_candidate_case(envelopes):
    case = StandardCase()
    joined = "\n".join(envelope.text_content for envelope in envelopes if envelope.text_content)

    diagnosis_match = re.search(r"病名\s+([^\n]+)", joined)
    if diagnosis_match:
        case.diagnosis.primary_diagnosis = diagnosis_match.group(1).strip()

    treatment_match = re.search(r"(nalirifox|FOLFIRINOX|AG方案|白蛋白紫杉醇)", joined, re.IGNORECASE)
    if treatment_match:
        case.treatments.append(TreatmentPhase(phase_id="phase-1", regimen_name=treatment_match.group(1)))

    case.source_documents = [{"file_path": envelope.file_path, "file_id": envelope.file_id} for envelope in envelopes]
    return case
```

```python
def to_printable_sections(case):
    return [
        {"title": "患者基本信息", "content": case.patient_profile.model_dump()},
        {"title": "核心诊断", "content": case.diagnosis.model_dump()},
        {"title": "既往治疗史", "content": [item.model_dump() for item in case.treatments]},
    ]
```

- [ ] **Step 4: Run fact extraction tests**

Run:

```bash
cd case-organizer && pytest tests/test_fact_extractor.py -v
```

Expected:

- PASS with diagnosis and treatment extracted into the standard case model

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/models/case_data.py case-organizer/case_organizer/normalize case-organizer/tests/test_fact_extractor.py
git commit -m "feat: add standard case model and candidate fact extraction"
```

## Task 6: Implement Exporters For ca199_toolbox

**Files:**
- Create: `case-organizer/case_organizer/exporters/csv_exporter.py`
- Create: `case-organizer/case_organizer/exporters/json_exporter.py`
- Create: `case-organizer/tests/test_csv_exporter.py`

- [ ] **Step 1: Write the failing exporter test**

```python
from pathlib import Path

from case_organizer.exporters.csv_exporter import export_indicators_csv
from case_organizer.models.case_data import StandardCase


def test_export_indicators_csv_writes_expected_header(tmp_path: Path):
    case = StandardCase(tumor_markers=[{
        "test_date": "2025-04-01",
        "indicator_name": "CA199",
        "indicator_value": 24.5,
        "unit": "U/mL",
        "reference_low": 0,
        "reference_high": 37,
        "source_file": "marker.pdf",
        "source_page": 1,
        "confidence": 0.95,
    }])

    path = export_indicators_csv(case, tmp_path)

    text = path.read_text(encoding="utf-8")
    assert "test_date,indicator_name,indicator_value" in text
    assert "CA199" in text
```

- [ ] **Step 2: Implement CSV and JSON exporters**

```python
from pathlib import Path
import csv


def export_indicators_csv(case, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "indicators.csv"
    fieldnames = [
        "test_date",
        "indicator_name",
        "indicator_value",
        "unit",
        "reference_low",
        "reference_high",
        "source_file",
        "source_page",
        "confidence",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in case.tumor_markers:
            writer.writerow(row)
    return path
```

```python
from pathlib import Path
import json


def export_patient_summary(case, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "patient_summary.json"
    payload = {
        "patient_name": case.patient_profile.name,
        "primary_diagnosis": case.diagnosis.primary_diagnosis,
        "key_metrics": [row.get("indicator_name") for row in case.tumor_markers],
        "current_phase": case.diagnosis.current_phase,
        "last_updated_at": None,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return path
```

- [ ] **Step 3: Add medication and timeline exporters**

```python
def export_medications_csv(case, output_dir: Path) -> Path:
    path = output_dir / "medications.csv"
    fieldnames = ["start_date", "end_date", "drug_name", "tag", "source_file", "confidence"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for item in case.treatments:
            writer.writerow({
                "start_date": item.start_date,
                "end_date": item.end_date,
                "drug_name": item.regimen_name,
                "tag": item.regimen_name,
                "source_file": "",
                "confidence": 1.0,
            })
    return path
```

```python
def export_timeline_events_csv(case, output_dir: Path) -> Path:
    path = output_dir / "timeline_events.csv"
    fieldnames = ["event_date", "event_type", "title", "description", "doctor_note", "patient_note", "next_step", "source_file"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for item in case.clinical_events:
            writer.writerow(item)
    return path
```

- [ ] **Step 4: Run exporter tests**

Run:

```bash
cd case-organizer && pytest tests/test_csv_exporter.py -v
```

Expected:

- PASS with indicator export matching the `ca199_toolbox` contract

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/exporters case-organizer/tests/test_csv_exporter.py
git commit -m "feat: add standard exporters for ca199 toolbox"
```

## Task 7: Implement The Local Review App

**Files:**
- Create: `case-organizer/case_organizer/review/app.py`
- Create: `case-organizer/case_organizer/review/storage.py`
- Create: `case-organizer/case_organizer/review/templates/index.html`
- Modify: `case-organizer/case_organizer/cli.py`
- Test: `case-organizer/tests/test_review_app.py`

- [ ] **Step 1: Write the failing review app test**

```python
from fastapi.testclient import TestClient

from case_organizer.review.app import build_review_app


def test_review_app_renders_candidate_case(tmp_path):
    app = build_review_app(tmp_path)
    client = TestClient(app)

    response = client.get("/")

    assert response.status_code == 200
    assert "候选病情整理" in response.text
```

- [ ] **Step 2: Implement the review storage and app**

```python
import json
from pathlib import Path


class ReviewStorage:
    def __init__(self, workspace_dir: Path):
        self.workspace_dir = workspace_dir

    def load_candidate_case(self) -> dict:
        path = self.workspace_dir / "candidate_case.json"
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}

    def save_candidate_case(self, payload: dict) -> None:
        path = self.workspace_dir / "candidate_case.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
```

```python
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from .storage import ReviewStorage


def build_review_app(workspace_dir: Path) -> FastAPI:
    app = FastAPI(title="Case Organizer Review")
    storage = ReviewStorage(workspace_dir)
    templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

    @app.get("/", response_class=HTMLResponse)
    async def index(request: Request):
        return templates.TemplateResponse(
            request,
            "index.html",
            {"candidate": storage.load_candidate_case(), "title": "候选病情整理"},
        )

    return app
```

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>{{ title }}</title>
  </head>
  <body>
    <h1>{{ title }}</h1>
    <pre>{{ candidate | tojson(indent=2) }}</pre>
  </body>
</html>
```

- [ ] **Step 3: Wire the `review` CLI command**

```python
import uvicorn
from pathlib import Path

from case_organizer.review.app import build_review_app


@app.command()
def review(path: str, host: str = "127.0.0.1", port: int = 8765) -> None:
    uvicorn.run(build_review_app(Path(path)), host=host, port=port)
```

- [ ] **Step 4: Run the review app tests**

Run:

```bash
cd case-organizer && pytest tests/test_review_app.py -v
```

Expected:

- PASS with the review page rendering candidate case content

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/review case-organizer/case_organizer/cli.py case-organizer/tests/test_review_app.py
git commit -m "feat: add local web review app"
```

## Task 8: Orchestrate The End-To-End Scan Pipeline

**Files:**
- Modify: `case-organizer/case_organizer/cli.py`
- Modify: `case-organizer/case_organizer/scanner/file_scanner.py`
- Modify: `case-organizer/case_organizer/scanner/file_index.py`
- Modify: `case-organizer/case_organizer/extract/mineru_runner.py`
- Modify: `case-organizer/case_organizer/extract/document_normalizer.py`
- Modify: `case-organizer/case_organizer/normalize/fact_extractor.py`
- Modify: `case-organizer/case_organizer/exporters/*.py`
- Create: `case-organizer/tests/test_pipeline_smoke.py`

- [ ] **Step 1: Write the failing pipeline smoke test**

```python
from pathlib import Path

from typer.testing import CliRunner

from case_organizer.cli import app


def test_scan_command_creates_normalized_outputs(tmp_path: Path):
    source_dir = tmp_path / "source"
    source_dir.mkdir()
    (source_dir / "case.md").write_text("病名\n胰腺导管腺癌pT3N0M0", encoding="utf-8")

    workspace = tmp_path / "workspace"
    runner = CliRunner()
    result = runner.invoke(app, ["scan", str(source_dir), "--workspace", str(workspace)])

    assert result.exit_code == 0
    assert (workspace / "normalized" / "patient_summary.json").exists()
```

- [ ] **Step 2: Implement the scan orchestration**

```python
from pathlib import Path


@app.command()
def scan(path: str, workspace: str = "./workspace") -> None:
    source_dir = Path(path)
    workspace_dir = Path(workspace)
    normalized_dir = workspace_dir / "normalized"
    normalized_dir.mkdir(parents=True, exist_ok=True)

    envelopes = []
    for file_path in scan_supported_files(source_dir):
      if file_path.suffix.lower() in {".md", ".txt"}:
          local = read_local_text(file_path)
          envelopes.append(
              DocumentEnvelope(
                  file_id=file_path.stem,
                  file_path=str(file_path),
                  file_type=file_path.suffix.lower(),
                  extract_status="resolved",
                  ocr_used=False,
                  text_content=local.text_content,
                  tables=local.tables,
                  attachments=[],
                  source_meta={"reader": local.reader},
              )
          )

    candidate_case = extract_candidate_case(envelopes)
    export_patient_summary(candidate_case, normalized_dir)
    export_indicators_csv(candidate_case, normalized_dir)
    export_medications_csv(candidate_case, normalized_dir)
    export_timeline_events_csv(candidate_case, normalized_dir)
```

- [ ] **Step 3: Persist candidate case and manifest**

```python
import json


candidate_path = workspace_dir / "candidate_case.json"
candidate_path.write_text(candidate_case.model_dump_json(indent=2), encoding="utf-8")

manifest_path = workspace_dir / "manifest.json"
manifest_path.write_text(
    json.dumps(
        {
            "source_dir": str(source_dir),
            "workspace_dir": str(workspace_dir),
            "files_processed": [envelope.file_path for envelope in envelopes],
        },
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
```

- [ ] **Step 4: Run the pipeline smoke test**

Run:

```bash
cd case-organizer && pytest tests/test_pipeline_smoke.py -v
```

Expected:

- PASS with `normalized/patient_summary.json` created from a markdown-only case

- [ ] **Step 5: Commit**

```bash
git add case-organizer/case_organizer/cli.py case-organizer/tests/test_pipeline_smoke.py case-organizer/case_organizer
git commit -m "feat: wire end-to-end case scan pipeline"
```

## Task 9: Documentation And Verification

**Files:**
- Modify: `case-organizer/README.md`
- Create: `case-organizer/docs/output-contract.md`

- [ ] **Step 1: Document the command workflow**

```md
## Commands

```bash
case-organizer scan /path/to/case --workspace ./workspace
case-organizer review ./workspace
case-organizer export ./workspace
```

The `scan` command creates:
- `manifest.json`
- `candidate_case.json`
- `normalized/indicators.csv`
- `normalized/medications.csv`
- `normalized/timeline_events.csv`
- `normalized/patient_summary.json`
```

- [ ] **Step 2: Document the export contract**

```md
# Output Contract

The `normalized/` directory is the file-level interface between `case-organizer` and `ca199_toolbox`.

Required files:
- `indicators.csv`
- `medications.csv`
- `timeline_events.csv`
- `patient_summary.json`
```

- [ ] **Step 3: Run full verification**

Run:

```bash
cd case-organizer && pytest -v
```

Expected:

- PASS with scanner, manifest, extraction, exporter, review, and pipeline tests all green

- [ ] **Step 4: Check package entrypoint**

Run:

```bash
cd case-organizer && python -m case_organizer.cli --help
```

Expected:

- CLI help output shows all three root commands without import errors

- [ ] **Step 5: Commit**

```bash
git add case-organizer/README.md case-organizer/docs/output-contract.md
git commit -m "docs: document case-organizer workflow and output contract"
```

## Coverage Check

- `指定目录扫描` is covered in Task 2 and Task 8.
- `常见格式支持` is covered in Task 2 and Task 3.
- `MinerU 主解析后端` is covered in Task 3 and Task 4.
- `Manifest 主入口` is covered in Task 4.
- `标准病情结构` is covered in Task 5.
- `对接 ca199_toolbox 的标准化输出` is covered in Task 6.
- `CLI 主入口 + Web 校对页` is covered in Task 7 and Task 8.

## Risks And Mitigations

1. `MinerU 返回目录变化`
   Mitigation: keep all result discovery inside `archive_resolver.py` and cover it with fixture-based tests.

2. `抽取规则不足以覆盖真实病例`
   Mitigation: keep fact extraction candidate-based and review-driven; do not auto-finalize without human confirmation.

3. `导出契约漂移`
   Mitigation: write exporter tests against exact headers and document the `normalized/` contract.

4. `Review 页范围膨胀`
   Mitigation: keep first release read-and-confirm only; no embedded OCR or batch orchestration inside Web.

## Execution Handoff

Plan complete and saved to `docs/product/2026-04-01-case-organizer-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
