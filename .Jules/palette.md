## 2023-10-27 - Custom Button Group Accessibility
**Learning:** When creating custom mutually exclusive button groups (like productivity style selectors) rather than native radio buttons, it is essential to use `role="group"` on the container and indicate selection state with `aria-pressed` on each button. Otherwise, screen readers will just see independent buttons without understanding their relationship or selected state.
**Action:** Always add `role="group"` and `aria-label` to custom toggle button groups, and use `aria-pressed` and `type="button"` on the individual buttons.
