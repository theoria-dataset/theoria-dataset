# Introduction

AI models generating entries, even with clear instructions, are not able to generate entries that fit the needed quality standards. The following is a list of common errors that AI make, that can be used in a prompt to avoid them in the generation of further entries.

# Fields and errors

## derivation and derivation_explanation

- Be very explicit on what you are doing on each step, sometimes you do large jumps.
- Split steps into small parts. Do not try to put too much in one single step.
- Subscripts should use parenthesis if there is more than a letter: e.g. `N_(sphere)` instead of `N_sphere`
- In AsciiMath, `to` renders as an arrow. Hence if you use for example `N_(total)`, the word total will render as `[arrow to right]tal`. Avoid that.
