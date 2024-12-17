import { createToken } from '../../lexer/utils';
import type { RuleDef } from '../builder/ruleDefTypes.js';
import { builtInCall } from '../sparql11/builtIn.js';
import { funcExpr2 } from '../sparql11/expressionhelpers';
import type { Expression } from '../sparqlJsTypes';

export const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const existingBuildInCall: RuleDef<'existingBuildInCall', Expression> = <const> {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};
