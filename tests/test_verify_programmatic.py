import json
import types
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

import pytest

import scripts.verify_programmatic as vp


def make_entry(tmpdir, sym_version="1.12.0"):
    data = {
        "result_name": "dummy",
        "result_equations": [],
        "explanation": "test",
        "equations_assumptions": [],
        "definitions": [],
        "derivation": [],
        "derivation_explanation": [],
        "programmatic_verification": {
            "language": "python 3.11.12",
            "library": f"sympy {sym_version}",
            "code": ["print('ok')"]
        },
        "domain": "test",
        "references": [],
        "created_by": "tester",
        "review_status": "draft"
    }
    path = Path(tmpdir) / "entry.json"
    path.write_text(json.dumps(data))
    return path


def test_run_verifications_success(tmp_path, monkeypatch):
    make_entry(tmp_path)
    monkeypatch.setattr(vp, "entries_dir", tmp_path)
    dummy = types.SimpleNamespace(__version__="1.12.0")
    monkeypatch.setitem(sys.modules, "sympy", dummy)
    vp.run_verifications()


def test_version_mismatch(tmp_path, monkeypatch):
    make_entry(tmp_path, sym_version="0.0.1")
    monkeypatch.setattr(vp, "entries_dir", tmp_path)
    dummy = types.SimpleNamespace(__version__="1.12.0")
    monkeypatch.setitem(sys.modules, "sympy", dummy)
    with pytest.raises(RuntimeError):
        vp.run_verifications()
