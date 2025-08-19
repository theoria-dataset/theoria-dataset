Physics Entry Quality Improvement Prompt

You are tasked with improving an AI-generated physics entry to meet rigorous academic standards. Follow these systematic guidelines based on the THEORIA dataset
schema and common AI generation errors.

CRITICAL REQUIREMENTS

1. DERIVATION COMPLETENESS

- Expand shallow derivations
- Show ALL intermediate steps: Never skip algebraic manipulations or substitutions
- Start from first principles: Begin with fundamental equations (Maxwell's equations, statistical mechanics, etc.)
- Use proper step numbering: Sequential integers starting from 1

Example Fix:

- ❌ AI: "Count electromagnetic modes"
- ✅ Improved: "Standing wave boundary conditions in a cubic cavity with side length L: electromagnetic field components must vanish at walls, requiring E_x prop  
  sin(n_x*pi*x/L), E_y prop sin(n_y*pi*y/L), E_z prop sin(n_z*pi*z/L) where n_x, n_y, n_z = 1,2,3,..."

2. ASSUMPTIONS PRECISION & LOGICAL INDEPENDENCE

- Replace generic statements with physics-specific conditions
- Reference fundamental principles (Maxwell equations, thermodynamics, quantum mechanics)
- Include mathematical constraints (boundary conditions, statistical distributions)
- Use backticks for math: All mathematical expressions in backticks with AsciiMath format
- **CRITICAL: Ensure assumptions are truly independent** - no assumption should be derivable from others

Logical Independence Check:

- ❌ Don't include consequences as assumptions: "Angular momentum is conserved due to central force" when central force is already assumed
- ❌ Don't include derived properties: "The gravitational potential gives rise to elliptical orbits" when this follows from Newton's law
- ❌ Don't mix preconditions with consequences: Put foundational frameworks first, derived properties should be in derivation
- ✅ Each assumption should be a genuinely independent starting point

Example Fix:

- ❌ AI: "The system is in thermal equilibrium"
- ✅ Improved: "The radiation field is in thermal equilibrium at temperature T, meaning the emission and absorption rates are balanced and the energy
  distribution is time-independent"


3. PROGRAMMATIC VERIFICATION DEPTH

- Verify EACH derivation step: Include assert statements for every mathematical transformation
- Use detailed comments: Reference step numbers explicitly
- Test intermediate results: Don't just verify the final equation
- Include symbolic manipulation: Show algebraic steps programmatically

4. ASCIIMATH NOTATION FIXES

**Critical Fraction and Derivative Notation:**

- **Fractions**: Use parentheses around numerator and denominator when needed: `(dr)/(dt)` NOT `dr/dt`, unless there is only one letter or number on each side, e.g. `1/3` is ok
- **Derivatives**: `(d^2 u)/(d theta^2)` NOT `d^2u/dtheta^2`
- **Partial derivatives**: Always explicit with parentheses: `(del u)/(del t)` NOT `∂u/∂t`
  **Other Common Notation Errors:**
- Subscripts with multiple characters: Use parentheses: `N_(sphere)` not `N_sphere`
- Avoid "to" in subscripts: `N_(all)` not `N_total` (renders as arrow)
- Proper function notation: `u(nu,T)` not `u_nu_T`
- Exponential formatting: `e^((h*nu)/(k_B*T))` for clarity
- Text in equations: Use `text{constant}` NOT `text(constant)`

5. MISSING METADATA

- Add dependencies: List other entries this derivation relies on
- Include validity_regime: Specify physical conditions and limitations
- Update contributors: Replace "Synthetic entry" with proper attribution
- Set review_status: Keep as "draft" until human review

6. DERIVATION METHOD SELECTION

SYSTEMATIC IMPROVEMENT PROCESS

1. Analyze the physics depth: Is this a fundamental derivation requiring 15+ steps?
2. **Choose appropriate derivation method**: Avoid approaches that lead to algebraic complexity, try always something simple
3. Identify missing steps: Look for logical gaps between equations
4. Ensure consistent notation across the derivation
5. Expand each assumption: Make physics principles explicit
6. Enhance explanations: Each step should be clear to a graduate physics student
7. Comprehensive verification: Write code that validates every mathematical step
8. Check all symbols: Ensure proper AsciiMath formatting throughout

QUALITY CHECKLIST

- Derivation has detailed step-by-step progression from first principles
- Each assumption references specific physics principles
- **Assumptions are logically independent** - none can be derived from others
- All mathematical notation uses proper AsciiMath format
- Programmatic verification tests each derivation step
- Dependencies field lists prerequisite entries
- Validity regime specifies physical conditions and limitations
- No generic placeholders remain in any field

Apply these improvements systematically to transform the AI-generated entry into a rigorous, publication-quality physics derivation that meets the THEORIA
dataset standards.
