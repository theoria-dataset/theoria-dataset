# THEORIA dataset, a curated, high quality dataset of Theoretical Physics equations

THEORIA stands for Trusted Human-curated Equations Open-licensed Reproducible Itemized Archive.

> **🚀 Jump in!** We’ve kicked off THEORIA with a handful of killer entries, and we need your help to grow it. If you’re a theoretical‑physics buff—researcher, educator, or enthusiast—now’s the time to contribute your favorite equations, crisp derivations, and clear explanations.

## Why THEORIA?

There is a [lack of curated datasets](https://manuelsh.github.io/blog/2025/datasets-for-advancing-Theoretical-Physics/) with all important equations and derivations of theoretical physics to train better machine learning models, beyond raw text in papers and books.

THEORIA bridges that gap; it is the first datasets to provide a high-quality collection of theoretical physics equations, its respective derivations and explanations in a structured format.

We have an open license and encourage contributions from researchers, educators, and enthusiasts in the field of theoretical physics.

## What's inside?

Each entry in THEORIA represents a theoretical physics result – for example, the Lorentz transformations.

- **High quality**: Each entry is crafted and carefully reviewed by someone with a background in physics. Contributor name or ORCID is baked into the metadata.

- **Formal derivations and annotated proofs**: AsciiMath step by step, annotated for easier understanding and programmatic formalization to guarantee correctness.

- **Self‑contained JSON files**: One entry per file under `entries/` folder, so you can fork, version, and collaborate without conflicts.

- **Domain tags**: ArXiv‑style categories (e.g., gr-qc, hep-th) for easy filtering.

- **Global manifest & changelog**: `manifest.json` tracks versions, file list, covered domains, and updates.

- **Open license**: `CC‑BY 4.0`—use it, remix it, teach with it.

## Repository Layout

```
theoretical-physics-dataset/
├── .github/
│   └── workflows/
│       └── validate_entries.yaml      # CI workflow for JSON Schema validation of entries
├── entries/                           # Folder for individual dataset entries (one JSON file per entry)
│   └── lorentz_transformations.json   # Example entry file
├── schemas/
│   └── entry.schema.json              # JSON Schema defining required fields and rules for each entry
├── manifest.json                      # Global metadata, dataset version, changelog, and entry list
├── CONTRIBUTING.md                    # Detailed guidelines for contributors
└── README.md                          # Project overview and usage instructions (this file)
```

## How to Contribute

We are _tiny_ right now, every new entry counts! To contribute:

1. **Fork and clone**
2. **Create a JSON in `entries/`** following the instruciont in the [CONTRIBUTING.md](./CONTRIBUTING.md) file and the schema in `schemas/entry.schema.json`.
3. **Submit your Pull Request**. CI will automatically validate your JSON against the schema. If it passes, we will review and merge it.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## Using THEORIA to train Machine Learning models

You can either use the individual JSON files or automatically generate a single merged file using a script (e.g., with `jq`):

```bash
jq -s '.' entries/*.json > dataset.json
```

Feed `dataset.json` (or per‑entry files) straight into your training pipeline.

## License & Citation

Licensed under [CC-BY 4.0 License](https://creativecommons.org/licenses/by/4.0/legalcode.en). If you use it please cite it as:

```
THEORIA Dataset, 2025, v0.0.1. Available at: https://github.com/theoria-dataset/theoria-dataset
```

## Contact

Issues, questions, or exciting physics ideas? Drop an issue on GitHub—and let’s build this thing together.
