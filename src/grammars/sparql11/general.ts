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

/**
 * [[52]](https://www.w3.org/TR/sparql11-query/#rTriplesTemplate)
 */
export const triplesTemplate: RuleDef & { name: 'triplesTemplate' } = {
  name: 'triplesTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubject);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesTemplate);
      });
    });
  },
};

/**
 * [[75]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubject)
 */
export const triplesSameSubject: RuleDef & { name: 'triplesSameSubject' } = {
  name: 'triplesSameSubject',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      {
        ALT: () => {
          SUBRULE(varOrTerm);
          SUBRULE(propertyListNotEmpty);
        },
      },
      {
        ALT: () => {
          SUBRULE(triplesNode);
          SUBRULE(propertyList);
        },
      },
    ]);
  },
};

/**
 * [[76]](https://www.w3.org/TR/sparql11-query/#rPropertyList)
 */
export const propertyList: RuleDef & { name: 'propertyList' } = {
  name: 'propertyList',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListNotEmpty);
    });
  },
};

/**
 * [[77]](https://www.w3.org/TR/sparql11-query/#rPropertyListNotEmpty)
 */
export const propertyListNotEmpty: RuleDef & { name: 'propertyListNotEmpty' } = {
  name: 'propertyListNotEmpty',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION }) => () => {
    SUBRULE1(verb);
    SUBRULE1(objectList);
    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        SUBRULE2(verb);
        SUBRULE2(objectList);
      });
    });
  },
};

/**
 * [[78]](https://www.w3.org/TR/sparql11-query/#rVerb)
 */
export const verb: RuleDef & { name: 'verb' } = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrIri) },
      { ALT: () => CONSUME(l.a) },
    ]);
  },
};

/**
 * [[79]](https://www.w3.org/TR/sparql11-query/#rObjectList)
 */
export const objectList: RuleDef & { name: 'objectList' } = {
  name: 'objectList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(object);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(object);
    });
  },
};

/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 */
export const object: RuleDef & { name: 'object' } = {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
  },
};

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 */
export const triplesNode: RuleDef & { name: 'triplesNode' } = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collection) },
      { ALT: () => SUBRULE(blankNodePropertyList) },
    ]);
  },
};

/**
 * [[99]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyList)
 */
export const blankNodePropertyList: RuleDef & { name: 'blankNodePropertyList' } = {
  name: 'blankNodePropertyList',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 */
export const collection: RuleDef & { name: 'collection' } = {
  name: 'collection',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNode);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 */
export const graphNode: RuleDef & { name: 'graphNode' } = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNode) },
    ]);
  },
};
