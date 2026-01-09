---
description: Steps to apply the "Playful Premium" UI redesign to the Retirement Planner
---

# UI Redesign Workflow

1.  **Global Background**:
    -   Update the main container in `app/page.tsx` to use `bg-[#F8FAFC]`.
    -   Add mesh gradient blobs (Blue, Green, Purple) with `mix-blend-multiply` and `animate-pulse`.
    -   Add a subtle grid pattern overlay.

2.  **Left Panel (Input Section)**:
    -   Update the `<aside>` className to `bg-white/60 backdrop-blur-xl border-white/40`.
    -   Ensure it has a shadow: `shadow-[20px_0_40px_-10px_rgba(0,0,0,0.05)]`.

3.  **Right Panel (Results Section)**:
    -   Update the `<main>` className to `bg-slate-50/40 backdrop-blur-sm`.
    -   Ensure it allows the global background to show through.

4.  **Header & Navigation**:
    -   Update `<header>` and the Family Control Bar to `bg-white/60 backdrop-blur-xl`.
    -   Maintain sticky positioning.

5.  **Input Cards Styling**:
    -   Apply the following class to all main input containers (Identity, Timeline, Wealth, Strategy, Insurance, Legacy):
        `bg-white rounded-[24px] p-5 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group`
    -   Ensure internal elements (inputs, buttons) use consistent rounded styling (`rounded-xl` or `rounded-2xl`).

6.  **Verify**:
    -   Check that text remains readable against the semi-transparent backgrounds.
    -   Ensure the "system" feel is cohesive across both panels.
