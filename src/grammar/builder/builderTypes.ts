import type { ParserMethod } from 'chevrotain';
import type { RuleDef } from './ruleDefTypes';

export type RuleNamesFromList<T extends readonly RuleDef[]> = T[number]['name'];

export type RuleDefMap<RuleNames extends string> = {[Key in RuleNames]: RuleDef<Key> };

export type CheckOverlap<T, U, V, W = never> = T & U extends never ? V : W;

/**
 * Convert a list of RuleDefs to a Record with the name of the RuleDef as the key, matching the RuleDefMap type.
 */
export type RuleListToObject<
  T extends readonly RuleDef[],
  Agg extends Record<string, RuleDef> = Record<never, never>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends RuleDef ? (
    Rest extends readonly RuleDef[] ? (
      RuleListToObject<Rest, {[K in keyof Agg | First['name']]: K extends First['name'] ? First : Agg[K] }>
    ) : never
  ) : never
) : Agg;

export type ParserFromRules<Names extends string, RuleDefs extends RuleDefMap<Names>> = {
  [K in Names]: RuleDefs[K] extends RuleDef<K, infer RET, infer ARGS> ? (...args: ARGS) => RET : never
};

export type ParseMethodsFromRules<Names extends string, RuleDefs extends RuleDefMap<Names>> = {
  [K in Names]: RuleDefs[K] extends RuleDef<K, infer RET, infer ARGS> ? ParserMethod<ARGS, RET> : never
};
