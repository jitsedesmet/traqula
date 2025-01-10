import { createToken } from '@traqula/core/lib/lexer-helper/utils';
import type { RuleDef } from '@traqula/core/lib/grammar-builder/ruleDefTypes';
import { funcExpr2 } from '@traqula/rules-sparql-1-1/lib/expressionHelpers';
import { builtInCall } from '@traqula/rules-sparql-1-1/lib/grammar/builtIn';
import type { Expression } from '@traqula/rules-sparql-1-1/lib/grammar/Sparql11types';

export const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const existingBuildInCall: RuleDef<'existingBuildInCall', Expression> = <const> {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};
