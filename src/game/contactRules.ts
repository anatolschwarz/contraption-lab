import type { ContactRule, ContactTag } from "../levels/levelTypes";

export interface ContactParticipant {
  tag: ContactTag;
  destroy: () => void;
}

function ruleMatches(
  rule: Readonly<ContactRule>,
  firstTag: ContactTag,
  secondTag: ContactTag,
): boolean {
  const [firstRuleTag, secondRuleTag] = rule.contacts;
  return (
    (firstRuleTag === firstTag && secondRuleTag === secondTag) ||
    (firstRuleTag === secondTag && secondRuleTag === firstTag)
  );
}

function getTarget(
  rule: Readonly<ContactRule>,
  first: ContactParticipant,
  second: ContactParticipant,
): ContactParticipant | undefined {
  if (first.tag === rule.action.target) return first;
  if (second.tag === rule.action.target) return second;
  return undefined;
}

export function executeContactRules(
  rules: ReadonlyArray<Readonly<ContactRule>>,
  first: ContactParticipant,
  second: ContactParticipant,
): void {
  const destroyed = new Set<ContactParticipant>();
  for (const rule of rules) {
    if (!ruleMatches(rule, first.tag, second.tag)) continue;
    const target = getTarget(rule, first, second);
    if (!target || destroyed.has(target)) continue;
    destroyed.add(target);
    target.destroy();
  }
}
