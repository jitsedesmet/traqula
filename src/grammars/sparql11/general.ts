import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';

/**
 * [[4]](https://www.w3.org/TR/sparql11-query/#rPrologue)
 */
export const prologue: RuleDef & { name: 'prologue' } = {
  name: 'prologue',
  impl: ({ SUBRULE, MANY, OR }) => () => {
    MANY(() => {
      OR([
        { ALT: () => SUBRULE(baseDecl) },
        { ALT: () => SUBRULE(prefixDecl) },
      ]);
    });
  },
};

/**
 * [[5]](https://www.w3.org/TR/sparql11-query/#rBaseDecl)
 */
export const baseDecl: RuleDef & { name: 'baseDecl' } = {
  name: 'baseDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.baseDecl);
    CONSUME(l.terminals.iriRef);
  },
};

/**
 * [[6]](https://www.w3.org/TR/sparql11-query/#rPrefixDecl)
 */
export const prefixDecl: RuleDef & { name: 'prefixDecl' } = {
  name: 'prefixDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.prefixDecl);
    CONSUME(l.terminals.pNameNs);
    CONSUME(l.terminals.iriRef);
  },
};

/**
 * [[106]](https://www.w3.org/TR/sparql11-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef & { name: 'varOrTerm' } = {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(graphTerm) },
    ]);
  },
};

/**
 * [[107]](https://www.w3.org/TR/sparql11-query/#rVarOrIri)
 */
export const varOrIri: RuleDef & { name: 'varOrIri' } = {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(iri) },
    ]);
  },
};

/**
 * [[108]](https://www.w3.org/TR/sparql11-query/#rVar)
 */
export const var_: RuleDef & { name: 'var' } = {
  name: 'var',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.var1) },
      { ALT: () => CONSUME(l.terminals.var2) },
    ]);
  },
};

/**
 * [[109]](https://www.w3.org/TR/sparql11-query/#rGraphTerm)
 */
export const graphTerm: RuleDef & { name: 'graphTerm' } = {
  name: 'graphTerm',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(numericLiteral) },
      { ALT: () => SUBRULE(booleanLiteral) },
      { ALT: () => SUBRULE(blankNode) },
      { ALT: () => CONSUME(l.terminals.nil) },
    ]);
  },
};

/**
 * [[129]](https://www.w3.org/TR/sparql11-query/#rRDFLiteral)
 */
export const rdfLiteral: RuleDef & { name: 'rdfLiteral' } = {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => {
    SUBRULE(string);
    OPTION(() => {
      OR([
        { ALT: () => CONSUME(l.terminals.langTag) },
        {
          ALT: () => {
            CONSUME(l.symbols.hathat);
            SUBRULE(iri);
          },
        },
      ]);
    });
  },
};

/**
 * [[130]](https://www.w3.org/TR/sparql11-query/#rNumericLiteral)
 */
export const numericLiteral: RuleDef & { name: 'numericLiteral' } = {
  name: 'numericLiteral',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(numericLiteralUnsigned) },
      { ALT: () => SUBRULE(numericLiteralPositive) },
      { ALT: () => SUBRULE(numericLiteralNegative) },
    ]);
  },
};

/**
 * [[131]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralUnsigned)
 */
export const numericLiteralUnsigned: RuleDef & { name: 'numericLiteralUnsigned' } = {
  name: 'numericLiteralUnsigned',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.integer) },
      { ALT: () => CONSUME(l.terminals.decimal) },
      { ALT: () => CONSUME(l.terminals.double) },
    ]);
  },
};

/**
 * [[132]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralPositive)
 */
export const numericLiteralPositive: RuleDef & { name: 'numericLiteralPositive' } = {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interferePositive) },
      { ALT: () => CONSUME(l.terminals.decimalPositive) },
      { ALT: () => CONSUME(l.terminals.doublePositive) },
    ]);
  },
};

/**
 * [[133]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralNegative)
 */
export const numericLiteralNegative: RuleDef & { name: 'numericLiteralNegative' } = {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interfereNegative) },
      { ALT: () => CONSUME(l.terminals.decimalNegative) },
      { ALT: () => CONSUME(l.terminals.doubleNegative) },
    ]);
  },
};

/**
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: RuleDef & { name: 'booleanLiteral' } = {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.true_) },
      { ALT: () => CONSUME(l.false_) },
    ]);
  },
};

/**
 * [[135]](https://www.w3.org/TR/sparql11-query/#rString)
 */
export const string: RuleDef & { name: 'string' } = {
  name: 'string',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.stringLiteral1) },
      { ALT: () => CONSUME(l.terminals.stringLiteral2) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong1) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong2) },
    ]);
  },
};

/**
 * [[136]](https://www.w3.org/TR/sparql11-query/#riri)
 */
export const iri: RuleDef & { name: 'iri' } = {
  name: 'iri',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.iriRef) },
      { ALT: () => SUBRULE(prefixedName) },
    ]);
  },
};

/**
 * [[137]](https://www.w3.org/TR/sparql11-query/#rPrefixedName)
 */
export const prefixedName: RuleDef & { name: 'prefixedName' } = {
  name: 'prefixedName',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.pNameLn) },
      { ALT: () => CONSUME(l.terminals.pNameNs) },
    ]);
  },
};

/**
 * [[138]](https://www.w3.org/TR/sparql11-query/#rBlankNode)
 */
export const blankNode: RuleDef & { name: 'blankNode' } = {
  name: 'blankNode',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.blankNodeLabel) },
      { ALT: () => CONSUME(l.terminals.anon) },
    ]);
  },
};
