import type { ParserMethod } from 'chevrotain';
import type { RuleDef } from './ruleDefTypes.js';

export type RuleDefReturn<T> = T extends RuleDef<any, infer Ret, any> ? Ret : never;
// Check if 2 types are overlap, if they do, return never, else return V
export type CheckOverlap<T, U, V> = T & U extends never ? V : never;
export type RuleNames<T extends readonly RuleDef[]> = T[number]['name'];
// TAIL RECURSION! https://github.com/Beppobert/ts-prevent-recursion-limit
export type OmitRuleDef<Rules extends readonly RuleDef[], ToOmit extends string, Agg extends RuleDef[] = []> =
  Rules extends readonly [infer First, infer Second, ...infer Rest] ? (
    First extends RuleDef ? (
      Second extends RuleDef ? (
        Rest extends RuleDef[] ? (
          OmitRuleDef<
            Rest,
            ToOmit,
            First['name'] extends ToOmit ? (
              Second['name'] extends ToOmit ?
                Agg : [...Agg, Second]
            ) : (
              Second['name'] extends ToOmit ?
                  [...Agg, First] : [...Agg, First, Second]
            )
          >
        ) : never
      ) : never
    ) : never
  ) : (
    Rules extends [infer First] ? (
      First extends RuleDef ? (
        First['name'] extends ToOmit ? Agg : [...Agg, First]
      ) : never
    ) : Agg
  );
export type OmitContainingRule<T extends readonly RuleDef[], Name extends RuleNames<T>> =
  OmitRuleDef<T, Name>;
export type RuleCheckOverlap<T extends RuleDef, U extends string> =
  CheckOverlap<T['name'], U, T>;
export type RuleDefsCheckOverlap<T extends readonly RuleDef[], U extends readonly RuleDef[]> =
  CheckOverlap<RuleNames<T>, RuleNames<U>, T>;
/**
 * Convert a list of RuleDefs to a Record with the name of the RuleDef as the key, matching the RuleDefMap type.
 */
export type InnerRuleDefsToRecord<
  T extends readonly RuleDef[],
  Agg extends Record<string, RuleDef> = Record<string, RuleDef>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends RuleDef ? (
    Rest extends readonly RuleDef[] ? (
      InnerRuleDefsToRecord<Rest, Agg & Record<First['name'], First>>
    ) : never
  ) : never
) : Agg;
export type RuleDefsToRecord<T extends readonly RuleDef[]> =
  {[K in keyof InnerRuleDefsToRecord<T>]: InnerRuleDefsToRecord<T>[K] };
export type RuleDefsToParserMethods<
  T extends readonly RuleDef[],
  Agg extends Record<string, ParserMethod<unknown[], unknown>> = Record<string, ParserMethod<unknown[], unknown>>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends RuleDef ? (
    Rest extends readonly RuleDef[] ? (
      First extends RuleDef<string, infer RET, infer ARGS> ? (
        RuleDefsToParserMethods<Rest, Agg & Record<First['name'], ParserMethod<ARGS, RET>>>
      ) : never
    ) : never
  ) : never
) : Agg;
export type RuleDefsToSelfSufficientParser<
  T extends readonly RuleDef[],
  Agg extends Record<
    string,
    (input: string, args: unknown[]) => unknown
  > = Record<string, (input: string, args: unknown[]) => unknown>,
> = T extends readonly [infer First, ...infer Rest] ? (
  First extends RuleDef ? (
    Rest extends readonly RuleDef[] ? (
      First extends RuleDef<string, infer RET, infer ARGS> ? (
        RuleDefsToSelfSufficientParser<Rest, Agg & Record<First['name'], (input: string, ...args: ARGS) => RET>>
      ) : never
    ) : never
  ) : never
) : Agg;
export type RuleDefMap<RuleNames extends string> = {[Key in RuleNames]: RuleDef<Key> };
