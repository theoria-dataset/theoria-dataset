import json
import os
import sys
import importlib
import traceback


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
    errors = []
    passed = []

    for fname in sorted(os.listdir(entries_dir)):
        if not fname.endswith('.json'):
            continue
        path = os.path.join(entries_dir, fname)
        
        try:
            with open(path, 'r') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f"❌ {fname}: Invalid JSON format - {e}")
            continue
        except FileNotFoundError:
            errors.append(f"❌ {fname}: File not found")
            continue

        pv = data.get('programmatic_verification')
        if not pv:
            print(f"⚠️  {fname}: no programmatic_verification section - skipping")
            continue

        # Validate required fields
        missing_fields = []
        language = pv.get('language', '')
        library = pv.get('library', '')
        code_lines = pv.get('code', [])
        
        if not language:
            missing_fields.append('language')
        if not library:
            missing_fields.append('library')
        if not code_lines:
            missing_fields.append('code')
            
        if missing_fields:
            errors.append(f"❌ {fname}: Missing required fields in programmatic_verification: {', '.join(missing_fields)}")
            continue

        # Parse versions
        try:
            py_ver = language.split()[-1]
            if not py_ver.replace('.', '').isdigit():
                errors.append(f"❌ {fname}: Invalid Python version format in 'language' field: '{language}'. Expected format: 'python X.Y.Z'")
                continue
        except IndexError:
            errors.append(f"❌ {fname}: Invalid language format: '{language}'. Expected format: 'python X.Y.Z'")
            continue

        try:
            lib_parts = library.split()
            lib_name = lib_parts[0]
            lib_ver = lib_parts[1] if len(lib_parts) > 1 else ''
            if not lib_ver:
                errors.append(f"❌ {fname}: Library version missing in 'library' field: '{library}'. Expected format: 'library_name X.Y.Z'")
                continue
        except IndexError:
            errors.append(f"❌ {fname}: Invalid library format: '{library}'. Expected format: 'library_name X.Y.Z'")
            continue

        # Check Python version compatibility
        if not current_py_version.startswith(py_ver):
            errors.append(f"❌ {fname}: Python version mismatch")
            errors.append(f"   → Required: {py_ver}")
            errors.append(f"   → Available: {current_py_version}")
            errors.append(f"   → Fix: Update 'language' field to 'python {current_py_version}' or install Python {py_ver}")
            continue

        # Check library availability and version
        try:
            mod = importlib.import_module(lib_name)
        except ImportError:
            errors.append(f"❌ {fname}: Library '{lib_name}' not available")
            errors.append(f"   → Fix: Install library with 'pip install {lib_name}=={lib_ver}'")
            continue

        cur_lib_ver = getattr(mod, '__version__', 'unknown')
        if cur_lib_ver == 'unknown':
            errors.append(f"⚠️  {fname}: Cannot determine {lib_name} version - proceeding anyway")
        elif normalize_version(cur_lib_ver) != normalize_version(lib_ver):
            errors.append(f"❌ {fname}: {lib_name} version mismatch")
            errors.append(f"   → Required: {lib_ver}")
            errors.append(f"   → Available: {cur_lib_ver}")
            errors.append(f"   → Fix: Update 'library' field to '{lib_name} {cur_lib_ver}' or install {lib_name}=={lib_ver}")
            continue

        # Execute verification code
        code = '\n'.join(code_lines)
        try:
            # Create a clean execution environment
            exec_globals = {
                '__name__': '__main__',
                '__file__': path,
            }
            exec(code, exec_globals)
            passed.append(f"✅ {fname}: verification passed")
        except Exception as e:
            errors.append(f"❌ {fname}: Verification code failed")
            errors.append(f"   → Error: {type(e).__name__}: {e}")
            
            # Show full stack trace
            stack_trace = traceback.format_exc()
            errors.append(f"   → Stack trace:")
            for line in stack_trace.strip().split('\n'):
                errors.append(f"     {line}")
            
            # Try to provide more specific guidance
            if 'NameError' in str(type(e)):
                errors.append(f"   → Tip: Check if all required imports are included in the code")
            elif 'ImportError' in str(type(e)):
                errors.append(f"   → Tip: Verify library dependencies are correctly specified")
            elif 'AttributeError' in str(type(e)):
                errors.append(f"   → Tip: Check object method names and library API compatibility")
            elif 'ValueError' in str(type(e)) or 'TypeError' in str(type(e)):
                errors.append(f"   → Tip: Verify input parameters and data types in calculations")
            
            # Show problematic code section if possible
            if hasattr(e, 'lineno'):
                try:
                    problem_line = code_lines[e.lineno - 1] if e.lineno <= len(code_lines) else "unknown"
                    errors.append(f"   → Problem near line {e.lineno}: {problem_line.strip()}")
                except:
                    pass
            continue

    # Print summary
    print("\n" + "="*60)
    print("PROGRAMMATIC VERIFICATION SUMMARY")
    print("="*60)
    
    if passed:
        print(f"\n✅ PASSED ({len(passed)} entries):")
        for msg in passed:
            print(f"  {msg}")
    
    if errors:
        print(f"\n❌ FAILED ({len([e for e in errors if e.startswith('❌')])} entries):")
        for msg in errors:
            if msg.startswith('❌'):
                print(f"  {msg}")
            else:
                print(f"    {msg}")
        print(f"\n💡 QUICK FIXES:")
        print(f"  • Check JSON syntax with a validator")
        print(f"  • Ensure all required fields are present")
        print(f"  • Verify Python/library versions match your environment")
        print(f"  • Test verification code in isolation first")
        
        raise RuntimeError(f"Verification failed for {len([e for e in errors if e.startswith('❌')])} entries")
    
    print(f"\n🎉 All {len(passed)} entries passed verification!")


if __name__ == "__main__":
    run_verifications()
