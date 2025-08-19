// Auto-generated from /app/schemas/entry.schema.json
// Do not edit manually - regenerate using scripts/generate_form_requirements.py

const FIELD_REQUIREMENTS = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://theoria-dataset.org/schemas/entry.schema.json",
  "title": "THEORIA dataset entry",
  "description": "Schema for a single theoretical\u2011physics entry in THEORIA.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "result_id",
    "result_name",
    "result_equations",
    "explanation",
    "definitions",
    "assumptions",
    "derivation",
    "programmatic_verification",
    "domain",
    "theory_status",
    "references",
    "contributors",
    "review_status"
  ],
  "properties": {
    "result_id": {
      "type": "string",
      "pattern": "^[a-z0-9_]+$",
      "description": "Unique identifier that must exactly match the filename (without .json extension). Use lowercase letters, numbers, and underscores only. Choose descriptive names that clearly identify the physics concept.",
      "example": "lagrangian_mechanics"
    },
    "result_name": {
      "type": "string",
      "maxLength": 100,
      "description": "Brief title to identify the entry. Keep concise (max 100 characters) and descriptive. Should clearly identify the physics concept."
    },
    "result_equations": {
      "type": "array",
      "minItems": 1,
      "description": "List of equations in AsciiMath format. Provide each equation with a unique ID (e.g., 'eq1', 'eq2'). Use AsciiMath format for all equations.",
      "example": [
        {
          "id": "eq1",
          "equation": "t' = gamma*(t - (v/c^2)*x)"
        }
      ],
      "items": {
        "type": "object",
        "required": [
          "id",
          "equation"
        ],
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique short tag for the equation"
          },
          "equation": {
            "type": "string",
            "description": "AsciiMath representation of the equation"
          }
        }
      }
    },
    "explanation": {
      "type": "string",
      "maxLength": 800,
      "description": "Provide a brief (2\u20135 sentences, max 100 words) conceptual summary of the theoretical result or equation. Assume the reader has a graduate-level understanding of physics. Use clear and concise language to explain the significance, usage, and context of the theoretical result. Content should include: Definition or main concept, Why it matters in physics, How it's used or where it appears. Avoid derivation steps (covered in the derivation section), dense notation or inline math, empty generalities (e.g., \"This is important in physics\"), or overly technical jargon. If, exceptionally, there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format.",
      "example": "Lorentz transformations describe how space and time coordinates change between inertial frames moving relative to each other, ensuring the invariance of the speed of light and the spacetime interval. They are foundational to special relativity and crucial for understanding time dilation and length contraction."
    },
    "definitions": {
      "type": "array",
      "minItems": 1,
      "description": "Define every symbol used in the result_equations to ensure the entry is self-contained by defining all symbols. Each definition should include a symbol field, with the symbol represented in AsciiMath format and a definition field. If there are math symbols or equations included in the definition, they must be enclosed in backticks (``) and written in AsciiMath format.",
      "example": [
        {
          "symbol": "c",
          "definition": "Speed of light in vacuum."
        }
      ],
      "items": {
        "type": "object",
        "required": [
          "symbol",
          "definition"
        ],
        "additionalProperties": false,
        "properties": {
          "symbol": {
            "type": "string"
          },
          "definition": {
            "type": "string"
          }
        }
      }
    },
    "derivation": {
      "type": "array",
      "minItems": 1,
      "description": "Provide a formal derivation of the result, including all steps, equations in AsciiMath format, and descriptions. Derivation should start from either first principles (listed in the field 'assumptions') or from other results derived in another entry, which should be specified in the 'dependencies' field. Each step should contain the `step` (an integer, in sequential order), `description` (textual rationale), and `equation` (AsciiMath format) fields. Include all steps for complete derivation. Use very explicit detail level for easy following.",
      "example": [
        {
          "step": 1,
          "description": "Apply general linear transformation between reference frames.",
          "equation": "x' = A*x + B*t; t' = D*x + E*t"
        },
        {
          "step": 2,
          "description": "For an object at rest in the moving frame, x'=0 always.",
          "equation": "0 = A*v*t + B*t"
        }
      ],
      "items": {
        "type": "object",
        "required": [
          "step",
          "description",
          "equation"
        ],
        "additionalProperties": false,
        "properties": {
          "step": {
            "type": "integer",
            "minimum": 1
          },
          "description": {
            "type": "string",
            "description": "Textual description for this derivation step. Define new symbols that appear. Provide concise and clear rationale. If there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format."
          },
          "equation": {
            "type": "string"
          }
        }
      }
    },
    "assumptions": {
      "type": "array",
      "description": "Assumptions that lead to the result equations, which usually are either first principles, results from another entry specified in 'dependencies' or empirical results. List all assumptions required for the derivation. Use sequential IDs like 'assumption1', 'assumption2'. If there are math symbols or equations included, they must be enclosed in backticks (``) and written in AsciiMath format.",
      "items": {
        "type": "object",
        "required": [
          "id",
          "text"
        ],
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string"
          },
          "text": {
            "type": "string"
          }
        }
      }
    },
    "programmatic_verification": {
      "type": "object",
      "description": "Code that verifies the derivation correctness. Use minimal dependencies (pure Python or sympy). Should follow the steps of the derivation, explicitly in the comments. Include assert statements to verify correctness.",
      "required": [
        "language",
        "library",
        "code"
      ],
      "additionalProperties": false,
      "properties": {
        "language": {
          "type": "string",
          "pattern": "^[A-Za-z]+\\s\\d+\\.\\d+\\.\\d+$",
          "description": "e.g. 'python 3.11.12'"
        },
        "library": {
          "type": "string",
          "pattern": "^[A-Za-z0-9_]+\\s\\d+\\.\\d+\\.\\d+$",
          "description": "e.g. 'sympy 1.13.0'"
        },
        "code": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "string"
          }
        }
      }
    },
    "domain": {
      "type": "string",
      "description": "ArXiv category identifier (e.g., 'gr-qc', 'hep-th') from https://arxiv.org/category_taxonomy. Use official arXiv taxonomy identifiers.",
      "pattern": "^[a-z][a-z\\-\\.]+$"
    },
    "theory_status": {
      "type": "string",
      "enum": [
        "current",
        "historical",
        "approximation",
        "limiting_case",
        "superseded"
      ],
      "description": "Current scientific status of the theory. current: Modern theories widely accepted by scientific community. historical: Important for development but superseded by better theories. approximation: Valid simplifications of more general theories. limiting_case: Special cases with restricted applicability. superseded: Completely replaced by more accurate theories."
    },
    "validity_regime": {
      "type": "object",
      "description": "Physical conditions where theory applies and limitations. Use for theories with specific applicability ranges. Include both conditions where valid and limitations.",
      "additionalProperties": false,
      "properties": {
        "conditions": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "limitations": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "superseded_by": {
      "type": "array",
      "description": "Theories that supersede or generalize this result. Use exact result_id values (without .json extension). Must reference existing entries in the dataset.",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9_]+$"
      }
    },
    "approximation_of": {
      "type": "string",
      "pattern": "^[a-z0-9_]+$",
      "description": "The more general theory this approximates. Use exact result_id value (without .json extension)."
    },
    "historical_context": {
      "type": "object",
      "description": "Educational context about theory's development. Provide importance, development period, and key insights.",
      "additionalProperties": false,
      "properties": {
        "importance": {
          "type": "string"
        },
        "development_period": {
          "type": "string"
        },
        "key_insights": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "references": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "description": "Academic citations (1-3 references in APA style). Use APA format: Author(s). (Year). Title. Publisher/Journal, volume(issue), pages. DOI/URL.",
      "example": [
        {
          "id": "R1",
          "citation": "Einstein, A. (1905). 'On the Electrodynamics of Moving Bodies.' *Annalen der Physik*, 17, 891\u2013921."
        }
      ],
      "items": {
        "type": "object",
        "required": [
          "id",
          "citation"
        ],
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string"
          },
          "citation": {
            "type": "string"
          }
        }
      }
    },
    "dependencies": {
      "type": "array",
      "description": "Other entries this result relies on. Use exact result_id values (without .json extension). Only include direct dependencies.",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9_]+$"
      }
    },
    "contributors": {
      "type": "array",
      "minItems": 1,
      "description": "List of contributors who created or modified this entry. Each contributor must have a full name and an identifier (ORCID, website, LinkedIn, etc.).",
      "items": {
        "type": "object",
        "required": [
          "full_name",
          "identifier"
        ],
        "additionalProperties": false,
        "properties": {
          "full_name": {
            "type": "string",
            "description": "Full name of the contributor"
          },
          "identifier": {
            "type": "string",
            "description": "Unique identifier for the contributor (ORCID, personal website, academic profile, LinkedIn, etc.)"
          }
        }
      }
    },
    "review_status": {
      "type": "string",
      "enum": [
        "draft",
        "reviewed"
      ],
      "description": "Review status of the entry. Use 'draft' for initial submissions. Use 'reviewed' for entries approved for main dataset."
    }
  }
};

