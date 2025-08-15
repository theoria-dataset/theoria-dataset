#!/usr/bin/env python3
"""
Generate Jupyter notebooks from THEORIA dataset entries.
Creates notebooks with programmatic verification code that can be opened directly in Google Colab.
"""

import json
import os
import sys
from pathlib import Path

def create_notebook(entry_data):
    """Create a Jupyter notebook from an entry's data."""
    entry_name = entry_data['result_name']
    entry_id = entry_data['result_id']
    library = entry_data['programmatic_verification']['library']
    code = entry_data['programmatic_verification']['code']
    explanation = entry_data['explanation']
    
    # Create notebook structure
    notebook = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {
            "colab": {
                "provenance": []
            },
            "kernelspec": {
                "name": "python3",
                "display_name": "Python 3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    f"# {entry_name}\n",
                    "\n",
                    f"This notebook contains the programmatic verification for the **{entry_name}** entry from the THEORIA dataset.\n",
                    "\n",
                    f"**Entry ID:** {entry_id}  \n",
                    f"**Required Library:** {library}\n",
                    "\n",
                    "## Description\n",
                    f"{explanation}\n",
                    "\n",
                    "## Installation\n",
                    "First, let's install the required library:"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "source": [
                    f"# Install required library with exact version\n",
                    f"!pip install {library.replace(' ', '==')}"
                ],
                "execution_count": None,
                "outputs": []
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Programmatic Verification\n",
                    "\n",
                    "The following code verifies the derivation mathematically:"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "source": [line + "\n" for line in code],  # Add newlines to each line
                "execution_count": None,
                "outputs": []
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Source\n",
                    "\n",
                    f"📖 **View this entry:** [theoria-dataset.org/entries.html?entry={entry_id}.json](https://theoria-dataset.org/entries.html?entry={entry_id}.json)\n",
                    "\n",
                    "This verification code is part of the [THEORIA dataset](https://github.com/theoria-dataset/theoria-dataset), ",
                    "a curated collection of theoretical physics derivations with programmatic verification.\n",
                    "\n",
                    "**License:** CC-BY 4.0"
                ]
            }
        ]
    }
    
    return notebook

def generate_notebooks():
    """Generate notebooks for all entries."""
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    entries_dir = repo_root / "entries"
    notebooks_dir = repo_root / "notebooks"
    
    # Ensure notebooks directory exists
    notebooks_dir.mkdir(exist_ok=True)
    
    # Process each entry
    entries_processed = 0
    errors = []
    
    for entry_file in entries_dir.glob("*.json"):
        try:
            print(f"Processing {entry_file.name}...")
            
            # Load entry data
            with open(entry_file, 'r', encoding='utf-8') as f:
                entry_data = json.load(f)
            
            # Generate notebook
            notebook = create_notebook(entry_data)
            
            # Save notebook
            notebook_filename = f"{entry_data['result_id']}_verification.ipynb"
            notebook_path = notebooks_dir / notebook_filename
            
            with open(notebook_path, 'w', encoding='utf-8') as f:
                json.dump(notebook, f, indent=2, ensure_ascii=False)
            
            entries_processed += 1
            print(f"[OK] Created {notebook_filename}")
            
        except Exception as e:
            error_msg = f"Error processing {entry_file.name}: {str(e)}"
            errors.append(error_msg)
            print(f"[ERROR] {error_msg}")
    
    # Summary
    print(f"\n--- Summary ---")
    print(f"Entries processed: {entries_processed}")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(f"  - {error}")
        return 1
    
    print("All notebooks generated successfully!")
    return 0

def generate_single_notebook(entry_id):
    """Generate notebook for a single entry."""
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    entries_dir = repo_root / "entries"
    notebooks_dir = repo_root / "notebooks"
    
    # Ensure notebooks directory exists
    notebooks_dir.mkdir(exist_ok=True)
    
    entry_file = entries_dir / f"{entry_id}.json"
    
    if not entry_file.exists():
        print(f"Error: Entry file {entry_file} not found")
        return 1
    
    try:
        print(f"Processing {entry_file.name}...")
        
        # Load entry data
        with open(entry_file, 'r', encoding='utf-8') as f:
            entry_data = json.load(f)
        
        # Generate notebook
        notebook = create_notebook(entry_data)
        
        # Save notebook
        notebook_filename = f"{entry_data['result_id']}_verification.ipynb"
        notebook_path = notebooks_dir / notebook_filename
        
        with open(notebook_path, 'w', encoding='utf-8') as f:
            json.dump(notebook, f, indent=2, ensure_ascii=False)
        
        print(f"[OK] Created {notebook_filename}")
        return 0
        
    except Exception as e:
        print(f"[ERROR] Error processing {entry_file.name}: {str(e)}")
        return 1

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Generate single notebook
        entry_id = sys.argv[1]
        exit_code = generate_single_notebook(entry_id)
    else:
        # Generate all notebooks
        exit_code = generate_notebooks()
    
    sys.exit(exit_code)