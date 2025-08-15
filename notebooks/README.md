# THEORIA Dataset - Jupyter Notebooks

This directory contains pre-generated Jupyter notebooks for each entry in the THEORIA dataset. These notebooks contain the programmatic verification code and can be opened directly in Google Colab.

## Usage

Each notebook is named `{entry_id}_verification.ipynb` and contains:

1. **Installation cell**: Installs the exact library version required
2. **Verification code**: The complete programmatic verification from the entry
3. **Documentation**: Entry description and source attribution

## Opening in Google Colab

You can open any notebook directly in Google Colab using this URL pattern:
```
https://colab.research.google.com/github/theoria-dataset/theoria-dataset/blob/main/notebooks/{entry_id}_verification.ipynb
```

Or click the "Open in Colab" badge on the entry pages at https://theoria-dataset.org

## Generating Notebooks

To regenerate all notebooks:
```bash
python scripts/generate_notebooks.py
```

To generate a single notebook:
```bash
python scripts/generate_notebooks.py {entry_id}
```

## License

These notebooks are derived from the THEORIA dataset and are licensed under CC-BY 4.0.