# BACO: User Experience Enhancement Plan

## 1. Philosophy: From Code Generator to AI Experience Partner

This document outlines a strategic initiative to evolve BACO from a powerful code generator into a true AI partner capable of understanding, designing, and implementing rich, user-centric experiences.

The goal is to move beyond simply generating functional code to creating beautiful, intuitive, and polished applications that are aligned with a clear user persona and a high standard of UX quality. This plan is built on three core pillars:

1.  **Dynamic Personas & User Journeys:** Giving every project a "soul" by defining who the user is.
2.  **The Visionary UX Agent:** Transforming abstract ideas into concrete, interactive, and user-approved UI mockups.
3.  **UI Self-Healing:** Automating UI/UX quality assurance with an autonomous feedback loop.

**Prerequisite:** The critical bug preventing GitHub repository creation and pushing must be resolved before work on this initiative begins.

---

## 2. Pillar 1: Dynamic Personas & User Journeys

**Concept:** To ensure every feature is built with a clear purpose, the Product Manager agent will generate a dynamic `persona.md` file at the start of each project. This file is the single source of truth for the target user's goals, motivations, and frustrations. It will be referenced by all other agents throughout the development lifecycle.

**Benefits:**
*   **Empathy-Driven Development:** Ensures all agents "understand" the end-user.
*   **Reduced Ambiguity:** Provides a clear "why" behind every feature.
*   **Better Products:** Aligns the final product with the needs of a real person.

### Todo List: Pillar 1

-   [ ] **Create Persona Template:** Define a template for `persona.md` that includes sections for demographics, goals, pain points, and a detailed User Journey Map.
-   [ ] **Update Product Manager Agent (`john.md`):** Task the PM agent to work with the user to create the `persona.md` file during the project's PRD phase.
-   [ ] **Enable Agent Referencing:** Update all relevant agents (especially `james.md` the developer) with instructions to reference `persona.md` when implementing features (e.g., "Review `persona.md` to ensure this feature addresses a key user goal.").
-   [ ] **Create `/persona` Command:** Implement a new command `/baco persona` that allows the user to view or request modifications to the current project's persona.

---

## 3. Pillar 2: The Visionary UX Agent

**Concept:** The UX Agent (`sally.md`) will be upgraded to a "Visionary" that can take abstract inspiration and produce multiple, high-fidelity, interactive HTML mockups. The user chooses their preferred design, which is then automatically transformed into framework-specific code.

**Benefits:**
*   **High-Fidelity Previews:** Users see and interact with a polished design before any code is written.
*   **Creative Control:** Empowers the user to guide the visual direction.
*   **Reduces Iteration Time:** Closes the gap between idea, mockup, and implementation.

### Todo List: Pillar 2

-   [ ] **Phase 1: Inspiration:**
    -   [ ] Update UX agent (`sally.md`) to prompt the user for visual inspiration (e.g., "Provide a link to a component library like shadcn/ui, a live website, or a design you admire.").
-   [ ] **Phase 2: Mockup Generation:**
    -   [ ] Instruct Sally to generate 3-5 distinct, fully-styled, and responsive HTML mockups.
    *   [ ] These mockups must use a CDN for a utility-first CSS framework (e.g., TailwindCSS) to ensure they are modern and polished.
-   [ ] **Phase 3: The Code Transformer:**
    -   [ ] Create a new library prompt: `.claude/lib/code-transformer.md`.
    -   [ ] Define the transformer's core logic: to translate a user-selected HTML mockup into framework-specific components (e.g., React/JSX with shadcn/ui components).
    -   [ ] The transformer must be able to map HTML structures and CSS classes to the correct components and their props (e.g., `<div class="card shadow">` becomes `<Card className="shadow">`).
-   [ ] **Phase 4: Animation:**
    -   [ ] Instruct the `code-transformer.md` to add animations to the final components using a specified library (e.g., `framer-motion`).

---

## 4. Pillar 3: UI Self-Healing

**Concept:** Based directly on the user's provided prompt, we will create a new autonomous QA agent named "Pixel." Pixel's job is to visually inspect the UI, grade it against a defined style guide, and create a feedback loop with the developer agent until the UI meets the required quality standard.

**Benefits:**
*   **Automated UI QA:** Drastically reduces the time and effort of manual visual inspection.
*   **Design Consistency:** Enforces a consistent style and UX across the entire application.
*   **Higher Quality:** Catches UI bugs, inconsistencies, and deviations from the design system automatically.

### Todo List: Pillar 3

-   [ ] **Create the "Pixel" Agent:**
    -   [ ] Create the new UI Healer agent prompt at `.claude/agents/ui-healer.md`.
    -   [ ] Codify the three-step process from the user's prompt into the agent's core instructions.
-   [ ] **Define Style Guide Templates:**
    -   [ ] Create templates for `style-guide.md` (defining colors, fonts, spacing, etc.) and `ux-rules.md` (defining layout principles, accessibility standards, etc.).
-   [ ] **Implement the "Screenshot" & Grading Logic:**
    -   [ ] Since direct screenshots are not possible, the prompt will instruct Pixel to analyze the generated UI code (HTML/JSX).
    -   [ ] The agent will be told to "act as if it is looking at a rendered screenshot of this code" and grade it on a 1-10 scale against the rules in `style-guide.md`.
-   [ ] **Build the Feedback Loop:**
    -   [ ] If a score is less than 8/10, instruct Pixel to generate a precise, actionable list of required changes.
    -   [ ] This list will be passed to the Developer agent (`james.md`), who will be tasked with implementing the fixes.
    -   [ ] The process repeats until the score is 8/10 or higher.
-   [ ] **Integrate into QA Workflow:**
    -   [ ] Update the primary QA agent (`elena.md`) to trigger the Pixel agent after any UI-related feature is implemented.

---

## 5. New File Structure

This initiative will introduce the following new files into the BACO system:

```
.
├── docs/
│   └── improve-user-experience.md  (This file)
├── .claude/
│   ├── agents/
│   │   └── ui-healer.md              (New: The "Pixel" agent)
│   └── lib/
│       └── code-transformer.md       (New: For HTML to framework conversion)
└── [PROJECT_DIRECTORY]/
    ├── persona.md                  (New: Project-specific user persona)
    ├── style-guide.md              (New: Project-specific design rules)
    └── ux-rules.md                 (New: Project-specific UX principles)
```
