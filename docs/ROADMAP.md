# Roadmap

This roadmap is planning guidance, not a commitment to implement every item
without a separate scoped milestone request.

## #14 — Multi-level architecture and selection

- Support a validated catalog of level JSON files.
- Add a minimal level-selection flow and deterministic load/reset boundaries.
- Keep each level's ownership and inventory data self-contained.

## #15 — Third physics component

- Add one small, original component type with clearly bounded physics behavior.
- Define JSON schema, ownership, placement, tray, reset, and validation rules.
- Add focused unit and browser coverage before expanding the component set.

## #16 — Puzzle progression

- Define completion state across multiple levels.
- Add a minimal progression presentation without accounts or persistence beyond
  the explicitly approved scope.
- Verify reset/Rerun semantics at level boundaries.

## #17 — Editor UX improvements

- Improve selection visibility, placement feedback, and invalid-placement
  messaging.
- Evaluate keyboard discoverability, tray affordances, and input accessibility.
- Preserve the constrained prototype editor rather than broadening it into a
  general-purpose level editor.

## #18 — E2E, polish, and MVP review

- Expand Playwright coverage to tray, ownership, removal, Rerun, and additional
  levels/components.
- Review manual browser behavior, responsiveness, performance, and build size.
- Assess the prototype against an explicit MVP checklist before adding broader
  scope.
