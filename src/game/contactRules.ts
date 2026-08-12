import type {
  ContactAction,
  ContactCondition,
  ContactParticipantSelector,
  ContactRule,
} from "../levels/levelTypes";

export interface ContactVector {
  x: number;
  y: number;
}

export function addContactVectors(
  velocity: Readonly<ContactVector>,
  impulse: Readonly<ContactVector>,
): ContactVector {
  return { x: velocity.x + impulse.x, y: velocity.y + impulse.y };
}

/** Redirect preserves the current scalar speed; a stationary participant stays still. */
export function redirectVelocity(
  velocity: Readonly<ContactVector>,
  direction: Readonly<ContactVector>,
): ContactVector | undefined {
  const speed = Math.hypot(velocity.x, velocity.y);
  const directionLength = Math.hypot(direction.x, direction.y);
  if (speed === 0 || directionLength === 0) return undefined;
  return {
    x: (direction.x / directionLength) * speed,
    y: (direction.y / directionLength) * speed,
  };
}

/**
 * Runtime adapters register an identity, tag, and only the capabilities their
 * object supports. The rule executor deliberately has no object-type logic.
 */
export interface ContactParticipant {
  id: string;
  tag: string;
  destroy: () => void;
  applyImpulse?: (impulse: Readonly<ContactVector>) => void;
  redirect?: (direction: Readonly<ContactVector>) => void;
}

interface MatchedContact {
  participants: readonly [ContactParticipant, ContactParticipant];
}

function matchRule(
  rule: Readonly<ContactRule>,
  first: ContactParticipant,
  second: ContactParticipant,
): MatchedContact | undefined {
  const [firstTag, secondTag] = rule.contacts;
  if (firstTag === secondTag) {
    return first.tag === firstTag && second.tag === secondTag
      ? { participants: [first, second] }
      : undefined;
  }
  if (first.tag === firstTag && second.tag === secondTag) {
    return { participants: [first, second] };
  }
  if (first.tag === secondTag && second.tag === firstTag) {
    return { participants: [second, first] };
  }
  return undefined;
}

function selectParticipant(
  selector: Readonly<ContactParticipantSelector>,
  contact: Readonly<MatchedContact>,
): ContactParticipant | undefined {
  if (selector.type === "contact") return contact.participants[selector.index];
  return contact.participants.find(
    (participant) => participant.id === selector.id,
  );
}

function getActionTarget(
  action: Readonly<ContactAction>,
  contact: Readonly<MatchedContact>,
): ContactParticipant | undefined {
  if (typeof action.target !== "string") {
    return selectParticipant(action.target, contact);
  }
  return contact.participants.find(
    (participant) => participant.tag === action.target,
  );
}

function conditionMatches(
  condition: Readonly<ContactCondition>,
  contact: Readonly<MatchedContact>,
): boolean {
  switch (condition.type) {
    case "participant-id":
      return (
        selectParticipant(condition.target, contact)?.id === condition.equals
      );
  }
}

function conditionsMatch(
  conditions: readonly ContactCondition[] | undefined,
  contact: Readonly<MatchedContact>,
): boolean {
  return (
    conditions?.every((condition) => conditionMatches(condition, contact)) ??
    true
  );
}

export function executeContactRules(
  rules: ReadonlyArray<Readonly<ContactRule>>,
  first: ContactParticipant,
  second: ContactParticipant,
): void {
  const destroyed = new Set<ContactParticipant>();
  for (const rule of rules) {
    const contact = matchRule(rule, first, second);
    if (!contact || !conditionsMatch(rule.conditions, contact)) continue;
    const target = getActionTarget(rule.action, contact);
    if (!target || destroyed.has(target)) continue;

    switch (rule.action.type) {
      case "destroy":
        destroyed.add(target);
        target.destroy();
        break;
      case "impulse":
        target.applyImpulse?.(rule.action.impulse);
        break;
      case "redirect":
        target.redirect?.(rule.action.direction);
        break;
    }
  }
}
