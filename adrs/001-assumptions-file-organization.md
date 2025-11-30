# ADR 001: Assumptions File Organization

## Status
Proposed

## Context
The `globals/assumptions.json` file is growing (currently 39 assumptions, 564 lines) and will become difficult to manage as the dataset scales to hundreds or thousands of assumptions. Main concerns:
- Browsing and finding assumptions in a large file
- Git merge conflicts when multiple contributors edit simultaneously
- No clear organization for discovery

Performance is not a concern - all scripts load the entire file into memory.

## Decision Drivers
- Human usability (browsing, finding, editing assumptions)
- Git workflow (clean diffs, parallel contributions)
- Backward compatibility (99 entries reference assumptions by ID)
- Discoverability (how contributors find existing assumptions)
- Scalability to 1000+ assumptions

## Options Considered

### Option 1: Keep Single File, Add Domain Field
Keep `globals/assumptions.json` as single file, add optional `domain` field to each assumption.

**Structure:**
```
globals/assumptions.json  (single file, add domain field to schema)
```

**Pros:**
- Minimal changes
- No build step needed
- Backward compatible

**Cons:**
- Doesn't solve file size problem
- Still have merge conflicts
- Still difficult to browse at scale
- Band-aid solution

---

### Option 2: Split by Type (3 folders)
One JSON file per assumption, organized by type (principle/empirical/approximation).

**Structure:**
```
globals/assumptions/
├── principle/
│   ├── conservation_laws_valid.json
│   ├── hilbert_space_probability_structure.json
│   └── ... (13 assumptions)
├── empirical/
│   ├── coulomb_law.json
│   ├── light_speed_constant.json
│   └── ... (7 assumptions)
└── approximation/
    ├── nonrelativistic_regime.json
    ├── point_mass_approximation.json
    └── ... (19 assumptions)
```

**Pros:**
- One file per assumption = zero merge conflicts
- Clean git diffs
- Easy parallel contributions
- Leverages existing type classification already in schema

**Cons:**
- Type organization doesn't match how physicists think
- Finding "all quantum assumptions" requires searching 3 folders
- Type is already encoded in JSON data (redundant with folder structure)
- File proliferation (39 files → 500+ files at scale)
- We already have type field - folder organization doesn't add new information

---

### Option 3: Split by Domain (6 folders)
One JSON file per assumption, organized by physics domain.

**Structure:**
```
globals/assumptions/
├── quantum/
│   ├── hilbert_space_probability_structure.json
│   ├── canonical_commutation_relations.json
│   └── ... (~8 assumptions)
├── classical/
│   ├── conservation_laws_valid.json
│   ├── point_mass_approximation.json
│   └── ... (~5 assumptions)
├── electromagnetism/
│   ├── coulomb_law.json
│   ├── maxwell_framework.json
│   └── ... (~7 assumptions)
├── relativity/
│   ├── nonrelativistic_regime.json
│   ├── light_speed_constant.json
│   └── ... (~5 assumptions)
├── stat_mech/
│   ├── thermal_equilibrium.json
│   └── ... (~3 assumptions)
└── general/
    └── system_isolation.json (~1-2 assumptions)
```

**Pros:**
- One file per assumption = zero merge conflicts
- Domain organization matches how physicists think
- Aligns with arXiv taxonomy used in entries
- Natural discovery ("show me quantum assumptions")
- Each folder stays manageable size (5-15 files)
- Adds new organizational dimension (domain) complementary to existing type field

**Cons:**
- File proliferation (manageable with domain folders)
- Must decide domain assignment for each assumption
- Some assumptions span multiple domains
- Introduces new classification scheme (domain) in addition to existing type

---

### Option 4: Domain Files with Multiple Assumptions
Multiple assumptions per file, organized by domain.

**Structure:**
```
globals/assumptions/
├── quantum_mechanics.json        (~8 assumptions)
├── electromagnetism.json         (~7 assumptions)
├── classical_mechanics.json      (~5 assumptions)
├── relativity.json               (~5 assumptions)
├── thermodynamics.json           (~3 assumptions)
└── general.json                  (~1-2 assumptions)
```

**Pros:**
- Domain organization matches physicist intuition
- Fewer files to manage (6 files)
- Easy to browse by domain
- Balanced file sizes (50-150 lines each)
- Adds new organizational dimension complementary to existing type field

**Cons:**
- Still some merge conflict risk (though lower than single file)
- Editing requires changing existing file
- Git diffs show entire file, not just changed assumption

---

### Option 5: Type-Based Files with Multiple Assumptions
Multiple assumptions per file, organized by type.

**Structure:**
```
globals/assumptions/
├── principles.json      (~13 assumptions)
├── empirical.json       (~7 assumptions)
└── approximations.json  (~19 assumptions)
```

**Pros:**
- Uses existing type categorization
- Few files to manage (3 files)
- Simple organization
- Leverages existing schema classification

**Cons:**
- Type organization doesn't match domain discovery
- approximations.json becomes very large
- Doesn't solve the core browsing problem
- We already have type field - folder organization is redundant

---

## Implementation Considerations

### All Options Require:
1. **Build script** to consolidate into single `globals/assumptions.json` for backward compatibility
2. **Migration script** to split existing assumptions
3. **Update .gitignore** to ignore generated consolidated file
4. **Update build pipeline** (Makefile, CI workflow)
5. **Documentation updates** (CLAUDE.md, CONTRIBUTING.md)

### Backward Compatibility:
All options maintain the consolidated `globals/assumptions.json` as a build artifact. This ensures:
- Zero changes to existing validation scripts
- All 99 entries continue working
- No breaking changes

### Build Script Requirements:
- Load all assumption files from source directory
- Validate no duplicate IDs
- Consolidate into single JSON
- Validate against schema
- Sort predictably

## Comparison Matrix

| Criteria | Option 1 | Option 2 | Option 3 | Option 4 | Option 5 |
|----------|----------|----------|----------|----------|----------|
| Solves file size | ❌ | ✅ | ✅ | ⚠️ | ⚠️ |
| Prevents merge conflicts | ❌ | ✅ | ✅ | ⚠️ | ⚠️ |
| Domain-based discovery | ❌ | ❌ | ✅ | ✅ | ❌ |
| Clean git diffs | ❌ | ✅ | ✅ | ⚠️ | ⚠️ |
| File management | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| Scalability to 1000+ | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| Uses existing classification | ➖ | ✅ | ➖ | ➖ | ✅ |
| Adds new information | ➖ | ❌ | ✅ | ✅ | ❌ |

## Open Questions

1. **Organization principle**: Should assumptions be organized by type (mathematical categorization, already in schema) or domain (physics area, new dimension)?

2. **Granularity**: One file per assumption vs multiple assumptions per file?

3. **Domain assignment**: How to handle assumptions that span multiple domains? (e.g., conservation laws apply everywhere)

4. **Contributor workflow**: What's more intuitive - browsing 6 domain folders or 3 type folders?

5. **Discovery pattern**: How do contributors typically find assumptions? By searching for keywords or browsing by category?

6. **Redundancy**: Is it valuable to have folder structure mirror existing type field, or should folder organization provide new categorization?

## Notes

- Current usage: Most assumptions used by only 1-2 entries
- Entry domains: physics.class-ph (36), quant-ph (14), cond-mat.stat-mech (12)
- Natural clustering exists: Quantum (10), EM (6), Classical (5), Relativity (4)
- Type distribution: approximation (19), principle (13), empirical (7)
- **Type field already exists in schema** - established classification system
