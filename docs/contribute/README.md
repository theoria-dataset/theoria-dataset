# TheorIA Dataset Contribution System

This directory contains the web-based contribution system that makes it easy for scientists and researchers to contribute to the TheorIA dataset without requiring technical expertise.

## System Overview

The contribution system provides multiple pathways for non-technical users:

### 1. Web Form Interface (`form.html`)
- **Target Users:** Scientists, researchers, educators
- **Features:**
  - Step-by-step guided form
  - Real-time AsciiMath preview
  - Client-side validation
  - Export to JSON or GitHub issue
- **No Requirements:** No GitHub account, Git, or technical setup needed

### 2. GitHub Issue Templates (`.github/ISSUE_TEMPLATE/`)
- **Target Users:** GitHub users comfortable with issue forms
- **Features:**
  - Structured submission forms
  - Automatic labeling and routing
  - Integration with automation workflows
- **Templates:**
  - `new-entry.yml` - Submit new physics entries
  - `modify-entry.yml` - Suggest modifications to existing entries
  - `peer-review.yml` - Provide expert review of entries

### 3. GitHub Actions Automation (`.github/workflows/`)
- **Purpose:** Automated processing of contributions
- **Features:**
  - Convert GitHub issues to JSON entries
  - Create pull requests automatically
  - Validate submissions against schema
  - Provide feedback to contributors

## Technical Architecture

```
User Input → Processing → Repository Integration
     ↓           ↓              ↓
Web Form → JavaScript → JSON Export
GitHub Issue → Actions → Pull Request
Direct PR → Validation → Review
```

### Components

1. **Frontend (`docs/contribute/`)**
   - `index.html` - Landing page with contribution options
   - `form.html` - Interactive entry creation form
   - `form.js` - Form logic, validation, and export
   - `form.css` - Styling for contribution interface

2. **Backend (`scripts/`)**
   - `parse_github_issue.py` - Parse issue content to JSON
   - `validate_schema.py` - Validate entries against schema

3. **Automation (`.github/`)**
   - `workflows/process-contribution.yml` - Main automation workflow
   - `ISSUE_TEMPLATE/*.yml` - Structured issue forms

## User Workflows

### For Scientists (Recommended)
1. Visit `/docs/contribute/`
2. Click "Start Contributing"
3. Fill out guided form with real-time preview
4. Export as JSON or create GitHub issue
5. Automatic processing and feedback

### For GitHub Users  
1. Visit GitHub repository
2. Click "Issues" → "New Issue"
3. Choose "New Physics Entry" template
4. Fill structured form
5. Submit - automatic processing creates PR

### For Developers
1. Fork repository
2. Create JSON entry manually
3. Submit pull request
4. CI validation and review

## Features for Non-Technical Users

### Web Form Benefits
- **Progressive Disclosure:** Complex schema broken into manageable steps
- **Visual Feedback:** Live math rendering shows equations as typed
- **Smart Defaults:** Auto-generation of IDs and reasonable defaults
- **Multiple Export Options:** JSON download, GitHub issue, or clipboard copy
- **Mobile Friendly:** Responsive design works on phones/tablets

### Validation & Quality Control
- **Real-time Validation:** Immediate feedback on required fields
- **Schema Compliance:** Ensures all entries meet dataset standards
- **Math Preview:** Reduces AsciiMath formatting errors
- **Reference Formatting:** Guidance for proper citations

## Implementation Benefits

### Zero Infrastructure Cost
- Hosted on GitHub Pages (free)
- No external dependencies or services
- Scales automatically with GitHub

### Maintainer Friendly
- Automated PR creation reduces manual work
- Structured data makes review easier
- Automatic validation catches common errors
- Clear attribution and tracking

### Community Building
- Lower barrier to entry increases contributions
- Multiple pathways accommodate different skill levels
- Peer review system enables quality control
- GitHub integration maintains transparency

## Future Enhancements

### Phase 2 Features
- Entry editing interface for modifications
- Advanced derivation builder with symbolic math
- Collaborative review system
- Integration with reference managers (Zotero, Mendeley)

### Phase 3 Features
- LaTeX import/export
- Jupyter notebook integration
- API for programmatic submissions
- Advanced search and filtering

## Setup Instructions

### For Repository Maintainers

1. **Enable GitHub Pages:**
   ```
   Settings → Pages → Source: Deploy from branch → main → /docs
   ```

2. **Configure GitHub Actions:**
   - Ensure Actions are enabled in repository settings
   - Review and customize workflow permissions as needed

3. **Test the System:**
   ```bash
   # Test issue parsing
   python scripts/parse_github_issue.py "test issue body"
   
   # Test schema validation
   python scripts/validate_schema.py entries/example.json
   ```

### For Contributors

No setup required! Just visit the contribution page and start submitting entries.

## Monitoring and Analytics

Track contribution system effectiveness through:
- GitHub Issues with `contribution` label
- Pull requests created via automation
- Web form usage (via GitHub Pages analytics)
- Community feedback and engagement

## Support and Troubleshooting

### Common Issues
1. **Math Preview Not Working:** Check MathJax loading
2. **Form Validation Errors:** Review required field completion
3. **GitHub Issue Creation Fails:** Check repository permissions
4. **JSON Export Problems:** Verify browser supports download API

### Getting Help
- Check [Contributing Guidelines](../../CONTRIBUTING.md)
- Browse [existing entries](../entries.html) for examples
- Open an issue for technical problems
- Join discussions for community support

This system transforms TheorIA from a developer-only dataset into a truly collaborative scientific resource accessible to the entire physics community.