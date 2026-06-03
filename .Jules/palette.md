## 2024-05-31 - Icon-Only Button Accessibility Pattern
**Learning:** Found a recurring pattern in the app's components (like `WorkspaceView.tsx` and `HabitSection.tsx`) where icon-only buttons (like the Lucide `<X />`, `<Edit2 />`, and `<Trash2 />` components) lacked `aria-label` attributes.
**Action:** Ensure all future icon-only buttons include descriptive `aria-label` attributes so screen readers can properly announce their function.
