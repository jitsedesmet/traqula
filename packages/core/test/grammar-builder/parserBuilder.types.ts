import { describe, it } from 'vitest';
import {Builder, RuleDef} from '../../lib';

const RuleA: RuleDef<'apple', 'apple'> = <any> undefined;
const RuleB: RuleDef<'banana', 'banana'> = <any> undefined;
const RuleC: RuleDef<'coconut', 'coconut'> = <any> undefined;

describe('parserBuilder', () => {
  describe('types', () => {
    it('builder constructor', () => {
      expectTypeOf(Builder.createBuilder(<const> [ RuleA ]))
        .toEqualTypeOf<Builder<'apple', { apple: typeof RuleA }>>();
      expectTypeOf(Builder.createBuilder(<const> [ RuleB ]))
        .toEqualTypeOf<Builder<'banana', { banana: typeof RuleB }>>();
      expectTypeOf(Builder.createBuilder(<const> [ RuleA, RuleB ]))
        .toEqualTypeOf<Builder<'apple' | 'banana', { apple: typeof RuleA, banana: typeof RuleB }>>();

      // AddRule
      expectTypeOf(Builder.createBuilder(<const> [ RuleA, RuleB ]).addRule(RuleC))
        .toEqualTypeOf<Builder<'apple' | 'banana' | 'coconut',
          { apple: typeof RuleA, banana: typeof RuleB, coconut: typeof RuleC }>>();

      // Merge
      expectTypeOf(
        Builder.createBuilder(<const> [ RuleA ]).
          merge(Builder.createBuilder(<const> [ RuleB ]), <const> [])
      ).toEqualTypeOf<Builder<'apple' | 'banana', { apple: typeof RuleA, banana: typeof RuleB }>>();

      expectTypeOf(
        Builder.createBuilder(<const> [ RuleA, RuleB ]).
        merge(Builder.createBuilder(<const> [ RuleB, RuleC ]), <const> [])
      ).toEqualTypeOf<Builder<'apple' | 'banana' | 'coconut',
          { apple: typeof RuleA, banana: typeof RuleB, coconut: typeof RuleC }>>();
    });
  });
});
