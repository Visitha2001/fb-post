---
description: Core UI and design principles for the AI Influencer App
---

# UI & Design Principles

Always adhere to these guidelines when building or updating any user interface components in this project.

1. **Typography**:
   - Use **Outfit** for headings and primary emphasis.
   - Use **Inter** for body text and standard UI elements.
   - Ensure readable contrast and use modern tracking (letter spacing).

2. **Aesthetics & Modernity**:
   - Avoid generic, flat colors. Use curated, harmonious color palettes (e.g., slate/indigo/blue).
   - Use smooth, subtle gradients for backgrounds and prominent buttons.
   - Employ "Glassmorphism" where appropriate (translucency + blur) to create depth.
   - Maintain a premium, high-quality feel. It must not look like a basic Minimum Viable Product.

3. **Shapes & Rounding**:
   - AI generated faces and avatars should be heavily rounded (e.g., `rounded-2xl`, `rounded-3xl`, or `rounded-full`).
   - Cards and containers should use modern corner radiuses (e.g., `rounded-xl`).

4. **Interaction & Animations**:
   - Elements must feel responsive.
   - Add hover effects (`hover:scale-[1.02]`, `hover:shadow-lg`) and transition utilities (`transition-all duration-300`).
   - Use micro-animations (spinners, fade-ins, slide-ups) for loading states and new content rendering.

5. **Component System**:
   - Continue utilizing **Shadcn UI**, but don't hesitate to customize the base styles (e.g., making buttons larger, rounding corners more) to fit the modern aesthetic.
