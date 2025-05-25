import json
import os
import sys
import importlib


entries_dir = os.path.join(os.path.dirname(__file__), '..', 'entries')


def run_verifications(directory: str | None = None) -> None:
    """Run programmatic verification for all entries in *directory*."""

    if directory is None:
        directory = entries_dir

    current_py_version = '.'.join(map(str, sys.version_info[:3]))

    for fname in sorted(os.listdir(directory)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(directory, fname)
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
        if cur_lib_ver != lib_ver:
            raise RuntimeError(
                f"{fname}: {lib_name} version {cur_lib_ver} does not match required {lib_ver}"
            )

        code = '\n'.join(code_lines)
        exec(code, {})

        print(f"{fname}: verification passed")


if __name__ == "__main__":
    run_verifications()
