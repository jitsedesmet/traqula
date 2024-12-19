/**
 * This module will define patch rules that should be used in combination with the sparql11 grammar to create
 * a sparql12 grammar.
 */

import type { DefaultGraph } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index.js';
import * as l12 from '../../lexer/sparql12/index.js';
import type { RuleDef, RuleDefReturn } from '../builder/ruleDefTypes';
import { funcExpr1, funcExpr3 } from '../expressionHelpers';
import * as S11 from '../sparql11/index';
import type { BlankTerm, Expression, IriTerm, LiteralTerm, QuadTerm, Term, VariableTerm } from '../sparqlJsTypes';
import { CommonIRIs } from '../utils';
import type { BaseQuadTerm } from './sparql12Types';

/**
 * [[56]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlock)
 * [[57]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlockPath)
 */
function reifiedTripleBlockImpl<T extends string>(name: T, allowPath: boolean):
RuleDef<T, RuleDefReturn<typeof S11.triplesSameSubject>> {
  return <const> {
    name,
    impl: ({ SUBRULE }) => () => {
      const triple = SUBRULE(reifiedTriple);
      const properties = SUBRULE(allowPath ? S11.propertyListPath : S11.propertyList);

      return properties.map(partial => partial({
        subject: <Exclude<typeof triple.object, DefaultGraph>> triple.object,
      }));
    },
  };
}
export const reifiedTripleBlock = reifiedTripleBlockImpl('reifiedTripleBlock', false);
export const reifiedTripleBlockPath = reifiedTripleBlockImpl('reifiedTripleBlockPath', true);

/**
 * [[67]](https://www.w3.org/TR/sparql12-query/#rDataBlockValue)
 */
