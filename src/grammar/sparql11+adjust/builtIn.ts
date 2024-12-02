import { createToken } from '../../lexer/sparql11/helpers.js';
import type { RuleDef } from '../parserBuilder.js';
import { builtInCall } from '../sparql11/builtIn.js';
import type { Expression } from '../sparqlJSTypes.js';
import { funcExpr2 } from '../utils.js';

export const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const existingBuildInCall: RuleDef<'existingBuildInCall', Expression> = {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};
