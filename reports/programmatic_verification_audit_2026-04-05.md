# Programmatic Verification Audit (2026-04-05)

Scope: `entries/*.json` (27 entries). Focus is **semantic quality** of `programmatic_verification.code` versus derivation steps (not just runtime success).

Verdict scale:
- **Strong**: clear derivation alignment + meaningful symbolic/structural checks.
- **Adequate**: mostly correct but with some traceability gaps or limited depth.
- **Weak**: major coverage gaps, low assertion rigor, or checks that do not actually validate the derivation's core claims.

## Entry-by-entry review

1. `angular_momentum` — **Strong**  
   Good step mapping and physically meaningful vector identity checks (product rule, torque decomposition, conservation condition).

2. `blackbody_radiation` — **Adequate**  
   Many good symbolic/numeric checks (Planck law limits, Stefan-Boltzmann, Wien peak), but weak explicit mapping to derivation step numbers in comments.

3. `born_rule` — **Strong**  
   High assertion density and good coverage of probability, polarization identity, trace form, and pure-state amplitude-squared rule.

4. `canonical_transformations` — **Strong**  
   Verifies symplectic matrix structure, Poisson bracket invariance, and transformed canonical brackets with explicit indexed checks.

5. `dirac_equation` — **Weak**  
   Verification is mostly Clifford algebra consistency in one representation. It does **not** robustly validate the derivation chain from relativistic energy-momentum relation to the Dirac equation operator form.

6. `dirac_field_quantization` — **Adequate**  
   Includes rest-frame spinor and anticommutation checks, but broad derivation coverage is partial and several logical steps are implicit.

7. `euler_lagrange_equations` — **Strong**  
   Good mapping and concrete checks on representative Lagrangians; verifies expected EL outcomes directly.

8. `fock_space` — **Adequate**  
   Correct commutator and orthonormality checks, but coverage is concentrated on selected algebraic properties rather than full derivation flow.

9. `gravitational_field` — **Strong**  
   Coherent derivation alignment from force law to potential and gradient relation, with additional consistency checks.

10. `hamilton_jacobi_equation` — **Adequate**  
    Core identities are checked, but many derivation steps are presented as prints/exposition rather than strict asserts.

11. `hamiltons_equations` — **Strong**  
    Step-by-step symbolic coefficient matching and substitutions align well with the derivation.

12. `keplers_laws` — **Strong**  
    Broad and explicit multi-stage coverage (torque, areal law, Binet equation, conic geometry, period law) with concrete assertions.

13. `klein_gordon_equation` — **Adequate**  
    Correct equation-form equivalence and dispersion checks; early conceptual steps are less directly audited.

14. `klein_gordon_lagrangian` — **Strong**  
    Good EL variation checks, conjugate momentum, and Hamiltonian density consistency.

15. `ladder_operators` — **Strong**  
    Clear coverage of commutators, Hamiltonian rewriting, ladder action, and spectrum spacing.

16. `lorentz_group_and_four_vectors` — **Strong**  
    Correct matrix-level invariance checks for interval and scalar products, inverse relation, and group composition.

17. `maxwell_equations` — **Adequate**  
    Validates several local/integral correspondences and wave-speed relation pieces, but some derivation segments are lightly verified.

18. `noethers_theorem` — **Weak**  
    Lacks assert-based verification of core claims (`dJ/dt = 0` etc.). Mostly narrative/comments with symbolic setup, so semantic verification is insufficient.

19. `partition_function` — **Strong**  
    Very good finite-state derivation audit from normalization to `U = -d ln Z / dβ` with explicit symbolic equalities.

20. `relativistic_energy_momentum` — **Adequate**  
    Core invariant relation is checked and some consistency tests exist; however many derivation steps are not explicitly validated.

21. `scalar_field_quantization` — **Adequate**  
    Correct checks for dispersion, ladder algebra, and normal-ordering consequences, but substantial portions of long derivation are compressed.

22. `schrodinger_equation` — **Strong**  
    Tight and coherent verification of dispersion, operator substitutions, and TDSE forms.

23. `special_relativity_transformations` — **Adequate**  
    Main Lorentz-transform identities are checked, though full derivation traceability is partial.

24. `speed_of_light` — **Strong**  
    Clear symbolic chain from Maxwell equations through vector identities to wave speed expression.

25. `spin_statistics_theorem` — **Adequate**  
    Good algebra for BE/FD distributions and parity factor checks, with explicit note that analytic continuation aspects are outside SymPy scope.

26. `uncertainty_principle` — **Strong**  
    Comprehensive operator-level checks including Robertson bound structure and canonical-pair specialization.

27. `vis_viva` — **Weak**  
    Only a narrow final-equation check is asserted; derivation progression is under-validated.

## Priority fixes (recommended)

1. `dirac_equation`: add assertions tying linearized operator equation back to squared relativistic invariant and spinor plane-wave constraints.
2. `noethers_theorem`: add explicit symbolic assertions for total derivative structure and on-shell conservation (`dJ/dt = 0`).
3. `vis_viva`: add intermediate asserts for energy conservation substitutions and algebraic elimination steps.
4. Improve step-to-step mapping comments in entries currently marked Adequate (especially `blackbody_radiation`, `scalar_field_quantization`, `relativistic_energy_momentum`).
