import { createToken } from '../../lexer/sparql11/helpers';
import type { RuleDef } from '../parserBuilder';
import { builtInCall } from '../sparql11/builtIn';
import type { Expression } from '../sparqlJSTypes';
import { funcExpr2 } from '../utils';

export const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

export const builtInAdjust = funcExpr2(BuiltInAdjust);

export const existingBuildInCall: RuleDef<'existingBuildInCall', Expression> = {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};
