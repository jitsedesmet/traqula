/**
 * This module will define patch rules that should be used in combination with the sparql11 grammar to create
 * a sparql12 grammar.
 * Rules in this module redefine the return type of core grammar rules.
 * It is therefore essential that the parser retypes the rules from the core grammar.
 */

import * as l from '../../lexer/sparql11/index.js';
import * as l12 from '../../lexer/sparql12/index.js';
import type { RuleDefReturn, RuleDef } from '../builder/ruleDefTypes';
import { funcExpr1, funcExpr3 } from '../expressionHelpers';
import * as S11 from '../sparql11/index';
import type * as T11 from '../sparql11/Sparql11types';
import { CommonIRIs } from '../utils';
import type { BaseQuadTerm, Expression, IGraphNode, Term, Triple, TripleCreatorSP } from './sparql12Types';

export const canParseReifier = Symbol('canParseReifier');

function reifiedTripleBlockImpl<T extends string>(name: T, allowPath: boolean): RuleDef<T, Triple[]> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE }) => () => {
      const triple = SUBRULE(reifiedTriple);
      const properties = SUBRULE(allowPath ? S11.propertyListPath : S11.propertyList);

      return ACTION(() => [
        ...triple.triples,
        ...properties.map(partial => partial({ subject: triple.node })),
      ]);
    },
  };
}
/**
 * [[56]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlock) Used by triplesSameSubject
 */
export const reifiedTripleBlock = reifiedTripleBlockImpl('reifiedTripleBlock', false);
/**
 * [[57]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleBlockPath) Used by TriplesSameSubjectPath
 */
export const reifiedTripleBlockPath = reifiedTripleBlockImpl('reifiedTripleBlockPath', true);

/**
 * OVERRIDING RULE: {@link S11.dataBlockValue}.
 * [[67]](https://www.w3.org/TR/sparql12-query/#rDataBlockValue)
 */
