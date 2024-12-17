/**
 * This module will define patch rules that should be used in combination with the sparql11 grammar to create
 * a sparql12 grammar.
 */

import * as l from '../../lexer/sparql11/index.js';
import * as l12 from '../../lexer/sparql12/index.js';
import type { RuleDef } from '../builder/ruleDefTypes';

import {
  builtInCall as builtInCallS11,
} from '../sparql11/builtIn';
import {
  primaryExpression as primaryExpressionS11,
} from '../sparql11/expression';
import { funcExpr1, funcExpr3 } from '../sparql11/expressionhelpers';
import { var_, verb } from '../sparql11/general';
import { blankNode, booleanLiteral, iri, numericLiteral, string } from '../sparql11/literals';
import {
  graphNode as graphNodeS11,
  graphNodePath as graphNodePathS11,
  propertyList,
  propertyListNotEmpty,
  propertyListPath,
  propertyListPathNotEmpty,
  triplesSameSubject as triplesSameSubjectS11,
  triplesSameSubjectPath as triplesSameSubjectPathS11,
} from '../sparql11/tripleBlock';

/**
 * [[56]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlock)
 */
export const reifiedTripleBlock: RuleDef<'reifiedTripleBlock', void> = <const> {
  name: 'reifiedTripleBlock',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(reifiedTriple);
    SUBRULE(propertyList);
  },
};

/**
 * [[57]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlockPath)
 */
export const reifiedTripleBlockPath: RuleDef<'reifiedTripleBlockPath', void> = <const> {
  name: 'reifiedTripleBlockPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(reifiedTriple);
    SUBRULE(propertyListPath);
  },
};

/**
 * [[67]](https://www.w3.org/TR/sparql12-query/#rDataBlockValue)
 */
export const dataBlockValue: RuleDef<'dataBlockValue', unknown> = <const> {
  name: 'dataBlockValue',
  impl: ({ CONSUME, SUBRULE, OR }) => () => OR<unknown>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => {
      CONSUME(l.undef);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    } },
    { ALT: () => SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rReifier)
 */
export const reifier: RuleDef<'reifier', void> = <const> {
  name: 'reifier',
  impl: ({ CONSUME, SUBRULE, OPTION }) => () => {
    CONSUME(l12.tilde);
    OPTION(() => SUBRULE(varOrReifierId));
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rVarOrReifierId)
 */
export const varOrReifierId: RuleDef<'varOrReifierId', unknown> = <const> {
  name: 'varOrReifierId',
  impl: ({ SUBRULE, OR }) => () => OR<unknown>([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(blankNode) },
  ]),
};

/**
 * [[79]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubject)
 */
export const triplesSameSubject: RuleDef<'triplesSameSubject', unknown> = <const> {
  name: 'triplesSameSubject',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => triplesSameSubjectS11.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTripleBlock) },
  ]),
};

/**
 * [[84]](https://www.w3.org/TR/sparql12-query/#rObject)
 */
export const object: RuleDef<'object', unknown> = <const> {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
    SUBRULE(annotation);
  },
};

/**
 * [[85]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath: RuleDef<'triplesSameSubjectPath', unknown> = <const> {
  name: 'triplesSameSubjectPath',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => triplesSameSubjectPathS11.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTripleBlockPath) },
  ]),
};

/**
 * [[91]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
export const objectPath: RuleDef<'objectPath', unknown> = <const> {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNodePath);
    SUBRULE(annotationPath);
  },
};

/**
 * [[107]](https://www.w3.org/TR/sparql12-query/#rAnnotationPath)
 * [[109]](https://www.w3.org/TR/sparql12-query/#rAnnotation)
 */
function annotationImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, unknown> {
  return <const> {
    name,
    impl: ({ SUBRULE, OR, MANY }) => () => {
      MANY(() => {
        OR([
          { ALT: () => SUBRULE(reifier) },
          { ALT: () => SUBRULE(allowPaths ? annotationBlockPath : annotationBlock) },
        ]);
      });
    },
  };
}
export const annotationPath: RuleDef<'annotationPath', unknown> = annotationImpl('annotationPath', true);
export const annotation: RuleDef<'annotation', unknown> = annotationImpl('annotation', false);