export const dataBlockValue:
RuleDef<'dataBlockValue', RuleDefReturn<typeof S11.dataBlockValue> | QuadTerm> = <const> {
  name: 'dataBlockValue',
  impl: $ => () => $.OR<RuleDefReturn<typeof S11.dataBlockValue> | QuadTerm>([
    { ALT: () => S11.dataBlockValue.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rReifier)
 */
export const reifier: RuleDef<'reifier', VariableTerm | IriTerm | BlankTerm | undefined> = <const> {
  name: 'reifier',
  impl: ({ CONSUME, SUBRULE, OPTION }) => () => {
    CONSUME(l12.tilde);
    return OPTION(() => SUBRULE(varOrReifierId));
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rVarOrReifierId)
 */
export const varOrReifierId: RuleDef<'varOrReifierId', VariableTerm | IriTerm | BlankTerm> = <const> {
  name: 'varOrReifierId',
  impl: ({ SUBRULE, OR }) => () => OR<VariableTerm | IriTerm | BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

/**
 * [[79]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubject)
 * [[85]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<
  T,
  RuleDefReturn<typeof S11.triplesSameSubject>
> {
  return <const> {
    name,
    impl: $ => () => $.OR([
      { ALT: () => allowPaths ? S11.triplesSameSubjectPath.impl($)() : S11.triplesSameSubject.impl($)() },
      { ALT: () => $.SUBRULE(allowPaths ? reifiedTripleBlockPath : reifiedTripleBlock) },
    ]),
  };
}
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

/**
 * [[84]](https://www.w3.org/TR/sparql12-query/#rObject)
 * [[91]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
function objectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<
  T,
  RuleDefReturn<typeof graphNode> | { object: RuleDefReturn<typeof graphNode>; reifierAnnotations: Annotation[] }
> {
  return <const>{
    name,
    impl: ({ ACTION, SUBRULE }) => () => {
      const objectVal = SUBRULE(allowPaths ? graphNodePath : graphNode);
      const annotationVal = SUBRULE(allowPaths ? annotationPath : annotation);
      return ACTION(() => {
        if (annotationVal.length > 0) {
          return { object: objectVal, reifierAnnotations: annotationVal };
        }
        return objectVal;
      });
    },
  };
}
export const object = objectImpl('object', false);
export const objectPath = objectImpl('objectPath', true);

/**
 * [[107]](https://www.w3.org/TR/sparql12-query/#rAnnotationPath)
 * [[109]](https://www.w3.org/TR/sparql12-query/#rAnnotation)
 */
export type Annotation =
  { reifier: RuleDefReturn<typeof reifier> } | { annotation: RuleDefReturn<typeof annotationBlock> };
function annotationImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, Annotation[]> {
  return <const> {
    name,
    impl: ({ SUBRULE, OR, MANY }) => () => {
      const annotations: Annotation[] = [];
      MANY(() => {
        OR([
          { ALT: () => annotations.push({ reifier: SUBRULE(reifier) }) },
          { ALT: () => annotations.push({ annotation: SUBRULE(allowPaths ? annotationBlockPath : annotationBlock) }) },
        ]);
      });
      return annotations;
    },
  };
}
export const annotationPath = annotationImpl('annotationPath', true);
export const annotation = annotationImpl('annotation', false);

/**
 * [[108]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlockPath)
 * [[110]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlock)
 */
function annotationBlockImpl<T extends string>(name: T, allowPaths: boolean):
RuleDef<T, RuleDefReturn<typeof S11.propertyListPathNotEmpty>> {
  return <const> {
    name,
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(l12.annotationOpen);
      const res = SUBRULE(allowPaths ? S11.propertyListPathNotEmpty : S11.propertyListNotEmpty);
      CONSUME(l12.annotationClose);
      return res;
    },
  };
}
export const annotationBlockPath = annotationBlockImpl('annotationBlockPath', true);
export const annotationBlock = annotationBlockImpl('annotationBlock', false);

/**
 * [[111]](https://www.w3.org/TR/sparql12-query/#rGraphNode)
 */
export const graphNode: RuleDef<'graphNode', RuleDefReturn<typeof S11.graphNode> | BaseQuadTerm> = <const> {
  name: 'graphNode',
  impl: $ => () => $.OR<RuleDefReturn<typeof S11.graphNode> | BaseQuadTerm>([
    { ALT: () => S11.graphNode.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[112]](https://www.w3.org/TR/sparql12-query/#rGraphNodePath)
 */
export const graphNodePath: RuleDef<'graphNodePath', RuleDefReturn<typeof S11.graphNodePath> | BaseQuadTerm> = <const> {
  name: 'graphNodePath',
  impl: $ => () => $.OR<RuleDefReturn<typeof S11.graphNodePath> | BaseQuadTerm>([
    { ALT: () => S11.graphNodePath.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[113]](https://www.w3.org/TR/sparql12-query/#rVarOrTerm)
 */
export const varOrTerm: typeof S11.varOrTerm = <const> {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR, CONSUME, context }) => () => OR<Term>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => {
      CONSUME(l.terminals.nil);
      return context.dataFactory.namedNode(CommonIRIs.NIL);
    } },
    { ALT: () => SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[114]](https://www.w3.org/TR/sparql12-query/#rReifiedTriple)
 */
export const reifiedTriple: RuleDef<'reifiedTriple', BaseQuadTerm> = <const> {
  name: 'reifiedTriple',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION, context }) => () => {
    CONSUME(l12.reificationOpen);
    const subject = SUBRULE(reifiedTripleSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(reifiedTripleObject);
    const reifierVal = OPTION(() => SUBRULE(reifier));
    CONSUME(l12.reificationClose);

    return ACTION(() => {
      const reifier = reifierVal ?? context.dataFactory.blankNode();
      const tripleTerm = context.dataFactory.quad(subject, predicate, object);
      return context.dataFactory.quad(reifier, context.dataFactory.namedNode(CommonIRIs.REIFIES), tripleTerm);
    });
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleSubject)
 */
export const reifiedTripleSubject:
RuleDef<'reifiedTripleSubject', VariableTerm | IriTerm | LiteralTerm | BlankTerm | BaseQuadTerm> = <const> {
  name: 'reifiedTripleSubject',
  impl: ({ OR, SUBRULE }) => () => OR<VariableTerm | IriTerm | LiteralTerm | BlankTerm | BaseQuadTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
    { ALT: () => SUBRULE(reifiedTriple) },
  ]),
};

/**
 * [[116]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleObject)
 */
export const reifiedTripleObject:
RuleDef<'reifiedTripleObject', VariableTerm | IriTerm | LiteralTerm | BlankTerm | BaseQuadTerm> = <const> {
  name: 'reifiedTripleObject',
  impl: $ => () => $.OR([
    { ALT: () => reifiedTripleSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[117](https://www.w3.org/TR/sparql12-query/#rTripleTerm)
 */
export const tripleTerm: RuleDef<'tripleTerm', BaseQuadTerm> = <const> {
  name: 'tripleTerm',
  impl: ({ CONSUME, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(tripleTermObject);
    CONSUME(l12.tripleTermClose);
    return context.dataFactory.quad(subject, predicate, object);
  },
};

/**
 * [[118](https://www.w3.org/TR/sparql12-query/#rTripleTermSubject)
 */
export const tripleTermSubject:
RuleDef<'tripleTermSubject', VariableTerm | IriTerm | LiteralTerm | BlankTerm> = <const> {
  name: 'tripleTermSubject',
  impl: ({ SUBRULE, OR }) => () => OR<VariableTerm | IriTerm | LiteralTerm | BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

/**
 * [[119](https://www.w3.org/TR/sparql12-query/#rTripleTermObject)
 */
export const tripleTermObject:
RuleDef<'tripleTermObject', VariableTerm | IriTerm | LiteralTerm | BlankTerm | BaseQuadTerm> = <const> {
  name: 'tripleTermObject',
  impl: $ => () => $.OR<VariableTerm | IriTerm | LiteralTerm | BlankTerm | BaseQuadTerm>([
    { ALT: () => tripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[120](https://www.w3.org/TR/sparql12-query/#rTripleTermData)
 */
export const tripleTermData: RuleDef<'tripleTermData', BaseQuadTerm> = <const> {
  name: 'tripleTermData',
  impl: ({ ACTION, CONSUME, OR, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(tripleTermDataSubject);
    const predicate = OR([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => {
        CONSUME(l.a);
        return ACTION(() => context.dataFactory.namedNode(CommonIRIs.TYPE));
      } },
    ]);
    const object = SUBRULE(tripleTermDataObject);
    CONSUME(l12.tripleTermClose);

    return ACTION(() => context.dataFactory.quad(subject, predicate, object));
  },
};

/**
 * [[121](https://www.w3.org/TR/sparql12-query/#rTripleTermDataSubject)
 */
export const tripleTermDataSubject: RuleDef<'tripleTermDataSubject', IriTerm | LiteralTerm> = <const> {
  name: 'tripleTermDataSubject',
  impl: ({ OR, SUBRULE }) => () => OR<IriTerm | LiteralTerm>([
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
  ]),
};

/**
 * [[122](https://www.w3.org/TR/sparql12-query/#rTripleTermDataObject)
 */
export const tripleTermDataObject: RuleDef<'tripleTermDataObject', IriTerm | LiteralTerm | BaseQuadTerm> = <const> {
  name: 'tripleTermDataObject',
  impl: $ => () => $.OR<IriTerm | LiteralTerm | BaseQuadTerm>([
    { ALT: () => tripleTermDataSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[134](https://www.w3.org/TR/sparql12-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression', Expression> = <const> {
  name: 'primaryExpression',
  impl: $ => () => $.OR<Expression>([
    { ALT: () => S11.primaryExpression.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

/**
 * [[135](https://www.w3.org/TR/sparql12-query/#rExprTripleTerm)
 */
export const exprTripleTerm: RuleDef<'exprTripleTerm', BaseQuadTerm> = <const> {
  name: 'exprTripleTerm',
  impl: ({ ACTION, CONSUME, SUBRULE, context }) => () => {
    CONSUME(l12.tripleTermOpen);
    const subject = SUBRULE(exprTripleTermSubject);
    const predicate = SUBRULE(S11.verb);
    const object = SUBRULE(exprTripleTermObject);
    CONSUME(l12.tripleTermClose);

    return ACTION(() => context.dataFactory.quad(subject, predicate, object));
  },
};

/**
 * [[136](https://www.w3.org/TR/sparql12-query/#rExprTripleTermSubject)
 */
export const exprTripleTermSubject: RuleDef<'exprTripleTermSubject', IriTerm | VariableTerm | LiteralTerm> = <const> {
  name: 'exprTripleTermSubject',
  impl: ({ OR, SUBRULE }) => () => OR<IriTerm | VariableTerm | LiteralTerm>([
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.var_) },
  ]),
};

/**
 * [[137](https://www.w3.org/TR/sparql12-query/#rExprTripleTermObject)
 */
export const exprTripleTermObject:
RuleDef<'exprTripleTermObject', IriTerm | VariableTerm | LiteralTerm | BaseQuadTerm> = <const> {
  name: 'exprTripleTermObject',
  impl: $ => () => $.OR<IriTerm | VariableTerm | LiteralTerm | BaseQuadTerm>([
    { ALT: () => exprTripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

export const builtinLangDir = funcExpr1(l12.builtinLangDir);
export const builtinLangStrDir = funcExpr3(l12.builtinStrLangDir);
export const builtinIsTriple = funcExpr1(l12.builtinIsTRIPLE);
export const builtinTriple = funcExpr3(l12.builtinTRIPLE);
export const builtinSubject = funcExpr1(l12.builtinSUBJECT);
export const builtinPredicate = funcExpr1(l12.builtinPREDICATE);
export const builtinObject = funcExpr1(l12.builtinOBJECT);

/**
 * [[139](https://www.w3.org/TR/sparql12-query/#rBuiltInCall)
 */
export const builtInCall: RuleDef<'builtInCall', Expression> = <const> {
  name: 'builtInCall',
  impl: $ => () => $.OR<Expression>([
    { ALT: () => S11.builtInCall.impl($)() },
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
export const rdfLiteral: RuleDef<'rdfLiteral', LiteralTerm> = <const> {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, OPTION, CONSUME, OR, context }) => () => {
    const value = SUBRULE(S11.string);
    const langOrDataType = OPTION(() => OR<IriTerm | string>([
      { ALT: () => CONSUME(l12.LANG_DIR).image.slice(1) },
      { ALT: () => {
        CONSUME(l.symbols.hathat);
        return SUBRULE(S11.iri);
      } },
    ]));
    return context.dataFactory.literal(value, langOrDataType);
  },
};
