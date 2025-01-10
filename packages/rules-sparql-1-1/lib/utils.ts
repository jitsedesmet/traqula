import type {GroupPattern, Pattern, PropertyPath, Term, VariableTerm} from "./grammar/Sparql11types";

export function deGroupSingle(group: GroupPattern): Pattern {
  return group.patterns.length === 1 ? group.patterns[0] : group;
}

export function isVariable(term: Term | PropertyPath): term is VariableTerm {
  return 'termType' in term && term.termType === 'Variable';
}