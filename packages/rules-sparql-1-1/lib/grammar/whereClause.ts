import * as l from '../lexer';
import type { RuleDef } from '@traqula/core';
import { deGroupSingle, isVariable } from '../utils';
import { builtInCall } from './builtIn';
import { argList, brackettedExpression, expression } from './expression';
import { var_, varOrIri } from './general';
import { booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals';
import { subSelect } from './queryUnit/queryUnit';
import type {
  BindPattern,
  BlankTerm,
  BlockPattern,
  Expression,
  FilterPattern,
  FunctionCallExpression,
  GraphPattern,
  GroupPattern,
  IriTerm,
  LiteralTerm,
  MinusPattern,
  OptionalPattern,
  Pattern,
  ServicePattern,
  UnionPattern,
  ValuePatternRow,
  ValuesPattern,
  VariableTerm,
} from '../Sparql11types';
import { triplesBlock } from './tripleBlock';

/**
 * [[17]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const whereClause: RuleDef<'whereClause', Pattern[]> = <const> {
  name: 'whereClause',
  impl: ({ ACTION, SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.where);
    });
    const group = SUBRULE(groupGraphPattern);
    return ACTION(() => group.patterns);
  },
};

/**
 * [[53]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPattern)
 */
export const groupGraphPattern: RuleDef<'groupGraphPattern', GroupPattern> = <const> {
  name: 'groupGraphPattern',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.symbols.LCurly);
    const patterns = OR([
      { ALT: () => [ SUBRULE(subSelect) ]},
      { ALT: () => SUBRULE(groupGraphPatternSub) },
    ]);
    CONSUME(l.symbols.RCurly);
    return {
      type: 'group',
      patterns,
    };
  },
};

function findBoundVarsFromGroupGraphPattern(pattern: Pattern, boundedVars: Set<string>): void {
  if ('triples' in pattern) {
    for (const triple of pattern.triples) {
      if (isVariable(triple.subject)) {
        boundedVars.add(triple.subject.value);
      }
      if (isVariable(triple.predicate)) {
        boundedVars.add(triple.predicate.value);
      }
      if (isVariable(triple.object)) {
        boundedVars.add(triple.object.value);
      }
    }
  } else if ('patterns' in pattern) {
    for (const pat of pattern.patterns) {
      findBoundVarsFromGroupGraphPattern(pat, boundedVars);
    }
  }
}

/**
 * [[54]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPatternSub)
 */
export const groupGraphPatternSub: RuleDef<'groupGraphPatternSub', Pattern[]> = <const> {
  name: 'groupGraphPatternSub',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => () => {
    const patterns: Pattern[] = [];

    const bgpPattern = OPTION1(() => SUBRULE1(triplesBlock));
    ACTION(() => {
      if (bgpPattern) {
        patterns.push(bgpPattern);
      }
    });
    MANY(() => {
      const notTriples = SUBRULE(graphPatternNotTriples);
      patterns.push(notTriples);
      OPTION2(() => CONSUME(l.symbols.dot));
      const moreTriples = OPTION3(() => SUBRULE2(triplesBlock));
      ACTION(() => {
        if (moreTriples) {
          patterns.push(moreTriples);
        }
      });
    });

    // Check note 13 of the spec.
    // TODO: currently optimized for case bind is present.
    //  Since every iteration, even when no bind is present, we walk the tree collecting variables.
    //  optimize either by: checking whether bind is present, or by keeping track of variables and passing them through
    ACTION(() => {
      const boundedVars = new Set<string>();
      for (const pattern of patterns) {
        // Element can be bind, in that case, check note 13. If it is not, buildup set of bounded variables.
        if (pattern.type === 'bind') {
          if (boundedVars.has(pattern.variable.value)) {
            throw new Error(`Variable used to bind is already bound (?${pattern.variable.value})`);
          }
        } else if (pattern.type === 'group' || pattern.type === 'bgp') {
          findBoundVarsFromGroupGraphPattern(pattern, boundedVars);
        }
      }
    });

    return patterns;
  },
};

/**
 * [[56]](https://www.w3.org/TR/sparql11-query/#rGraphPatternNotTriples)
 */