/**
 * [[108]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlockPath)
 * [[110]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlock)
 */
function annotationBlockImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, unknown> {
  return <const> {
    name,
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(l12.annotationOpen);
      SUBRULE(allowPaths ? propertyListPathNotEmpty : propertyListNotEmpty);
      CONSUME(l12.annotationClose);
    },
  };
}
export const annotationBlockPath = annotationBlockImpl('annotationBlockPath', true);
export const annotationBlock = annotationBlockImpl('annotationBlock', false);

/**
 * [[111]](https://www.w3.org/TR/sparql12-query/#rGraphNode)
 */
export const graphNode: RuleDef<'graphNode', unknown> = <const> {
  name: 'graphNode',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => graphNodeS11.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[112]](https://www.w3.org/TR/sparql12-query/#rGraphNodePath)
 */
export const graphNodePath: RuleDef<'graphNodePath', unknown> = <const> {
  name: 'graphNodePath',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => graphNodePathS11.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[113]](https://www.w3.org/TR/sparql12-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef<'varOrTerm', unknown> = <const> {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR, CONSUME }) => () => OR<unknown>([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(blankNode) },
    { ALT: () => {
      CONSUME(l.terminals.nil);
      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    } },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[114]](https://www.w3.org/TR/sparql12-query/#rReifiedTriple)
 */
export const reifiedTriple: RuleDef<'reifiedTriple', unknown> = <const> {
  name: 'reifiedTriple',
  impl: ({ CONSUME, SUBRULE, OPTION }) => () => {
    CONSUME(l12.reificationOpen);
    SUBRULE(reifiedTripleSubject);
    SUBRULE(reifiedTripleObject);
    SUBRULE(verb);
    OPTION(() => SUBRULE(reifier));
    CONSUME(l12.reificationClose);
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleSubject)
 */
export const reifiedTripleSubject: RuleDef<'reifiedTripleSubject', unknown> = <const> {
  name: 'reifiedTripleSubject',
  impl: ({ OR, SUBRULE }) => () => OR([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(blankNode) },
    { ALT: () => SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[116]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleObject)
 */
export const reifiedTripleObject: RuleDef<'reifiedTripleObject', unknown> = <const> {
  name: 'reifiedTripleObject',
  impl: $ => () => $.OR([
    { ALT: () => reifiedTripleSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[117](https://www.w3.org/TR/sparql12-query/#rTripleTerm)
 */
export const tripleTerm: RuleDef<'tripleTerm', unknown> = <const> {
  name: 'tripleTerm',
  impl: ({ CONSUME, SUBRULE }) => () => {
    CONSUME(l12.tripleTermOpen);
    SUBRULE(tripleTermSubject);
    SUBRULE(verb);
    SUBRULE(tripleTermObject);
    CONSUME(l12.tripleTermClose);
  },
};

/**
 * [[118](https://www.w3.org/TR/sparql12-query/#rTripleTermSubject)
 */
export const tripleTermSubject: RuleDef<'tripleTermSubject', unknown> = <const> {
  name: 'tripleTermSubject',
  impl: ({ SUBRULE, OR }) => () => OR<unknown>([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(blankNode) },
  ]),
};

/**
 * [[119](https://www.w3.org/TR/sparql12-query/#rTripleTermObject)
 */
export const tripleTermObject: RuleDef<'tripleTermObject', unknown> = <const> {
  name: 'tripleTermObject',
  impl: $ => () => $.OR([
    { ALT: () => tripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[120](https://www.w3.org/TR/sparql12-query/#rTripleTermData)
 */
export const tripleTermData: RuleDef<'tripleTermData', unknown> = <const> {
  name: 'tripleTermData',
  impl: ({ CONSUME, OR, SUBRULE }) => () => {
    CONSUME(l12.tripleTermOpen);
    SUBRULE(tripleTermDataSubject);
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => {
        CONSUME(l.a);
      } },
    ]);
    SUBRULE(tripleTermDataObject);
    CONSUME(l12.tripleTermClose);
  },
};

/**
 * [[121](https://www.w3.org/TR/sparql12-query/#rTripleTermDataSubject)
 */
export const tripleTermDataSubject: RuleDef<'tripleTermDataSubject', unknown> = <const> {
  name: 'tripleTermDataSubject',
  impl: ({ OR, SUBRULE }) => () => OR<unknown>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
  ]),
};

/**
 * [[122](https://www.w3.org/TR/sparql12-query/#rTripleTermDataObject)
 */
export const tripleTermDataObject: RuleDef<'tripleTermDataObject', unknown> = <const> {
  name: 'tripleTermDataObject',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => tripleTermDataSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[134](https://www.w3.org/TR/sparql12-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression', unknown> = <const> {
  name: 'primaryExpression',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => primaryExpressionS11.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

/**
 * [[135](https://www.w3.org/TR/sparql12-query/#rExprTripleTerm)
 */
export const exprTripleTerm: RuleDef<'exprTripleTerm', unknown> = <const> {
  name: 'exprTripleTerm',
  impl: ({ CONSUME, SUBRULE }) => () => {
    CONSUME(l12.tripleTermOpen);
    SUBRULE(exprTripleTermSubject);
    SUBRULE(verb);
    SUBRULE(exprTripleTermObject);
    CONSUME(l12.tripleTermClose);
  },
};

/**
 * [[136](https://www.w3.org/TR/sparql12-query/#rExprTripleTermSubject)
 */
export const exprTripleTermSubject: RuleDef<'exprTripleTermSubject', unknown> = <const> {
  name: 'exprTripleTermSubject',
  impl: ({ OR, SUBRULE }) => () => OR<unknown>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(var_) },
  ]),
};

/**
 * [[137](https://www.w3.org/TR/sparql12-query/#rExprTripleTermObject)
 */
export const exprTripleTermObject: RuleDef<'exprTripleTermObject', unknown> = <const> {
  name: 'exprTripleTermObject',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => exprTripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

const builtinLangDir = funcExpr1(l12.builtinLangDir);
const builtinLangStrDir = funcExpr3(l12.builtinStrLangDir);
const builtinIsTriple = funcExpr1(l12.builtinIsTRIPLE);
const builtinTriple = funcExpr3(l12.builtinTRIPLE);
const builtinSubject = funcExpr1(l12.builtinSUBJECT);
const builtinPredicate = funcExpr1(l12.builtinPREDICATE);
const builtinObject = funcExpr1(l12.builtinOBJECT);

/**
 * [[139](https://www.w3.org/TR/sparql12-query/#rBuiltInCall)
 */
export const builtInCall: RuleDef<'builtInCall', unknown> = <const> {
  name: 'builtInCall',
  impl: $ => () => $.OR<unknown>([
    { ALT: () => builtInCallS11.impl($)() },
    { ALT: () => $.SUBRULE(builtinLangDir) },
    { ALT: () => $.SUBRULE(builtinLangStrDir) },
    { ALT: () => $.SUBRULE(builtinIsTriple) },
    { ALT: () => $.SUBRULE(builtinTriple) },
    { ALT: () => $.SUBRULE(builtinSubject) },
    { ALT: () => $.SUBRULE(builtinPredicate) },
    { ALT: () => $.SUBRULE(builtinObject) },
  ]),
};

/**
 * [[147](https://www.w3.org/TR/sparql12-query/#rRDFLiteral)
 */
export const rdfLiteral: RuleDef<'rdfLiteral', unknown> = <const> {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, OPTION, CONSUME, OR }) => () => {
    SUBRULE(string);
    OPTION(() => {
      OR([
        { ALT: () => CONSUME(l12.LANG_DIR) },
        { ALT: () => {
          CONSUME(l.symbols.hathat);
          SUBRULE(iri);
        } },
      ]);
    });
  },
};