export const dataBlockValue:
RuleDef<'dataBlockValue', RuleDefReturn<typeof S11.dataBlockValue> | BaseQuadTerm> = <const> {
  name: 'dataBlockValue',
  impl: $ => () => $.OR2<RuleDefReturn<typeof S11.dataBlockValue> | BaseQuadTerm>([
    { ALT: () => S11.dataBlockValue.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rReifier)
 */
export const reifier: RuleDef<'reifier', T11.VariableTerm | T11.IriTerm | T11.BlankTerm | undefined> = <const> {
  name: 'reifier',
  impl: ({ ACTION, CONSUME, SUBRULE, OPTION, context }) => () => {
    CONSUME(l12.tilde);
    const result = OPTION(() => SUBRULE(varOrReifierId));
    ACTION(() => {
      if (!context.parseMode.has(canParseReifier)) {
        throw new Error('Reifiers are not allowed in this context');
      }
    });
    return result;
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql12-query/#rVarOrReifierId)
 */
export const varOrReifierId: RuleDef<'varOrReifierId', T11.VariableTerm | T11.IriTerm | T11.BlankTerm> = <const> {
  name: 'varOrReifierId',
  impl: ({ SUBRULE, OR }) => () => OR<T11.VariableTerm | T11.IriTerm | T11.BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

function triplesSameSubjectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<
  T,
  RuleDefReturn<typeof S11.triplesSameSubject>
> {
  return <const> {
    name,
    impl: $ => () => $.OR2([
      { ALT: () => allowPaths ? S11.triplesSameSubjectPath.impl($)() : S11.triplesSameSubject.impl($)() },
      { ALT: () => $.SUBRULE(allowPaths ? reifiedTripleBlockPath : reifiedTripleBlock) },
    ]),
  };
}
/**
 * OVERRIDING RULE {@link S11.triplesSameSubject}
 * [[79]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubject)
 */
export const triplesSameSubject = triplesSameSubjectImpl('triplesSameSubject', false);
/**
 * OVERRIDING RULE {@link S11.triplesSameSubjectPath}
 * [[85]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath = triplesSameSubjectImpl('triplesSameSubjectPath', true);

function objectImpl<T extends string>(name: T, allowPaths: boolean): RuleDef<T, TripleCreatorSP[]> {
  return <const>{
    name,
    impl: ({ ACTION, SUBRULE, context }) => () => {
      const objectVal = SUBRULE(allowPaths ? graphNodePath : graphNode);
      const annotationVal = SUBRULE(allowPaths ? annotationPath : annotation);
      return ACTION(() => {
        const result: TripleCreatorSP[] = [
          ({ subject, predicate }) => ({ subject, predicate, object: objectVal.node }),
          ...objectVal.triples.map(triple => () => triple),
        ];
        if (annotationVal.length > 0) {
          for (const annotation of annotationVal) {
            const blankNode = context.dataFactory.blankNode();
            if ('annotation' in annotation) {
              result.push(...annotation.annotation.flatMap(partial => () => partial({ subject: blankNode })));
              // TODO: Adding this as a quad instead of a triple is a hack to make the tests pass
              result.push(({ subject, predicate }) => <Triple> context.dataFactory.quad(
                blankNode,
                context.dataFactory.namedNode(CommonIRIs.REIFIES),
                context.dataFactory.quad(
                  subject,
                  <Exclude<typeof predicate, T11.PropertyPath>>predicate,
                  objectVal.node,
                ),
              ));
            }
          }
        }
        return result;
      });
    },
  };
}
/**
 * OVERRIDING RULE: {@link S11.object}.
 * [[84]](https://www.w3.org/TR/sparql12-query/#rObject) Used by ObjectList
 */
export const object = objectImpl('object', false);
/**
 * OVERRIDING RULE: {@link S11.objectPath}.
 * [[91]](https://www.w3.org/TR/sparql12-query/#rTriplesSameSubjectPath) Used by ObjectListPath
 */
export const objectPath = objectImpl('objectPath', true);

export type Annotation = {
  reifier: RuleDefReturn<typeof reifier>;
} | {
  annotation: RuleDefReturn<typeof annotationBlock>;
};
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
/**
 * [[107]](https://www.w3.org/TR/sparql12-query/#rAnnotationPath)
 */
export const annotationPath = annotationImpl('annotationPath', true);
/**
 * [[109]](https://www.w3.org/TR/sparql12-query/#rAnnotation)
 */
export const annotation = annotationImpl('annotation', false);

function annotationBlockImpl<T extends string>(name: T, allowPaths: boolean):
RuleDef<T, RuleDefReturn<typeof S11.propertyListPathNotEmpty>> {
  return <const> {
    name,
    impl: ({ ACTION, SUBRULE, CONSUME, context }) => () => {
      CONSUME(l12.annotationOpen);
      const res = SUBRULE(allowPaths ? S11.propertyListPathNotEmpty : S11.propertyListNotEmpty);
      CONSUME(l12.annotationClose);
      ACTION(() => {
        if (!context.parseMode.has(canParseReifier)) {
          throw new Error('Reifiers are not allowed in this context');
        }
      });
      return res;
    },
  };
}
/**
 * [[108]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlockPath)
 */
export const annotationBlockPath = annotationBlockImpl('annotationBlockPath', true);
/**
 * [[110]](https://www.w3.org/TR/sparql12-query/#rAnnotationBlock)
 */
export const annotationBlock = annotationBlockImpl('annotationBlock', false);

/**
 * OVERRIDING RULE: {@link S11.graphNode}.
 * [[111]](https://www.w3.org/TR/sparql12-query/#rGraphNode)
 */
export const graphNode: RuleDef<'graphNode', IGraphNode> = <const> {
  name: 'graphNode',
  impl: $ => () => $.OR2 <IGraphNode>([
    { ALT: () => S11.graphNode.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};
/**
 * OVERRIDING RULE: {@link S11.graphNodePath}.
 * [[112]](https://www.w3.org/TR/sparql12-query/#rGraphNodePath)
 */
export const graphNodePath: RuleDef<'graphNodePath', IGraphNode> = <const> {
  name: 'graphNodePath',
  impl: $ => () => $.OR2<IGraphNode>([
    { ALT: () => S11.graphNodePath.impl($)() },
    { ALT: () => $.SUBRULE(reifiedTriple) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.varOrTerm}.
 * [[113]](https://www.w3.org/TR/sparql12-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef<'varOrTerm', Term> = <const> {
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
export const reifiedTriple:
RuleDef<'reifiedTriple', IGraphNode & { node: T11.BlankTerm | T11.VariableTerm | T11.IriTerm }> = <const> {
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
      return {
        node: reifier,
        triples: [
          <Triple> context.dataFactory.quad(reifier, context.dataFactory.namedNode(CommonIRIs.REIFIES), tripleTerm),
        ],
      };
    });
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleSubject)
 */
export const reifiedTripleSubject:
RuleDef<'reifiedTripleSubject', T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm | BaseQuadTerm> =
  <const> {
    name: 'reifiedTripleSubject',
    impl: ({ OR, SUBRULE }) => () =>
      OR<T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm | BaseQuadTerm>([
        { ALT: () => SUBRULE(S11.var_) },
        { ALT: () => SUBRULE(S11.iri) },
        { ALT: () => SUBRULE(rdfLiteral) },
        { ALT: () => SUBRULE(S11.numericLiteral) },
        { ALT: () => SUBRULE(S11.booleanLiteral) },
        { ALT: () => SUBRULE(S11.blankNode) },
        { ALT: () => SUBRULE(reifiedTriple).node },
      ]),
  };

/**
 * [[116]](https://www.w3.org/TR/sparql12-query/#rReifiedTripleObject)
 */
export const reifiedTripleObject:
RuleDef<'reifiedTripleObject', RuleDefReturn<typeof reifiedTripleSubject>> =
  <const> {
    name: 'reifiedTripleObject',
    impl: $ => () => $.OR2([
      { ALT: () => reifiedTripleSubject.impl($)() },
      { ALT: () => $.SUBRULE(tripleTerm) },
    ]),
  };

/**
 * [[117]](https://www.w3.org/TR/sparql12-query/#rTripleTerm)
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
 * [[118]](https://www.w3.org/TR/sparql12-query/#rTripleTermSubject)
 */
export const tripleTermSubject:
RuleDef<'tripleTermSubject', T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm> = <const> {
  name: 'tripleTermSubject',
  impl: ({ SUBRULE, OR }) => () => OR<T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm>([
    { ALT: () => SUBRULE(S11.var_) },
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
    { ALT: () => SUBRULE(S11.blankNode) },
  ]),
};

/**
 * [[119]](https://www.w3.org/TR/sparql12-query/#rTripleTermObject)
 */
export const tripleTermObject:
RuleDef<'tripleTermObject', RuleDefReturn<typeof tripleTermSubject> | BaseQuadTerm> = <const> {
  name: 'tripleTermObject',
  impl: $ => () => $.OR2<T11.VariableTerm | T11.IriTerm | T11.LiteralTerm | T11.BlankTerm | BaseQuadTerm>([
    { ALT: () => tripleTermSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTerm) },
  ]),
};

/**
 * [[120]](https://www.w3.org/TR/sparql12-query/#rTripleTermData)
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
 * [[121]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataSubject)
 */
export const tripleTermDataSubject: RuleDef<'tripleTermDataSubject', T11.IriTerm | T11.LiteralTerm> = <const> {
  name: 'tripleTermDataSubject',
  impl: ({ OR, SUBRULE }) => () => OR<T11.IriTerm | T11.LiteralTerm>([
    { ALT: () => SUBRULE(S11.iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(S11.numericLiteral) },
    { ALT: () => SUBRULE(S11.booleanLiteral) },
  ]),
};

/**
 * [[122]](https://www.w3.org/TR/sparql12-query/#rTripleTermDataObject)
 */
export const tripleTermDataObject:
RuleDef<'tripleTermDataObject', RuleDefReturn<typeof tripleTermDataSubject> | BaseQuadTerm> = <const> {
  name: 'tripleTermDataObject',
  impl: $ => () => $.OR2<T11.IriTerm | T11.LiteralTerm | BaseQuadTerm>([
    { ALT: () => tripleTermDataSubject.impl($)() },
    { ALT: () => $.SUBRULE(tripleTermData) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.primaryExpression}.
 * [[134]](https://www.w3.org/TR/sparql12-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression', Expression> = <const> {
  name: 'primaryExpression',
  impl: $ => () => $.OR2<Expression>([
    { ALT: () => S11.primaryExpression.impl($)() },
    { ALT: () => $.SUBRULE(exprTripleTerm) },
  ]),
};

/**
 * [[135]](https://www.w3.org/TR/sparql12-query/#rExprTripleTerm)
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
 * [[136]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermSubject)
 */
export const exprTripleTermSubject:
RuleDef<'exprTripleTermSubject', T11.IriTerm | T11.VariableTerm | T11.LiteralTerm> = <const> {
  name: 'exprTripleTermSubject',
  impl: ({ OR, SUBRULE }) => () =>
    OR<T11.IriTerm | T11.VariableTerm | T11.LiteralTerm>([
      { ALT: () => SUBRULE(S11.iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(S11.numericLiteral) },
      { ALT: () => SUBRULE(S11.booleanLiteral) },
      { ALT: () => SUBRULE(S11.var_) },
    ]),
};

/**
 * [[137]](https://www.w3.org/TR/sparql12-query/#rExprTripleTermObject)
 */
export const exprTripleTermObject:
RuleDef<'exprTripleTermObject', RuleDefReturn<typeof exprTripleTermSubject> | BaseQuadTerm> = <const> {
  name: 'exprTripleTermObject',
  impl: $ => () =>
    $.OR2<T11.IriTerm | T11.VariableTerm | T11.LiteralTerm | BaseQuadTerm>([
      { ALT: () => exprTripleTermSubject.impl($)() },
      { ALT: () => $.SUBRULE(exprTripleTerm) },
    ]),
};

export const builtinLangDir = funcExpr1(l12.builtinLangDir);
export const builtinLangStrDir = funcExpr3(l12.builtinStrLangDir);
export const builtinHasLang = funcExpr1(l12.builtinHasLang);
export const builtinHasLangDir = funcExpr1(l12.builtinHasLangDir);
export const builtinIsTriple = funcExpr1(l12.builtinIsTRIPLE);
export const builtinTriple = funcExpr3(l12.builtinTRIPLE);
export const builtinSubject = funcExpr1(l12.builtinSUBJECT);
export const builtinPredicate = funcExpr1(l12.builtinPREDICATE);
export const builtinObject = funcExpr1(l12.builtinOBJECT);

/**
 * OVERRIDING RULE: {@link S11.builtInCall}.
 * [[139]](https://www.w3.org/TR/sparql12-query/#rBuiltInCall)
 */
export const builtInCall: typeof S11.builtInCall = <const> {
  name: 'builtInCall',
  impl: $ => () => $.OR2<T11.Expression>([
    { ALT: () => S11.builtInCall.impl($)() },
    { ALT: () => $.SUBRULE(builtinLangDir) },
    { ALT: () => $.SUBRULE(builtinLangStrDir) },
    { ALT: () => $.SUBRULE(builtinHasLang) },
    { ALT: () => $.SUBRULE(builtinHasLangDir) },
    { ALT: () => $.SUBRULE(builtinIsTriple) },
    { ALT: () => $.SUBRULE(builtinTriple) },
    { ALT: () => $.SUBRULE(builtinSubject) },
    { ALT: () => $.SUBRULE(builtinPredicate) },
    { ALT: () => $.SUBRULE(builtinObject) },
  ]),
};

/**
 * OVERRIDING RULE: {@link S11.rdfLiteral}.
 * No retyping is needed since the return type is the same
 * [[147]](https://www.w3.org/TR/sparql12-query/#rRDFLiteral)
 */
export const rdfLiteral: typeof S11.rdfLiteral = <const> {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, OPTION, CONSUME, OR, context }) => () => {
    const value = SUBRULE(S11.string);
    const langOrDataType = OPTION(() => OR<T11.IriTerm | string>([
      { ALT: () => CONSUME(l12.LANG_DIR).image.slice(1) },
      { ALT: () => {
        CONSUME(l.symbols.hathat);
        return SUBRULE(S11.iri);
      } },
    ]));
    return context.dataFactory.literal(value, langOrDataType);
  },
};
