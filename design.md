Design Skills Framework (design.md)

This document defines a unified design workflow for frontend creation, implementation, theming, brand enforcement, and static canvas composition. It is written to be used as a clear operating guide for design-related tasks and as a reference for downstream skill files.

---

1. Purpose

The Design Skills Framework exists to turn user intent into high-quality visual output with the correct level of fidelity:

Creative frontend UI when the user needs a polished web interface.
Faithful implementation when the user gives a design spec, wireframe, or token set.
Theme generation when the user needs a complete visual foundation.
Brand compliance when strict brand rules must be followed.
Static visual composition when the task is poster-like, artistic, or presentation-driven rather than interactive.

The goal is not simply to generate code. The goal is to produce design work that is intentional, structured, and context-aware.

---

2. Core Principles

These principles apply to every design task unless a specific skill explicitly overrides them.

2.1 Intentionality
Every design must have a clear purpose, audience, and visual direction. Avoid generic layouts and bland styling.

2.2 Hierarchy
Size, spacing, contrast, typography, and composition must all reinforce what matters most.

2.3 Consistency
Use a coherent system for typography, spacing, color, radii, shadows, and motion.

2.4 Responsiveness
Designs must adapt across screen sizes without breaking layout, hierarchy, or usability.

2.5 Accessibility
Respect readability, contrast, focus states, semantic structure, and basic interaction accessibility.

2.6 Specificity
Do not invent unnecessary filler. Use meaningful sample content when placeholders are needed.

2.7 Anti-Generic Rule
Avoid overused UI tropes, default font stacks, dull spacing patterns, and predictable visual formulas.

---

3. Skill Overview

Skill	Primary Use	Output Type	Design Mode
frontend-design	Build web pages, components, dashboards, landing pages, apps	Runnable frontend code	Creative and polished
implement-design	Convert a design spec into a code blueprint	Structured implementation blueprint	Faithful and exact
theme-factory	Generate design tokens and visual themes	CSS variables or JSON theme object	Systematic and accessible
brand-guidelines	Enforce strict brand rules	Brand-compliant UI code	Restrictive and exact
canvas-design	Create static art/layout compositions	Self-contained HTML/CSS composition	Visual and expressive

---

4. Skill Activation Rules

Use the skill that matches the task below.

4.1 frontend-design
Use when the user asks for:
- a website
- a landing page
- a dashboard
- a React/Vue/HTML component
- a frontend app
- a redesign of an interface
- a styled user interface with code output

This skill should produce code that is functional, visually strong, and intentionally styled.

4.2 implement-design
Use when the user provides:
- measurements
- spacing rules
- typography scale
- color tokens
- a wireframe
- a Figma-style spec
- layout instructions to be translated into code structure

This skill should preserve the design as given and avoid creative reinterpretation.

4.3 theme-factory
Use when the user wants:
- a theme
- a token system
- a color palette
- typography scales
- spacing systems
- a design foundation for multiple screens or components

This skill should output a reusable theme system that can be applied across projects.

4.4 brand-guidelines
Use when the user provides:
- a brand book
- exact brand colors
- exact fonts
- logo placement rules
- tone-of-voice rules
- strict corporate or identity constraints

This skill must follow brand rules exactly and avoid creative deviation.

4.5 canvas-design
Use when the user asks for:
- a poster
- a static visual concept
- a mood board
- an abstract composition
- a social-format visual layout
- a non-interactive graphic piece

This skill should favor composition, atmosphere, and visual impact over UI behavior.

---

5. Shared Output Standards

All design outputs should follow these standards unless the task clearly demands otherwise.

5.1 Code Quality
- Provide complete, runnable output.
- Use semantic structure.
- Keep code organized and readable.
- Avoid broken abstractions or incomplete placeholders.

5.2 Visual Quality
- Use a deliberate palette.
- Use spacing with intention.
- Ensure the hierarchy reads clearly.
- Avoid visual clutter unless density is part of the concept.

5.3 Typography
- Choose fonts that match the tone of the design.
- Avoid default, uninspired typography unless the brief explicitly requires neutrality.
- Use size, weight, and line height to control emphasis.

5.4 Motion
- Use motion only when it improves the design.
- Favor purposeful animation over decorative noise.
- Keep transitions smooth and consistent.

5.5 Responsiveness
- Design for multiple viewport sizes.
- Prevent overflow, collapsed spacing, and broken alignment.
- Preserve hierarchy at smaller widths.

5.6 Accessibility
- Maintain readable contrast.
- Include focus states where interactions exist.
- Use semantic HTML where possible.
- Ensure interface text is legible and meaningful.

---

6. Detailed Skill Definitions

6.1 frontend-design
Purpose: Create distinctive, production-grade frontend interfaces from user requirements.
Design Thinking Requirements:
Before writing any code, define:
- Purpose and audience: What problem is the interface solving? Who is it for?
- Tone and direction: Minimal, maximalist, editorial, retro-futuristic, industrial, playful, luxury, brutalist, organic, and so on.
- Constraints: Framework, responsiveness, accessibility, performance.
- Differentiator: The one visual or interaction detail that makes the interface memorable.

Code Generation Rules:
- Produce working code, not mockups.
- Commit to a strong visual direction.
- Avoid generic AI-style aesthetics.
- Use distinctive typography.
- Use CSS variables or theme tokens for consistency.
- Add purposeful motion and micro-interactions where appropriate.
- Use asymmetry, overlap, layered backgrounds, or strong negative space when the design benefits from it.
- Add atmosphere using gradients, textures, shadows, geometric structure, or other visual details.

Output Format:
Return:
1. The complete runnable code.
2. A short explanation of the design choices and why they fit the brief.

Constraints:
- Do not use lorem ipsum unless explicitly requested.
- Always ensure responsiveness.
- Always include basic accessibility support.

6.2 implement-design
Purpose: Convert visual design specifications into clean, semantic, implementation-ready blueprints.

Execution Rules:
1. Parse the design exactly as given.
2. Preserve spacing, proportions, and hierarchy.
3. Build a structured blueprint using the original design intent.
4. Flag missing data as [MISSING] instead of guessing.
5. Avoid creative embellishment.

6.3 theme-factory
Purpose: Generate cohesive, accessible visual themes and reusable token systems.

6.4 brand-guidelines
Purpose: Apply strict brand rules to generated interfaces and copy.

6.5 canvas-design
Purpose: Create static visual compositions that prioritize layout, emotion, and form over interactivity.

---

7. Decision Guide
If the request is to build a functional interface, use frontend-design.
If the request is to translate a design into a blueprint, use implement-design.
If the request is to generate a theme or token system, use theme-factory.
If the request is to follow strict brand rules, use brand-guidelines.
If the request is to create a static visual composition, use canvas-design.

---

8. Quality Checklist
- The purpose is clear.
- The visual direction is intentional.
- The typography supports the message.
- The spacing is structured.
- The palette is coherent.
- The hierarchy is obvious.
- The output is responsive.
- Accessibility has been considered.
- The result does not look generic.
- The result matches the task type.

---

9. Maintenance Notes
This file should be treated as the canonical design framework. Individual skill files may expand on these rules, but they should not contradict them.

---

10. Recommended File Structure
my-design-skills/
├── design.md
├── frontend-design/
│   └── SKILL.md
├── implement-design/
│   └── SKILL.md
├── theme-factory/
│   └── SKILL.md
├── brand-guidelines/
│   └── SKILL.md
└── canvas-design/
    └── SKILL.md

---

11. Final Rule
Design output must be useful, coherent, and visually strong. Every artifact should look like it was made with a point of view, not assembled from defaults.