// Helper functions for accessing requirement data
function getFieldGuidelines(fieldName) {
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.guidelines || [] : [];
}

function getFieldDescription(fieldName) {
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.description || '' : '';
}

function getFieldExample(fieldName) {
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.example || null : null;
}

function getFieldConstraints(fieldName) {
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    if (!field) return {};
    
    const constraints = {};
    if (field.type) constraints.type = field.type;
    if (field.required !== undefined) constraints.required = field.required;
    if (field.maxLength) constraints.maxLength = field.maxLength;
    if (field.minItems) constraints.minItems = field.minItems;
    if (field.pattern) constraints.pattern = field.pattern;
    if (field.enum) constraints.enum = field.enum;
    if (field.wordLimit) constraints.wordLimit = field.wordLimit;
    if (field.sentenceRange) constraints.sentenceRange = field.sentenceRange;
    
    return constraints;
}

function isFieldRequired(fieldName) {
    const field = FIELD_REQUIREMENTS.fields[fieldName];
    return field ? field.required === true : false;
}

function formatGuidelines(guidelines) {
    if (!guidelines || guidelines.length === 0) return '';
    return guidelines.map(g => `• ${g}`).join('\n');
}

function formatExample(example) {
    if (!example) return '';
    
    if (typeof example === 'object') {
        if (example.value !== undefined) {
            if (typeof example.value === 'string') {
                return example.value;
            } else {
                return JSON.stringify(example.value, null, 2);
            }
        } else {
            return JSON.stringify(example, null, 2);
        }
    }
    
    return String(example);
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FIELD_REQUIREMENTS,
        getFieldGuidelines,
        getFieldDescription,
        getFieldExample,
        getFieldConstraints,
        isFieldRequired,
        formatGuidelines,
        formatExample
    };
}
