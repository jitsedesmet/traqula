import { createToken } from '../../lexer/utils';
import type { RuleDef } from '../builder/ruleDefTypes.js';
import { funcExpr2 } from '../expressionHelpers';
import { builtInCall } from '../sparql11/builtIn.js';
import type { Expression } from '../sparql11/Sparql11types';

export const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const existingBuildInCall: RuleDef<'existingBuildInCall', Expression> = <const> {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};
