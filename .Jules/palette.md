## 2024-05-21 - Icon-Only Button Accessibility Pattern
**Learning:** Found that multiple icon-only action buttons across components (like HabitSection) lack aria-labels, making them completely opaque to screen readers despite having title attributes (which are insufficient for accessibility).
**Action:** Always add descriptive `aria-label`s to any button that uses icons without accompanying visible text, especially for repeated lists of action icons (like Edit/Delete).