type GraphPatternNotTriplesReturn = ValuesPattern | BindPattern | FilterPattern | BlockPattern;
export const graphPatternNotTriples:
RuleDef<'graphPatternNotTriples', GraphPatternNotTriplesReturn> = {
  name: 'graphPatternNotTriples',
  impl: ({ SUBRULE, OR }) => () => OR<GraphPatternNotTriplesReturn>([
    { ALT: () => SUBRULE(groupOrUnionGraphPattern) },
    { ALT: () => SUBRULE(optionalGraphPattern) },
    { ALT: () => SUBRULE(minusGraphPattern) },
    { ALT: () => SUBRULE(graphGraphPattern) },
    { ALT: () => SUBRULE(serviceGraphPattern) },
    { ALT: () => SUBRULE(filter) },
    { ALT: () => SUBRULE(bind) },
    { ALT: () => SUBRULE(inlineData) },
  ]),
};

/**
 * [[57]](https://www.w3.org/TR/sparql11-query/#rOptionalGraphPattern)
 */
export const optionalGraphPattern: RuleDef<'optionalGraphPattern', OptionalPattern> = <const> {
  name: 'optionalGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => () => {
    CONSUME(l.optional);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => ({
      type: 'optional',
      patterns: group.patterns,
    }));
  },
};

/**
 * [[58]](https://www.w3.org/TR/sparql11-query/#rGraphGraphPattern)
 */
export const graphGraphPattern: RuleDef<'graphGraphPattern', GraphPattern> = <const> {
  name: 'graphGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    const name = SUBRULE(varOrIri);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => ({
      type: 'graph',
      name,
      patterns: group.patterns,
    }));
  },
};

/**
 * [[59]](https://www.w3.org/TR/sparql11-query/#rServiceGraphPattern)
 */
export const serviceGraphPattern: RuleDef<'serviceGraphPattern', ServicePattern> = <const> {
  name: 'serviceGraphPattern',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.service);
    const silent = Boolean(OPTION(() => CONSUME(l.silent)));
    const name = SUBRULE(varOrIri);
    const group = SUBRULE(groupGraphPattern);

    return {
      type: 'service',
      name,
      silent,
      patterns: group.patterns,
    };
  },
};

/**
 * [[60]](https://www.w3.org/TR/sparql11-query/#rBind)
 */
export const bind: RuleDef<'bind', BindPattern> = <const> {
  name: 'bind',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.bind);
    CONSUME(l.symbols.LParen);
    const expressionVal = SUBRULE(expression);
    CONSUME(l.as);
    const variable = SUBRULE(var_);
    CONSUME(l.symbols.RParen);

    return {
      type: 'bind',
      variable,
      expression: expressionVal,
    };
  },
};

/**
 * [[61]](https://www.w3.org/TR/sparql11-query/#rInlineData)
 */
export const inlineData: RuleDef<'inlineData', ValuesPattern> = <const> {
  name: 'inlineData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.values);
    const values = SUBRULE(dataBlock);

    return {
      type: 'values',
      values,
    };
  },
};

/**
 * [[62]](https://www.w3.org/TR/sparql11-query/#rDataBlock)
 */
export const dataBlock: RuleDef<'dataBlock', ValuePatternRow[]> = <const> {
  name: 'dataBlock',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(inlineDataOneVar) },
    { ALT: () => SUBRULE(inlineDataFull) },
  ]),
};

/**
 * [[63]](https://www.w3.org/TR/sparql11-query/#rInlineDataOneVar)
 */
export const inlineDataOneVar: RuleDef<'inlineDataOneVar', ValuePatternRow[]> = <const> {
  name: 'inlineDataOneVar',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY }) => () => {
    const res: ValuePatternRow[] = [];
    const varVal = SUBRULE(var_);
    CONSUME(l.symbols.LCurly);
    MANY(() => {
      const value = SUBRULE(dataBlockValue);

      ACTION(() => res.push({
        [`?${varVal.value}`]: value,
      }));
    });
    CONSUME(l.symbols.RCurly);
    return res;
  },
};

/**
 * [[64]](https://www.w3.org/TR/sparql11-query/#rInlineDataFull)
 */
