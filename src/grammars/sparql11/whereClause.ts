import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { BlankTerm, IriTerm, LiteralTerm, Pattern, ValuePatternRow, VariableTerm } from '../sparqlJSTypes';
import { builtInCall } from './builtIn';
import { argList, brackettedExpression, expression } from './expression';
import { var_, varOrIri } from './general';
import { booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals';
import { subSelect } from './queryUnit';
import { triplesBlock } from './tripleBlock';

/**
 * [[17]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const whereClause: RuleDef<'whereClause', Pattern[]> = {
  name: 'whereClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.where);
    });
    return SUBRULE(groupGraphPattern);
  },
};

/**
 * [[53]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPattern)
 */
export const groupGraphPattern: RuleDef<'groupGraphPattern', Pattern[]> = {
  name: 'groupGraphPattern',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.symbols.LCurly);
    const result = OR([
      { ALT: () => [ SUBRULE(subSelect) ]},
      { ALT: () => SUBRULE(groupGraphPatternSub) },
    ]);
    CONSUME(l.symbols.RCurly);
    return result;
  },
};

/**
 * [[54]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPatternSub)
 */
export const groupGraphPatternSub: RuleDef<'groupGraphPatternSub', Pattern[]> = {
  name: 'groupGraphPatternSub',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => () => {
    const bgpPattern = OPTION1(() => SUBRULE1(triplesBlock));
    MANY(() => {
      SUBRULE(graphPatternNotTriples);
      OPTION2(() => {
        CONSUME(l.symbols.dot);
      });
      OPTION3(() => {
        SUBRULE2(triplesBlock);
      });
    });
  },
};

/**
 * [[56]](https://www.w3.org/TR/sparql11-query/#rGraphPatternNotTriples)
 */
export const graphPatternNotTriples: RuleDef<'graphPatternNotTriples'> = {
  name: 'graphPatternNotTriples',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(groupOrUnionGraphPattern) },
      { ALT: () => SUBRULE(optionalGraphPattern) },
      { ALT: () => SUBRULE(minusGraphPattern) },
      { ALT: () => SUBRULE(graphGraphPattern) },
      { ALT: () => SUBRULE(serviceGraphPattern) },
      { ALT: () => SUBRULE(filter) },
      { ALT: () => SUBRULE(bind) },
      { ALT: () => SUBRULE(inlineData) },
    ]);
  },
};

/**
 * [[57]](https://www.w3.org/TR/sparql11-query/#rOptionalGraphPattern)
 */
export const optionalGraphPattern: RuleDef<'optionalGraphPattern'> = {
  name: 'optionalGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.optional);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[67]](https://www.w3.org/TR/sparql11-query/#rGroupOrUnionGraphPattern)
 */
export const groupOrUnionGraphPattern: RuleDef<'groupOrUnionGraphPattern'> = {
  name: 'groupOrUnionGraphPattern',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(groupGraphPattern);
    MANY(() => {
      CONSUME(l.union);
      SUBRULE2(groupGraphPattern);
    });
  },
};

/**
 * [[58]](https://www.w3.org/TR/sparql11-query/#rGraphGraphPattern)
 */
export const graphGraphPattern: RuleDef<'graphGraphPattern'> = {
  name: 'graphGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[59]](https://www.w3.org/TR/sparql11-query/#rServiceGraphPattern)
 */
export const serviceGraphPattern: RuleDef<'serviceGraphPattern'> = {
  name: 'serviceGraphPattern',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.service);
    OPTION(() => {
      CONSUME(l.silent);
    });
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[60]](https://www.w3.org/TR/sparql11-query/#rBind)
 */
export const bind: RuleDef<'bind'> = {
  name: 'bind',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.bind);
    CONSUME(l.symbols.LParen);
    SUBRULE(expression);
    CONSUME(l.as);
    SUBRULE(var_);
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[61]](https://www.w3.org/TR/sparql11-query/#rInlineData)
 */
export const inlineData: RuleDef<'inlineData'> = {
  name: 'inlineData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.values);
    SUBRULE(dataBlock);
  },
};

