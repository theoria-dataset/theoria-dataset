import json
import sys
import os
import types
import importlib
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest

import scripts.verify_programmatic as vp

class DummySympy(types.ModuleType):
    __version__ = "1.12.0"

dummy_sympy = DummySympy('sympy')


def test_run_verifications_success(monkeypatch, tmp_path):
    entry = {
        "programmatic_verification": {
            "language": f"python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "library": "sympy 1.12.0",
            "code": [
                "import sympy as sp",
                "assert sp.__version__ == '1.12.0'"
            ]
        }
    }
    p = tmp_path / "ok.json"
    p.write_text(json.dumps(entry))
    monkeypatch.setattr(vp, "entries_dir", str(tmp_path))
    monkeypatch.setattr(importlib, "import_module", lambda name: dummy_sympy)
    monkeypatch.setitem(sys.modules, "sympy", dummy_sympy)
    vp.run_verifications()


def test_version_mismatch(monkeypatch, tmp_path):
    entry = {
        "programmatic_verification": {
            "language": f"python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "library": "sympy 0.1",
            "code": ["pass"]
        }
    }
    p = tmp_path / "bad.json"
    p.write_text(json.dumps(entry))
    monkeypatch.setattr(vp, "entries_dir", str(tmp_path))
    monkeypatch.setattr(importlib, "import_module", lambda name: dummy_sympy)
    monkeypatch.setitem(sys.modules, "sympy", dummy_sympy)
    with pytest.raises(RuntimeError):
        vp.run_verifications()
