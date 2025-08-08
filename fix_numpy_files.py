#!/usr/bin/env python3
"""
Script to fix numpy/matplotlib dependencies in JSON entry files
Replaces numpy with math and removes matplotlib completely
"""

import json
import re
from pathlib import Path

# Files that need numpy/matplotlib removal based on previous grep search
files_to_fix = [
    "work_energy_theorem.json",
    "wave_equation.json", 
    "waves_interference.json",
    "snells_law.json",
    "simple_harmonic_motion.json",
    "second_law_thermodynamics_clausius.json", 
    "photoelectric_effect.json",
    "ohms_law.json",
    "magnetic_field.json",
    "kirchhoffs_laws.json",
    "ideal_gas_law.json", 
    "hookes_law.json",
    "heisenberg_uncertainty_principle.json",
    "heat_equation.json",
    "gravitational_force.json",
    "gauss_law.json",
    "fluid_dynamics_bernoulli.json",
    "electric_potential.json",
    "electric_field.json", 
    "doppler_effect.json",
    "conservation_of_momentum.json",
    "conservation_of_energy.json",
    "compton_scattering.json"
]

def fix_file(filepath):
    """Fix a single JSON file by removing numpy/matplotlib dependencies"""
    print(f"Fixing {filepath.name}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'programmatic_verification' not in data:
        print(f"  No programmatic_verification found in {filepath.name}")
        return False
    
    code = data['programmatic_verification']['code']
    updated = False
    
    # Process each line of code
    for i, line in enumerate(code):
        original_line = line
        
        # Remove numpy and matplotlib imports
        if 'import numpy as np' in line:
            code[i] = line.replace('import numpy as np', 'import math')
            updated = True
            print(f"  Replaced numpy import with math")
        elif 'import matplotlib.pyplot as plt' in line:
            code[i] = ''  # Remove matplotlib entirely
            updated = True 
            print(f"  Removed matplotlib import")
        elif 'from mpl_toolkits' in line:
            code[i] = ''  # Remove mpl_toolkits imports
            updated = True
            
        # Replace np.isclose with math.isclose
        if 'np.isclose' in line:
            code[i] = line.replace('np.isclose', 'math.isclose')
            updated = True
            print(f"  Replaced np.isclose with math.isclose")
            
        # Replace other common numpy functions
        if 'np.' in line and 'np.isclose' not in original_line:
            # For other numpy functions, warn but don't auto-replace
            print(f"  WARNING: Found numpy usage that needs manual review: {line.strip()}")
            
        # Remove matplotlib plotting code (plt.*)
        if 'plt.' in line:
            code[i] = ''  # Remove plotting lines
            updated = True
            print(f"  Removed matplotlib plotting line")
    
    # Clean up empty lines but preserve structure
    code = [line for line in code if line != '']
    data['programmatic_verification']['code'] = code
    
    if updated:
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  ✅ Updated {filepath.name}")
        return True
    else:
        print(f"  No changes needed for {filepath.name}")
        return False

def main():
    entries_dir = Path("entries")
    fixed_count = 0
    
    for filename in files_to_fix:
        filepath = entries_dir / filename
        if filepath.exists():
            if fix_file(filepath):
                fixed_count += 1
        else:
            print(f"File not found: {filename}")
    
    print(f"\n✅ Fixed {fixed_count} files")
    print("Run tests again to check for remaining issues")

if __name__ == "__main__":
    main() 