/**
 * [[62]](https://www.w3.org/TR/sparql11-query/#rDataBlock)
 */
export const dataBlock: RuleDef<'dataBlock', ValuePatternRow[]> = {
  name: 'dataBlock',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(inlineDataOneVar) },
    { ALT: () => SUBRULE(inlineDataFull) },
  ]),
};

/**
 * [[63]](https://www.w3.org/TR/sparql11-query/#rInlineDataOneVar)
 */
export const inlineDataOneVar: RuleDef<'inlineDataOneVar', ValuePatternRow[]> = {
  name: 'inlineDataOneVar',
  impl: ({ SUBRULE, CONSUME, MANY }) => () => {
    const res: ValuePatternRow[] = [];
    const varVal = SUBRULE(var_);
    CONSUME(l.symbols.LCurly);
    MANY(() => {
      const value = SUBRULE(dataBlockValue);
      res.push({
        [varVal.value]: value,
      });
    });
    CONSUME(l.symbols.RCurly);
    return res;
  },
};

/**
 * [[64]](https://www.w3.org/TR/sparql11-query/#rInlineDataFull)
 */
export const inlineDataFull: RuleDef<'inlineDataFull', ValuePatternRow[]> = {
  name: 'inlineDataFull',
  impl: ({ OR, MANY, SUBRULE, CONSUME }) => () => OR([
    // Grammar rule 64 together with note 11 learns us that a nil should be followed by a nil in DataBlock.
    {
      ALT: () => {
        const res: ValuePatternRow[] = [];
        CONSUME(l.terminals.nil);
        CONSUME(l.symbols.LCurly);
        MANY(() => {
          CONSUME(l.terminals.nil);
          res.push({});
        });
        CONSUME(l.symbols.RCurly);
        return res;
      },
    },
    {
      ALT: () => {
        const res: ValuePatternRow[] = [];
        const vars: VariableTerm[] = [];

        CONSUME(l.symbols.LParen);
        MANY(() => {
          vars.push(SUBRULE(var_));
        });
        CONSUME(l.symbols.RParen);

        CONSUME(l.symbols.LCurly);
        MANY(() => {
          const varBinds: ValuePatternRow[string][] = [];
          CONSUME(l.symbols.LParen);
          MANY({
            GATE: () => vars.length > varBinds.length,
            DEF: () => {
              varBinds.push(SUBRULE(dataBlockValue));
            },
          });
          CONSUME(l.symbols.RParen);

          // TODO: what happens when I throw this error?
          if (varBinds.length !== vars.length) {
            throw new Error('Number of dataBlockValues does not match number of variables.');
          }
          const row: ValuePatternRow = {};
          for (const [ index, varVal ] of vars.entries()) {
            row[varVal.value] = varBinds[index];
          }
          res.push(row);
        });
        CONSUME(l.symbols.RCurly);
        return res;
      },
    },
  ]),
};

/**
 * [[65]](https://www.w3.org/TR/sparql11-query/#rDataBlockValue)
 */
export const dataBlockValue: RuleDef<'dataBlockValue', IriTerm | BlankTerm | LiteralTerm | undefined> = {
  name: 'dataBlockValue',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR< IriTerm | BlankTerm | LiteralTerm | undefined>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => {
      CONSUME(l.undef);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    } },
  ]),
};

/**
 * [[66]](https://www.w3.org/TR/sparql11-query/#rMinusGraphPattern)
 */
export const minusGraphPattern: RuleDef<'minusGraphPattern'> = {
  name: 'minusGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.minus);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql11-query/#rFilter)
 */
export const filter: RuleDef<'filter'> = {
  name: 'filter',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.filter);
    SUBRULE(constraint);
  },
};

/**
 * [[69]](https://www.w3.org/TR/sparql11-query/#rConstraint)
 */
export const constraint: RuleDef<'constraint'> = {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(functionCall) },
    ]);
  },
};

/**
 * [[70]](https://www.w3.org/TR/sparql11-query/#rFunctionCall)
 */
export const functionCall: RuleDef<'functionCall'> = {
  name: 'functionCall',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
    SUBRULE(argList);
  },
};
