import json
import os
import sys
import importlib


def normalize_version(ver: str):
    """Convert version string to tuple of ints, dropping trailing zeros."""
    parts = [int(x) for x in ver.split('.') if x.isdigit()]
    while parts and parts[-1] == 0:
        parts.pop()
    return tuple(parts)

entries_dir = os.path.join(os.path.dirname(__file__), '..', 'entries')


def run_verifications() -> None:
    """Run all programmatic verifications for dataset entries."""
    current_py_version = '.'.join(map(str, sys.version_info[:3]))

    for fname in sorted(os.listdir(entries_dir)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(entries_dir, fname)
        with open(path, 'r') as f:
            data = json.load(f)
        pv = data.get('programmatic_verification')
        if not pv:
            print(f"{fname}: no programmatic_verification section")
            continue
        language = pv.get('language', '')
        library = pv.get('library', '')
        code_lines = pv.get('code', [])

        py_ver = language.split()[-1]
        lib_parts = library.split()
        lib_name = lib_parts[0]
        lib_ver = lib_parts[1] if len(lib_parts) > 1 else ''

        if not current_py_version.startswith(py_ver):
            raise RuntimeError(
                f"{fname}: Python version {current_py_version} does not match required {py_ver}"
            )

        mod = importlib.import_module(lib_name)
        cur_lib_ver = getattr(mod, '__version__', 'unknown')
        if normalize_version(cur_lib_ver) != normalize_version(lib_ver):
            raise RuntimeError(
                f"{fname}: {lib_name} version {cur_lib_ver} does not match required {lib_ver}"
            )

        code = '\n'.join(code_lines)
        try:
            exec(code, {})
        except Exception as e:
            raise RuntimeError(f"{fname}: code execution failed: {e}")
        print(f"{fname}: verification passed")


if __name__ == "__main__":
    run_verifications()