export const inlineDataFull: RuleDef<'inlineDataFull', ValuePatternRow[]> = <const> {
  name: 'inlineDataFull',
  impl: ({ ACTION, OR, MANY1, MANY2, MANY3, MANY4, SUBRULE, CONSUME1, CONSUME2 }) => () => OR([
    // Grammar rule 64 together with note 11 learns us that a nil should be followed by a nil in DataBlock.
    {
      ALT: () => {
        const res: ValuePatternRow[] = [];
        CONSUME1(l.terminals.nil);
        CONSUME1(l.symbols.LCurly);
        MANY1(() => {
          CONSUME2(l.terminals.nil);
          res.push({});
        });
        CONSUME1(l.symbols.RCurly);
        return res;
      },
    },
    {
      ALT: () => {
        const res: ValuePatternRow[] = [];
        const vars: VariableTerm[] = [];

        CONSUME1(l.symbols.LParen);
        MANY2(() => {
          vars.push(SUBRULE(var_));
        });
        CONSUME1(l.symbols.RParen);

        CONSUME2(l.symbols.LCurly);
        MANY3(() => {
          const varBinds: ValuePatternRow[string][] = [];
          CONSUME2(l.symbols.LParen);
          MANY4({
            DEF: () => {
              ACTION(() => {
                if (vars.length <= varBinds.length) {
                  throw new Error('Number of dataBlockValues does not match number of variables. Too much values.');
                }
              });
              varBinds.push(SUBRULE(dataBlockValue));
            },
          });
          CONSUME2(l.symbols.RParen);

          ACTION(() => {
            if (varBinds.length !== vars.length) {
              throw new Error('Number of dataBlockValues does not match number of variables. Too few values.');
            }
            const row: ValuePatternRow = {};
            for (const [ index, varVal ] of vars.entries()) {
              row[`?${varVal.value}`] = varBinds[index];
            }
            res.push(row);
          });
        });
        CONSUME2(l.symbols.RCurly);
        return res;
      },
    },
  ]),
};

/**
 * [[65]](https://www.w3.org/TR/sparql11-query/#rDataBlockValue)
 */
export const dataBlockValue: RuleDef<'dataBlockValue', IriTerm | BlankTerm | LiteralTerm | undefined> = <const> {
  name: 'dataBlockValue',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR< IriTerm | BlankTerm | LiteralTerm | undefined>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    {
      ALT: () => {
        CONSUME(l.undef);
        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      },
    },
  ]),
};

/**
 * [[66]](https://www.w3.org/TR/sparql11-query/#rMinusGraphPattern)
 */
export const minusGraphPattern: RuleDef<'minusGraphPattern', MinusPattern> = <const> {
  name: 'minusGraphPattern',
  impl: ({ ACTION, SUBRULE, CONSUME }) => () => {
    CONSUME(l.minus);
    const group = SUBRULE(groupGraphPattern);

    return ACTION(() => ({
      type: 'minus',
      patterns: group.patterns,
    }));
  },
};

/**
 * [[67]](https://www.w3.org/TR/sparql11-query/#rGroupOrUnionGraphPattern)
 */
export const groupOrUnionGraphPattern: RuleDef<'groupOrUnionGraphPattern', GroupPattern | UnionPattern> = <const> {
  name: 'groupOrUnionGraphPattern',
  impl: ({ AT_LEAST_ONE_SEP, SUBRULE }) => () => {
    const groups: GroupPattern[] = [];

    AT_LEAST_ONE_SEP({
      DEF: () => {
        const group = SUBRULE(groupGraphPattern);
        groups.push(group);
      },
      SEP: l.union,
    });

    return groups.length === 1 ?
      groups[0] :
        {
          type: 'union',
          patterns: groups.map(group => deGroupSingle(group)),
        };
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql11-query/#rFilter)
 */
export const filter: RuleDef<'filter', FilterPattern> = <const> {
  name: 'filter',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.filter);
    const expression = SUBRULE(constraint);

    return {
      type: 'filter',
      expression,
    };
  },
};

/**
 * [[69]](https://www.w3.org/TR/sparql11-query/#rConstraint)
 */
export const constraint: RuleDef<'constraint', Expression> = <const> {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(brackettedExpression) },
    { ALT: () => SUBRULE(builtInCall) },
    { ALT: () => SUBRULE(functionCall) },
  ]),
};

/**
 * [[70]](https://www.w3.org/TR/sparql11-query/#rFunctionCall)
 */
export const functionCall: RuleDef<'functionCall', FunctionCallExpression> = <const> {
  name: 'functionCall',
  impl: ({ ACTION, SUBRULE }) => () => {
    const func = SUBRULE(iri);
    const args = SUBRULE(argList);
    return ACTION(() => ({
      ...args,
      function: func,
    }));
  },
};
